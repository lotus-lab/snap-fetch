import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { createAction } from "@reduxjs/toolkit";
import { suffixCache } from "../../saga/saga";
import { PayloadType } from "../../types/types";

interface Options {
  skip?: boolean;
  resetPagination?: boolean;
  staleWhileRevalidate?: boolean;
}

export function useQueryAction<T, ActualApiRes>(
  payload: PayloadType<T, ActualApiRes>
) {
  const dispatch = useDispatch();

  return useCallback(
    ({ resetPagination, skip, staleWhileRevalidate }: Options = {}) => {
      if (payload.hashKey) {
        const hashKeyAction = createAction<
          PayloadType<T, ActualApiRes> | undefined
        >(`hash-${payload.hashKey}`);
        const payloadValues: PayloadType<T, ActualApiRes> = {
          ...payload,
          createdAt: new Date(),
          skip: skip ?? payload.skip,
          staleWhileRevalidate,
        };
        if (resetPagination) {
          payloadValues.pagination = {
            pageNo: 1,
            size: 10,
          };
        }
        if (!suffixCache.has(payload.hashKey)) {
          dispatch(hashKeyAction(payloadValues));
        }
      }
    },
    [payload]
  );
}
