/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import {
  EndpointKey,
  Pagination,
  RequestOptions,
  RequestPayload,
} from "./types/types";
import { actions } from "./index";
import { useDispatch, useSelector } from "react-redux";
import {
  selectQueriesData,
  selectCacheBoltApiConfig,
} from "./selectors/selectors";
import { CacheBoltResult } from "./types/types";
import { usePagination } from "./utils/usePagination";
import { isEmpty } from "lodash";

export const useCacheBoltQuery = <T>(
  endpoint: EndpointKey,
  requestOptions: RequestOptions = {}
): CacheBoltResult<T> => {
  const dispatch = useDispatch();
  const CacheBoltData = useSelector((state: any) =>
    selectQueriesData(state, endpoint)
  );

  const {
    baseUrl,
    expirationTime: baseExpirationTime,
    disableCaching: baseDisableCaching,
    customFetchFunction,
    ...rest
  } = useSelector(selectCacheBoltApiConfig);

  /** @PaginationSection */
  const paginationOptions = usePagination({
    data: CacheBoltData?.data?.data,
    total: CacheBoltData?.data?.total as number,
  });

  const {
    tags,
    filter = {},
    skip,
    expirationTime = baseExpirationTime,
    searchTerm,
    effect = "takeEvery",
    disableCaching = baseDisableCaching,
  } = requestOptions;

  const filterString = JSON.stringify(filter);
  const paginationStringSize = JSON.stringify(CacheBoltData.pagination?.size);
  const paginationStringPageNo = JSON.stringify(
    CacheBoltData.pagination?.pageNo
  );
  const tagsString = JSON.stringify(tags);
  const fetchFunctionString = JSON.stringify(customFetchFunction);

  const fetchData = useCallback(async () => {
    if (baseUrl) {
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

      if (CacheBoltData?.pagination) {
        Object.keys(CacheBoltData?.pagination).forEach((key) => {
          if (
            CacheBoltData?.pagination?.[key as keyof Pagination] !== undefined
          )
            queryParams.set(
              key,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              CacheBoltData?.pagination?.[key] as string
            );
        });
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
    expirationTime,
  ]);

  useEffect(() => {
    if (!skip && disableCaching) {
      fetchData();
    } else if (!disableCaching && !skip) {
      if (isEmpty(CacheBoltData.data)) {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, skip, isEmpty(CacheBoltData.data), disableCaching]);

  return {
    refetch: fetchData,
    paginationOptions,
    ...CacheBoltData,
  };
};
