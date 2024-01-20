/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";
import { EndpointKey, RequestOptions, RequestPayload } from "./types/types";
import { actions } from "./toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  selectQueriesData,
  selectSnapFetchApiConfig,
} from "./selectors/selectors";
import { SnapFetchResult } from "./types/types";
import { usePagination } from "./utils/usePagination";
import { isEmpty, isEqual } from "./utils/utils";

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
    expirationTime: baseExpirationTime,
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
    expirationTime = baseExpirationTime ?? 60,
    searchTerm,
    effect = "takeEvery",
    disableCaching = baseDisableCaching ?? false,
    single,
  } = requestOptions;

  const filterString = JSON.stringify(filter);
  const paginationStringSize = JSON.stringify(paginationOptions?.size);
  const paginationStringPageNo = JSON.stringify(paginationOptions.pageNo);

  const tagsString = JSON.stringify(tags);
  const fetchFunctionString = JSON.stringify(customFetchFunction);

  /**@Refs */
  const filterRef = useRef(filter);
  const pageNoRef = useRef(paginationOptions.pageNo);
  const sizeRef = useRef(paginationOptions.size);

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
        createdAt: new Date(),
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
      if (isEmpty(snapFetchData.data)) {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, skip, isEmpty(snapFetchData.data), disableCaching]);

  useEffect(() => {
    if (
      (!skip && !isEqual(filter, filterRef.current)) ||
      (!skip && !isEqual(pageNoRef.current, paginationOptions.pageNo)) ||
      (!skip && !isEqual(sizeRef.current, paginationOptions.size))
    ) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    skip,
    fetchData,
    filterString,
    paginationStringPageNo,
    paginationStringSize,
    pageNoRef,
    filterRef,
  ]);

  return {
    refetch: fetchData,
    paginationOptions,
    ...snapFetchData,
  };
};
