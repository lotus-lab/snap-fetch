/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import {
  EndpointKey,
  Pagination,
  RequestOptions,
  RequestPayload,
} from "./types";
import { actions } from ".";
import { useDispatch, useSelector } from "react-redux";
import { selectQueriesData, selectRqueryApiConfig } from "./selectors";
import { RqueryResult } from "./types";
import { usePagination } from "./utils/usePagination";
import { isEmpty } from "lodash";

export const useRQuery = <T>(
  endpoint: EndpointKey,
  requestOptions: RequestOptions = {}
): RqueryResult<T> => {
  const dispatch = useDispatch();
  const rqueryData = useSelector((state: any) =>
    selectQueriesData(state, endpoint)
  );

  const {
    baseUrl,
    expirationTime: baseExpirationTime,
    disableCaching: baseDisableCaching,
    customFetchFunction,
    ...rest
  } = useSelector(selectRqueryApiConfig);

  /** @PaginationSection */
  const paginationOptions = usePagination({
    data: rqueryData?.data?.data,
    total: rqueryData?.data?.total as number,
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
  const paginationStringSize = JSON.stringify(rqueryData.pagination?.size);
  const paginationStringPageNo = JSON.stringify(rqueryData.pagination?.pageNo);
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

      if (rqueryData?.pagination) {
        Object.keys(rqueryData?.pagination).forEach((key) => {
          if (rqueryData?.pagination?.[key as keyof Pagination] !== undefined)
            queryParams.set(
              key,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              rqueryData?.pagination?.[key] as string
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
      if (isEmpty(rqueryData.data)) {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, skip, isEmpty(rqueryData.data), disableCaching]);

  return {
    refetch: fetchData,
    paginationOptions,
    ...rqueryData,
  };
};
