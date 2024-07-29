/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint no-bitwise: ["error", { "allow": ["<<", ">>>"] }] */

import axios, { AxiosError } from "axios";
import type { OmittedAxiosConfig, RequestPayload } from "../types/types";
import { request } from "../api/axios";

interface FetcherOptions extends RequestPayload, OmittedAxiosConfig {
  customFetchFunction?: (url: string) => Promise<any>;
  baseURL: string | undefined;
  endpoint: string;
  queryParams?: URLSearchParams;
  body?: any;
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
      method,
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

// Using crypto
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

/**
 * Parses an input string that may contain a path and an optional object.
 *
 * The input string can be in the format `"path{key1: value1, key2: value2}"`, where the path is separated from the object by a `{` character.
 *
 * If the input string contains an object, the function will parse it and return an object with the parsed path and object. If the input string does not contain an object, the function will return an object with only the parsed path.
 *
 * @param {string} input - The input string to parse.
 * @returns {object} An object with the parsed path and optional object.
 */
function parseInputString(input: string): { path: string; obj?: {} } {
  const match = input.match(/^(.+?)(\{.*\})$/);
  if (match) {
    const [, path, objString] = match;
    try {
      // Parse the object string, ensuring consistent property order
      const obj = objString
        .replace(/[{}]/g, "") // Remove braces
        .split(",") // Split into key-value pairs
        .map((pair) =>
          pair
            .trim()
            .split(":")
            .map((part) => part.trim())
        ) // Split each pair and trim
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort by keys
        .reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      return { path, obj };
    } catch (e) {
      // If parsing fails, treat the whole input as a string
      return { path: input };
    }
  }
  return { path: input };
}

/**
 * Generates a hash value for the given input string using the djb2 hashing algorithm.
 *
 * The function first parses the input string to extract a path and an optional object. If the input string contains an object, the function will include the serialized object in the hash calculation. The hash is calculated by iterating over the characters in the string and updating the hash value using the djb2 algorithm.
 *
 * @param {string} input - The input string to hash.
 * @returns {string} The hash value as a 8-character hexadecimal string.
 */
export function djb2Hash(input: string): string {
  const { path, obj } = parseInputString(input);

  let str = path;
  if (obj) {
    str += JSON.stringify(obj);
  }
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Calculates the collision rate of the `djb2Hash` function by generating a large number of random inputs and checking for hash collisions.
 *
 * This function is primarily used for testing and debugging purposes, to ensure that the `djb2Hash` function is generating unique hash values for a large number of inputs.
 *
 * @param numTests - The number of random inputs to generate and test.
 * @returns The collision rate as a number between 0 and 1, where 0 indicates no collisions and 1 indicates a 100% collision rate.
 */
export function testCollisionRate(numTests: number): number {
  const hashes = new Set<string>();
  const inputs = new Set<string>();

  for (let i = 0; i < numTests; i++) {
    const input = Math.random().toString(36).substring(2, 15);
    inputs.add(input);
    hashes.add(djb2Hash(input));
  }

  const collisionRate = 1 - hashes.size / inputs.size;
  return collisionRate;
}
