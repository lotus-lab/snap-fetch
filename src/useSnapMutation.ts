/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions } from "./toolkit";
import { selectMutationsData } from "./selectors/selectors";
import {
  BodyType,
  Method,
  MutationRequestOptions,
  PayloadType,
  RequestPayload,
} from "./types/types";
import { createAction } from "@reduxjs/toolkit";
import { useGenHashKey } from "./useGenHashKey";

export interface Result<T> {
  data?: T | undefined;
  isLoading: boolean;
  success: boolean;
  error: Error | undefined;
  isError: boolean;
  mutate: (
    handlerBody?: BodyType,
    apiConfig?: RequestInit
  ) => Promise<T | undefined>;
  clear: () => void;
}

export const useSnapMutation = <T, ActualApiRes = unknown>(
  endpoint: string,
  requestOptions: MutationRequestOptions<T, ActualApiRes> = {}
): Result<T | undefined> => {
  const dispatch = useDispatch();
  const rmutationData = useSelector((state: any) =>
    selectMutationsData(state, endpoint as string)
  );

  const clear = () => {
    dispatch(
      actions.clearState({
        endpoint,
        mutation: true,
        query: false,
      })
    );
  };

  const { hashKey } = useGenHashKey(endpoint);

  const mutate = useCallback(
    async (handlerBody?: any, requestInit?: Partial<RequestInit>) => {
      const responseData = await new Promise<T>((resolve, reject) => {
        // let bodyType: BodyType | undefined = handlerBody;

        if (handlerBody?.constructor?.name?.includes("Event")) {
          // Provide a default value for the body or ignore it
          // For example, you can assign an empty object as the default body
          handlerBody = "";
        }

        const payload: RequestPayload = {
          endpoint,
          fetchFunctionIsOutsider: !!requestOptions.fetchFunction,
          resolve,
          reject,
          mutation: true,
          query: false,
          body: handlerBody || requestOptions.body,
          method: (requestInit?.method ??
            requestOptions.method ??
            "POST") as Method,
          ...requestOptions,
        };

        const hashKeyAction = createAction<
          Partial<PayloadType<T, ActualApiRes>> | undefined
        >(`hash-${hashKey}`);

        dispatch(hashKeyAction({ ...payload, hashKey }));
      });

      return responseData;
    },
    [endpoint, JSON.stringify(requestOptions), hashKey]
  );

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return {
    mutate,
    clear,
    ...rmutationData,
  };
};
