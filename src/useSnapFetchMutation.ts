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
    async (handlerBody?: any, requestInit?: Partial<RequestInit>) => {
      try {
        const responseData = await new Promise<T>((resolve, reject) => {
          let bodyType: BodyType | undefined = handlerBody;

          // Check if handlerBody is an event object

          if (handlerBody instanceof Event) {
            // Provide a default value for the body or ignore it
            // For example, you can assign an empty object as the default body
            bodyType = {};
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
      } catch (error) {
        throw new Error(
          "Event are not a valid body, calling mutate with event body!"
        );
      }
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
