import { useDispatch } from "react-redux";
import { PayloadType } from "../../types/types";
import { useCallback } from "react";
import { createAction } from "@reduxjs/toolkit";

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
        let payloadValues: PayloadType<T, ActualApiRes> = {
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
        dispatch(hashKeyAction(payloadValues));
      }
    },
    [payload]
  );
}
