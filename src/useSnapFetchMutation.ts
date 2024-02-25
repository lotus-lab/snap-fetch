/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions } from "./toolkit";
import {
  selectMutationsData,
  selectSnapFetchApiConfig,
} from "./selectors/selectors";
import {
  BodyType,
  Method,
  MutationRequestOptions,
  RequestPayload,
} from "./types/types";

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

export const useSnapFetchMutation = <T, ActualApiRes = unknown>(
  endpoint: string,
  requestOptions: MutationRequestOptions<T, ActualApiRes> = {}
): Result<T | undefined> => {
  const {
    baseUrl: baseConfigUrl,
    customFetchFunction,
    ...rest
  } = useSelector(selectSnapFetchApiConfig);

  let {
    invalidateTags,
    effect = "takeLeading",
    method,
    body,
    baseUrl = baseConfigUrl,
    transformResponse,
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
    async (handlerBody?: any, requestInit?: Partial<RequestInit>) => {
      const responseData = await new Promise<T>((resolve, reject) => {
        let bodyType: BodyType | undefined = handlerBody;

        if (handlerBody?.constructor?.name?.includes("Event")) {
          // Provide a default value for the body or ignore it
          // For example, you can assign an empty object as the default body
          bodyType = "";
        }

        if (body?.constructor?.name?.includes("Event")) {
          body = "";
        }

        const stringBody = JSON.stringify(bodyType || body);
        const payload: RequestPayload = {
          endpoint,
          invalidateTags,
          fetchFunctionIsOutsider: !!customFetchFunction,
          resolve,
          reject,
          mutation: true,
          query: false,
          body: stringBody,
          method: (requestInit?.method ?? method ?? "POST") as Method,
          baseUrl,
          //@ts-ignore
          transformResponse,
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
    [
      endpoint,
      restString,
      baseUrl,
      effect,
      customFetchString,
      invalidateTagsString,
    ]
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
