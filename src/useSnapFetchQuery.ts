/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DataCache,
  EndpointKey,
  RequestOptions,
  RequestPayload,
  SnapFetchResult,
} from "./types/types";
import { actions } from "./toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  selectQueriesData,
  selectSnapFetchApiConfig,
} from "./selectors/selectors";

import { usePagination } from "./utils/usePagination";
import { isEmpty, isEqual } from "./utils/utils";

const dataCache: DataCache = {};

export const useSnapFetchQuery = <T>(
  endpoint: EndpointKey,
  requestOptions: RequestOptions = {}
): SnapFetchResult<T> => {
  const dispatch = useDispatch();
  const snapFetchData = useSelector((state: any) =>
    selectQueriesData(state, endpoint)
  );

  const {
    baseUrl,
    disableCaching: baseDisableCaching,
    customFetchFunction,
    ...rest
  } = useSelector(selectSnapFetchApiConfig);

  /** @PaginationSection */
  const paginationOptions = usePagination({
    data: snapFetchData?.data?.data,
    total: snapFetchData?.data?.total as number,
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

  const filterString = JSON.stringify(filter);
  const paginationStringSize = JSON.stringify(paginationOptions?.size);
  const paginationStringPageNo = JSON.stringify(paginationOptions.pageNo);
  const allFilters = `${filterString}${paginationStringPageNo}${paginationStringSize}`;
  const tagsString = JSON.stringify(tags);
  const fetchFunctionString = JSON.stringify(customFetchFunction);

  /**@Refs */
  const filterRef = useRef(filter);
  const pageNoRef = useRef(paginationOptions.pageNo);
  const sizeRef = useRef(paginationOptions.size);

  const fetchData = useCallback(async () => {
    if (
      baseUrl &&
      (!dataCache[endpoint]?.alreadyExecuted ||
        !isEqual(allFilters, dataCache[endpoint]?.filters))
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
      };

      dataCache[endpoint] = {
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
  }, [
    endpoint,
    fetchFunctionString,
    tagsString,
    paginationStringPageNo,
    paginationStringSize,
    dispatch,
    effect,
    searchTerm,
    filterString,
    baseUrl,
  ]);

  /**@AdditionalChecks */

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
  }, [fetchData, skip, disableCaching, queryParamsChanged]);

  useEffect(() => {
    if (!disableCaching && !skip) {
      if (isEmpty(snapFetchData.data)) {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableCaching, isEmpty(snapFetchData.data), fetchData, skip]);

  /**@Polling */

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
        fetchData();
      }, pollingInterval * 1000);
    }
  }, [pollingInterval, fetchData, stopTimer]);

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
