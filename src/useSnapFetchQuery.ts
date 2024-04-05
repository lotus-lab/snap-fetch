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
import { usePolling } from "./utils/usePolling";
import { useCacheInvalidate } from "./utils/useCacheInvalidate";

const dataCache: DataCache = {};

export const useSnapFetchQuery = <T, ActualApiRes = T>(
  endpoint: EndpointKey,
  requestOptions: RequestOptions<T, ActualApiRes> = {}
): SnapFetchResult<T> => {
  const dispatch = useDispatch();

  const filterString = useMemo(
    () => JSON.stringify(requestOptions.filter ?? {}),
    [JSON.stringify(requestOptions.filter)]
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
    [JSON.stringify(snapFetchData?.data)]
  );

  const baseConfig = useSelector(selectSnapFetchApiConfig);

  const {
    baseUrl: baseConfigBaseUrl,
    disableCaching: baseDisableCaching,
    customFetchFunction,
    cacheExpirationTime: baseExpirationTime = 120,
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
    effect = "takeEvery",
    disableCaching = baseDisableCaching ?? false,
    single,
    pollingInterval,
    baseUrl = baseConfigBaseUrl,
    cacheExpirationTime = baseExpirationTime,
    transformResponse,
  } = requestOptions;

  const paginationStringSize = useMemo(
    () => JSON.stringify(paginationOptions?.size),
    [paginationOptions?.size]
  );

  const paginationStringPageNo = useMemo(
    () => JSON.stringify(paginationOptions?.pageNo),
    [paginationOptions?.pageNo]
  );

  const allFilters = useMemo(() => {
    return `${filterString}${paginationStringPageNo}${paginationStringSize}`;
  }, [filterString, paginationStringSize, paginationStringPageNo]);

  const fetchFunctionString = useMemo(
    () => JSON.stringify(customFetchFunction),
    [customFetchFunction]
  );
  const transformResponseString = useMemo(
    () => JSON.stringify(transformResponse),
    [transformResponse]
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
          baseUrl,
          cacheExpirationTime,
          //@ts-ignore
          transformResponse,
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
    },
    [
      endpoint,
      fetchFunctionString,
      transformResponseString,
      tags,
      allFilters,
      effect,
      baseUrl,
      hashKey,
      single,
    ]
  );

  /** @AdditionalChecks */

  const queryParamsChanged = useMemo(() => {
    if (
      !skip &&
      (!isEqual(filter, filterRef.current) ||
        !isEqual(pageNoRef.current, paginationOptions.pageNo) ||
        !isEqual(sizeRef.current, paginationOptions.size))
    ) {
      pageNoRef.current = paginationOptions.pageNo;
      sizeRef.current = paginationOptions.size;
      filterRef.current = filter;
      return true;
    }
    return false;
  }, [skip, filterString, paginationStringPageNo, paginationStringSize]);

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
  usePolling({
    fetchData,
    pollingInterval,
  });
  /**@CacheTimeLimitChecker */
  useCacheInvalidate({
    cacheExpirationTime,
    fetchData,
    snapFetchData,
  });

  return {
    refetch: fetchData,
    paginationOptions,
    ...snapFetchData,
  };
};
