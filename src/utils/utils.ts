import { useDispatch } from "react-redux";
import { APiConfig, Method, RequestPayload, actions } from "../index";
import { useCallback, useEffect } from "react";

export const useSetBaseConfiguration = (requestInit: APiConfig) => {
  const requestString = JSON.stringify(requestInit);
  const dispatch = useDispatch();
  const setBaseConfiguration = useCallback(() => {
    dispatch(actions.setApiConfig(requestInit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, requestString]);

  useEffect(() => {
    setBaseConfiguration();
  }, [setBaseConfiguration]);
};

interface FetcherOptions extends RequestPayload, RequestInit {
  customFetchFunction?: ((endpoint: string) => Promise<Response>) | undefined;
  baseUrl: string;
  endpoint: string | number;
  queryParams?: URLSearchParams;
  method?: Method;
}

export const fetcher = ({
  customFetchFunction,
  baseUrl,
  endpoint,
  queryParams,
  method,
  ...rest
}: FetcherOptions) => {
  if (customFetchFunction) {
    return customFetchFunction(`${baseUrl}/${endpoint}${`?${queryParams}`}`);
  }

  if (["GET", "HEAD"].includes(method as string)) {
    delete rest?.body;
  }
  return fetch(
    `${baseUrl}/${endpoint}${queryParams?.size ? `?${queryParams}` : ""}`,
    {
      method: method ?? "GET",
      ...rest,
    }
  );
};
