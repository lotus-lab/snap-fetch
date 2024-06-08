/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PayloadType, RequestOptions, SnapResult } from "./types/types";
import { selectQueriesData, selectSnapApiConfig } from "./selectors/selectors";

import { useGenHashKey } from "./useGenHashKey";
import { usePolling } from "./utils/usePolling";
import { useCacheInvalidate } from "./utils/useCacheInvalidate";
import { useNetworkStatus } from "./utils/useNetworkStatus";
import { ActionCreatorWithPayload, createAction } from "@reduxjs/toolkit";
import { suffixCache } from "./saga/saga";
import { actions } from "./toolkit";
import { usePagination } from "./utils/usePagination";

export const newActions: Array<ActionCreatorWithPayload<any, string>> = [];

export const useSnapQuery = <T, ActualApiRes = unknown>(
  endpoint: string,
  requestOptions: RequestOptions<T, ActualApiRes> = {}
): SnapResult<T> => {
  const baseConfig = useSelector(selectSnapApiConfig);
  const requestOptString = JSON.stringify(requestOptions);
  const baseApiString = JSON.stringify(baseConfig);
  const dispatch = useDispatch();
  const { isOnline } = useNetworkStatus();

  const onlineRef = useRef(isOnline);

  const filterString = useMemo(
    () => JSON.stringify(requestOptions.filter ?? {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(requestOptions.filter)]
  );

  const hashInputString = useMemo(
    () => `${endpoint}${filterString}`,
    [endpoint, filterString]
  );

  const { hashKey } = useGenHashKey(hashInputString);

  const [payload, setPayload] = useState<PayloadType<T, ActualApiRes>>({
    ...baseConfig,
    ...requestOptions,
    endpoint,
    query: true,
    mutation: false,
    hashKey,
    fetchFunctionIsOutsider: requestOptions.fetchFunction ? true : false,
  });

  const SnapFetchData = useSelector((state: unknown) =>
    selectQueriesData(state, hashKey)
  );

  const actionCreated = useCallback(
    (skip?: boolean) => {
      if (payload.hashKey) {
        const hashKeyAction = createAction<
          PayloadType<T, ActualApiRes> | undefined
        >(`hash-${payload.hashKey}`);

        dispatch(
          hashKeyAction({
            ...payload,
            skip: skip ?? payload.skip,
          })
        );
      }
    },
    [JSON.stringify(payload)]
  );

  const paginationOptions = usePagination({
    hashKey,
    pageNo: SnapFetchData.pagination?.pageNo,
    size: SnapFetchData.pagination?.size,
    total: 10,
  });

  useEffect(() => {
    const initPayload = {
      ...baseConfig,
      ...requestOptions,
      endpoint,
      query: true,
      mutation: false,
      hashKey,
      fetchFunctionIsOutsider: requestOptions.fetchFunction ? true : false,
      createdAt: new Date(),
      pagination: {
        pageNo: SnapFetchData.pagination?.pageNo ?? 1,
        size: SnapFetchData.pagination?.size ?? 10,
      },
    };
    setPayload(initPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requestOptString,
    baseApiString,
    hashKey,
    endpoint,
    SnapFetchData.pagination?.pageNo,
    SnapFetchData.pagination?.size,
  ]);

  useEffect(() => {
    actionCreated();
  }, [actionCreated]);

  const networkStatusChanged = useMemo(() => {
    if (isOnline !== onlineRef.current) {
      onlineRef.current = isOnline;
      return true;
    }
    return false;
  }, [isOnline]);

  const refetch = () => {
    if (hashKey) {
      suffixCache.delete(hashKey);
      actionCreated(false);
    }
  };

  /** @RefetchOnReconnect */
  useEffect(() => {
    if (isOnline && networkStatusChanged) {
      refetch();
    }
  }, [networkStatusChanged, isOnline]);

  /** @Polling */
  usePolling({
    refetch,
    pollingInterval: requestOptions.pollingInterval,
  });

  /**@CacheTimeLimitChecker */
  useCacheInvalidate({
    cacheExpirationTime: payload?.cacheExpirationTime,
    refetch,
    SnapFetchData,
  });

  const clear = useCallback(() => {
    if (hashKey) {
      dispatch(
        actions.clearState({
          hashKey,
          query: true,
        })
      );
    }
  }, [hashKey, dispatch]);

  return {
    refetch,
    clear,
    paginationOptions,
    dispatch,
    ...SnapFetchData,
  };
};
