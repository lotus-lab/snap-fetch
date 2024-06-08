/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import { Method, OmittedAxiosConfig, RequestPayload } from "../types/types";
import { request } from "../api/axios";

interface FetcherOptions extends RequestPayload, OmittedAxiosConfig {
  customFetchFunction?: (url: string) => Promise<any>;
  baseURL: string | undefined;
  endpoint: string;
  queryParams?: URLSearchParams;
  method?: Method;
  body?: any;
}

export const fetcher = async ({
  customFetchFunction,
  baseURL,
  endpoint,
  queryParams,
  method = "GET",
  body,
  headers,
  skipAuth,
}: FetcherOptions) => {
  const url = formatEndpoint(baseURL!, endpoint as string);

  const fullUrl = `${url}${queryParams?.toString() ? `?${queryParams}` : ""}`;

  if (customFetchFunction) {
    return customFetchFunction(fullUrl);
  }

  try {
    const newHeaders: OmittedAxiosConfig["headers"] = { ...headers };

    if (skipAuth && newHeaders) {
      delete newHeaders.Authorization;
    }
    const response = await request({
      url: fullUrl,
      method: method,
      data: body,
      headers: newHeaders,
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const errorData = axiosError.response?.data as any;
      throw {
        status,
        message: errorData?.message,
        errorData,
      };
    } else {
      throw { message: "Unexpected error:", errorData: error };
    }
  }
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

export function formatEndpoint(baseUrl: string, endpoint: string): string {
  if (endpoint?.startsWith("/")) {
    endpoint = endpoint.substring(1);
  }

  if (endpoint?.endsWith("/")) {
    endpoint = endpoint.substring(0, endpoint.length - 1);
  }

  return `${baseUrl}/${endpoint}`;
}
