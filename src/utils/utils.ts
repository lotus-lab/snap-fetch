import { useDispatch } from "react-redux";
// import { APiConfig, Method, RequestPayload, actions } from "";
import { APiConfig, Method, RequestPayload } from "../types/types";
import { actions } from "../toolkit";

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

export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (
    typeof value === "string" ||
    value instanceof String ||
    value instanceof Array ||
    value instanceof Object
  ) {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function isEqual(value: any, other: any): boolean {
  if (value === other) {
    return true;
  }

  if (typeof value !== typeof other) {
    return false;
  }

  if (typeof value !== "object" || value === null || other === null) {
    return false;
  }

  const keysA = Object.keys(value);
  const keysB = Object.keys(other);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!isEqual(value[key], other[key])) {
      return false;
    }
  }

  return true;
}

export async function generateUniqueId(
  inputString: string,
  length: number = 8
) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64String = btoa(String.fromCharCode(...hashArray));
  const truncatedId = base64String
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, length);

  return truncatedId;
}
