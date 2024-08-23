/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import type {
  RefetchOptions,
  RequestOptions,
  FetchResult,
} from "./types/types";
import { selectQueriesData } from "./selectors/selectors";

import { useGenHashKey } from "./useGenHashKey";
import { usePolling } from "./utils/usePolling";
import { useCacheInvalidate } from "./utils/useCacheInvalidate";
import { suffixCache } from "./saga/saga";
import { actions } from "./toolkit";
import { usePagination } from "./utils/usePagination";
import { useQueryAction } from "./utils/queryHooks/useQueryAction";
import { useQueryPayload } from "./utils/queryHooks/useQueryPayload";
import { useQueryNetworkStatus } from "./utils/queryHooks/useQueryNetworkStatus";

export const newActions: Array<ActionCreatorWithPayload<any, string>> = [];

/**
 * A custom React hook that provides a way to fetch data using a saga-based approach.
 *
 * This hook manages the lifecycle of a data fetch, including caching, refetching, and polling. It also provides options for pagination and handling network status changes.
 * @Generic <T, ActualApiRes = unknown>
 * @param endpoint - The API endpoint to fetch data from.
 * @param requestOptions - An object containing options for the data fetch, such as filters, pagination, and polling.
 * @returns An object containing the fetched data, refetch and clear functions, pagination options, and the dispatch function.
 */
export const useSnapQuery = <T, ActualApiRes = unknown>(
  endpoint: string,
  requestOptions: RequestOptions<T, ActualApiRes> = {}
): FetchResult<T> => {
  const dispatch = useDispatch();
  const filterString = useMemo(
    () => JSON.stringify(requestOptions?.filter ?? {}),
    [JSON.stringify(requestOptions?.filter)]
  );

  const hashInputString = useMemo(
    () => `${endpoint}${requestOptions.tag}${filterString}`,
    [endpoint, filterString]
  );

  const { hashKey } = useGenHashKey(hashInputString);

  const sagaQueryData = useSelector((state: unknown) =>
    selectQueriesData(state, hashKey)
  );

  const payload = useQueryPayload({
    endpoint,
    requestOptions,
    hashKey,
    sagaQueryData,
  });
  const actionCreated = useQueryAction(payload);

  const paginationOptions = usePagination({
    hashKey,
    pageNo: sagaQueryData.pagination?.pageNo,
    size: sagaQueryData.pagination?.size,
    total: sagaQueryData.data?.total ?? 10,
    usePagination: requestOptions.usePagination,
  });

  useEffect(() => {
    actionCreated();
  }, [actionCreated]);

  /**
   * Refetches the data associated with the provided `endpoint` by first deleting the cache entry for the `endpoint`, then dispatching an action to trigger a refetch of the data.
   *
   * This function is typically used when the user requests a manual refetch of the data, or when the cache for the data has expired and needs to be refreshed.
   */
  const refetch = useCallback(
    ({ resetPagination, staleWhileRevalidate }: RefetchOptions = {}) => {
      if (hashKey) {
        suffixCache.delete(hashKey);
        actionCreated({ skip: false, resetPagination, staleWhileRevalidate });
      }
    },
    [hashKey, actionCreated]
  );

  /** @RefetchOnReconnect */
  useQueryNetworkStatus(refetch, payload.disableRefetchOnReconnect);

  /** @Polling */
  usePolling({
    refetch,
    pollingInterval: requestOptions.pollingInterval,
  });

  /** @CacheTimeLimitChecker */
  /**
   * Invalidates the cache for the current query based on the provided options.
   *
   * This function is used to clear the cache for the current query when certain conditions are met, such as when the cache expiration time has elapsed or when the user requests a refetch.
   *
   * @param cacheExpirationTime - The time in milliseconds after which the cache should be considered expired and invalidated.
   * @param refetch - A function that can be called to trigger a refetch of the data.
   * @param sagaQueryData - The current data fetched from the saga.
   */
  useCacheInvalidate({
    cacheExpirationTime: payload?.cacheExpirationTime,
    hashKey,
    createdAt: sagaQueryData?.createdAt,
    refetch,
  });

  /**
   * Clears the cache and state associated with the provided `hashKey`.
   *
   * This function first deletes the cache entry for the `hashKey`, then dispatches an action to clear the corresponding state in the application.
   *
   * @param hashKey - The unique identifier for the cached data to be cleared.
   */
  const clear = useCallback(() => {
    if (hashKey) {
      new Promise((resolve) => {
        suffixCache.delete(hashKey);
        resolve(true);
      }).then(() => {
        dispatch(
          actions.clearState({
            hashKey,
            query: true,
          })
        );
      });
    }
  }, [hashKey]);

  return {
    refetch,
    clear,
    paginationOptions,
    dispatch,
    ...sagaQueryData,
  };
};
