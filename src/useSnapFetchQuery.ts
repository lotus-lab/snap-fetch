/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DataCache,
  EndpointKey,
  RequestOptions,
  RequestPayload,
  SnapFetchResult,
} from "./types/types";
import { actions } from "./toolkit";
import {
  selectQueriesData,
  selectSnapFetchApiConfig,
} from "./selectors/selectors";

import { usePagination } from "./utils/usePagination";
import { isEmpty, isEqual } from "./utils/utils";
import { useGenHashKey } from "./useGenHashKey";

const dataCache: DataCache = {};

export const useSnapFetchQuery = <T>(
  endpoint: EndpointKey,
  requestOptions: RequestOptions = {}
): SnapFetchResult<T> => {
  const dispatch = useDispatch();

  const filterString = useMemo(
    () => JSON.stringify(requestOptions.filter ?? {}),
    [requestOptions.filter]
  );

  const hashInputString = useMemo(
    () => `${endpoint}${filterString}`,
    [endpoint, filterString]
  );

  const { hashKey } = useGenHashKey(hashInputString);

  const snapFetchData = useSelector((state: any) =>
    selectQueriesData(state, hashKey)
  );

  const hasNoCacheData = useMemo(
    () => isEmpty(snapFetchData.data),
    [snapFetchData?.data]
  );

  const baseConfig = useSelector(selectSnapFetchApiConfig);

  const {
    baseUrl,
    disableCaching: baseDisableCaching,
    customFetchFunction,
    ...rest
  } = baseConfig ?? {};

  /** @PaginationSection */
  const paginationOptions = usePagination({
    pageNo: snapFetchData?.pagination?.pageNo,
    size: snapFetchData?.pagination?.size,
    data: snapFetchData?.data?.data,
    total: snapFetchData?.data?.total as number,
    hashKey,
  });

  const {
    tags,
    filter = {},
    skip = false,
    searchTerm,
    effect = "takeEvery",
    disableCaching = baseDisableCaching ?? false,
    single,
    pollingInterval,
  } = requestOptions;

  const paginationOptionString = useMemo(
    () => JSON.stringify(paginationOptions),
    [paginationOptions]
  );
  const paginationStringSize = useMemo(
    () => JSON.stringify(paginationOptions?.size),
    [paginationOptions?.size]
  );
  const paginationStringPageNo = useMemo(
    () => JSON.stringify(paginationOptions.pageNo),
    [paginationOptions?.pageNo]
  );

  const allFilters = useMemo(() => {
    return `${filterString}${paginationStringPageNo}${paginationStringSize}`;
  }, [filterString, paginationStringSize, paginationStringPageNo]);

  const tagsString = useMemo(() => JSON.stringify(tags), [tags]);
  const fetchFunctionString = useMemo(
    () => JSON.stringify(customFetchFunction),
    [customFetchFunction]
  );

  /** @Refs */
  const filterRef = useRef(filter);
  const pageNoRef = useRef(paginationOptions.pageNo);
  const sizeRef = useRef(paginationOptions.size);

  const fetchData = useCallback(
    async (isPolling?: boolean) => {
      if (
        (hashKey &&
          baseUrl &&
          (!dataCache[hashKey]?.alreadyExecuted ||
            !isEqual(allFilters, dataCache[hashKey]?.filters))) ||
        isPolling
      ) {
        const queryParams = new URLSearchParams("");
        if (searchTerm) {
          queryParams.set(searchTerm, encodeURIComponent(searchTerm));
        }

        if (filter) {
          Object.keys(filter).forEach((key) => {
            if (filter[key] !== undefined && filter[key] !== "")
              queryParams.set(key, filter[key] as string);
          });
        }

        if (paginationOptions.pageNo && !single) {
          queryParams.set("pageNo", `${paginationOptions.pageNo ?? ""}`);
        }
        if (paginationOptions.size && !single) {
          queryParams.set("size", `${paginationOptions.size ?? ""}`);
        }

        const payload: RequestPayload = {
          endpoint,
          ...rest,
          tags,
          fetchFunctionIsOutsider: !!customFetchFunction,
          query: true,
          mutation: false,
          queryParams,
          hashKey,
          pagination: {
            pageNo: paginationOptions.pageNo,
            size: paginationOptions.size,
            currentShowingItems: paginationOptions.currentShowingItems,
            totalItems: paginationOptions.totalItems,
            lastPage: paginationOptions.lastPage,
          },
        };

        dataCache[hashKey] = {
          alreadyExecuted: true,
          filters: allFilters,
        };

        switch (effect) {
          case "takeLatest":
            dispatch(actions.takeLatestRequest(payload));
            break;
          case "takeLeading":
            dispatch(actions.takeLeadingRequest(payload));
            break;
          default:
            dispatch(actions.takeEveryRequest(payload));
        }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      endpoint,
      fetchFunctionString,
      tagsString,
      paginationOptionString,
      effect,
      searchTerm,
      filterString,
      baseUrl,
      hashKey,
    ]
  );

  /** @AdditionalChecks */

  const queryParamsChanged = useMemo(() => {
    if (
      (!skip && !isEqual(filter, filterRef.current)) ||
      (!skip && !isEqual(pageNoRef.current, paginationOptions.pageNo)) ||
      (!skip && !isEqual(sizeRef.current, paginationOptions.size))
    ) {
      return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    skip,
    filterString,
    paginationStringPageNo,
    paginationStringSize,
    pageNoRef,
    filterRef,
  ]);

  useEffect(() => {
    if ((!skip && disableCaching) || queryParamsChanged) {
      fetchData();
    }
    if (!disableCaching && !skip) {
      if (hasNoCacheData) {
        fetchData();
      }
    }
  }, [fetchData, skip, disableCaching, queryParamsChanged, hasNoCacheData]);

  useEffect(() => {
    return () => {
      delete dataCache[hashKey];
    };
  }, [hashKey]);

  /** @Polling */

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();

    if (pollingInterval) {
      timerRef.current = setInterval(() => {
        fetchData(true);
      }, pollingInterval * 1000);
    }
  }, [pollingInterval, fetchData, stopTimer, hashKey]);

  useEffect(() => {
    startTimer();

    return () => {
      stopTimer();
    };
  }, [fetchData, startTimer, stopTimer]);

  return {
    refetch: fetchData,
    paginationOptions,
    ...snapFetchData,
  };
};
