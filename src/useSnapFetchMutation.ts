/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions } from "./toolkit";
import {
  selectMutationsData,
  selectSnapFetchApiConfig,
} from "./selectors/selectors";
import { BodyType, Method, MutationRequestOptions } from "./types/types";
import { RequestPayload } from "./types/types";

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

export const useSnapFetchMutation = <T>(
  endpoint: string,
  requestOptions: MutationRequestOptions<T> = {}
): Result<T | undefined> => {
  const { baseUrl, customFetchFunction, ...rest } = useSelector(
    selectSnapFetchApiConfig
  );

  const {
    invalidateTags,
    effect = "takeLeading",
    method,
    body,
  } = requestOptions;

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
  const restString = JSON.stringify(rest);

  const customFetchString = JSON.stringify(customFetchFunction);
  const invalidateTagsString = JSON.stringify(invalidateTags);

  const mutate = useCallback(
    async (handlerBody?: BodyType, requestInit?: Partial<RequestInit>) => {
      const responseData = await new Promise<T>((resolve, reject) => {
        const payload: RequestPayload = {
          endpoint,
          invalidateTags,
          fetchFunctionIsOutsider: !!customFetchFunction,
          resolve,
          reject,
          mutation: true,
          query: false,
          body: JSON.stringify(handlerBody ?? body),
          method: (requestInit?.method ?? method ?? "POST") as Method,
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
      });

      return responseData;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      endpoint,
      restString,
      baseUrl,
      effect,
      customFetchString,
      invalidateTagsString,
    ]
  );

  return {
    mutate,
    clear,
    ...rmutationData,
  };
};
