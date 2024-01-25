import { Method, RequestPayload } from "../types/types";

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
  try {
    const url = formatEndpoint(baseUrl, endpoint as string);
    if (customFetchFunction) {
      return customFetchFunction(
        `${url}${queryParams?.size ? `?${queryParams}` : ""}`
      );
    }

    if (["GET", "HEAD"].includes(method as string)) {
      delete rest?.body;
    }
    return fetch(`${url}${queryParams?.size ? `?${queryParams}` : ""}`, {
      method: method ?? "GET",
      ...rest,
    });
  } catch (error) {
    throw new Error(error);
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
  if (endpoint.startsWith("/")) {
    endpoint = endpoint.substring(1);
  }

  if (endpoint.endsWith("/")) {
    endpoint = endpoint.substring(0, endpoint.length - 1);
  }

  return baseUrl + "/" + endpoint;
}
