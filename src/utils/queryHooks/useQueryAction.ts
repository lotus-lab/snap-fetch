import { useDispatch } from "react-redux";
import { PayloadType } from "../../types/types";
import { useCallback } from "react";
import { createAction } from "@reduxjs/toolkit";

export function useQueryAction<T, ActualApiRes>(
  payload: PayloadType<T, ActualApiRes>
) {
  const dispatch = useDispatch();

  return useCallback(
    (skip?: boolean) => {
      if (payload.hashKey) {
        const hashKeyAction = createAction<
          PayloadType<T, ActualApiRes> | undefined
        >(`hash-${payload.hashKey}`);

        dispatch(
          hashKeyAction({
            ...payload,
            createdAt: new Date(),
            skip: skip ?? payload.skip,
          })
        );
      }
    },
    [dispatch, payload]
  );
}
