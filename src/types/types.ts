/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from "@reduxjs/toolkit";
import { AxiosRequestConfig } from "axios";

export type KeysOfEndpointSate = { [key: string]: EndpointResult };

export type EndpointKey = keyof KeysOfEndpointSate;

// export type Tags = Array<string | number> | number | string | undefined;
export type Tag = string | number | undefined;
export type OmittedAxiosConfig = Omit<
  AxiosRequestConfig,
  "url" | "method" | "transformResponse"
>;
interface mutateApiConfig extends OmittedAxiosConfig, MutationOptions {}
export type MutateFncType<T> = (
  handlerBody?: any,
  apiConfig?: mutateApiConfig | undefined
) => Promise<T>;
export interface RequestPayload<T = any, ActualApiRes = any>
  extends OmittedAxiosConfig,
    RequestOptions<T, ActualApiRes> {
  endpoint: string;
  invalidateTags?: Array<Tag>;
  fetchFunctionIsOutsider?: boolean;
  resolve?: (data: any) => void;
  reject?: (reason: any) => void;
  mutation?: boolean;
  query?: boolean;
  queryParams?: any;
  method?: Method;
  createdAt?: Date;
  pollingInterval?: number;
  hashKey?: EndpointKey;
  pagination?: Pagination;
  filter?: any;
  force?: boolean;
  reconnected?: boolean;
  transformResponse?: (response: ActualApiRes) => T;
  skipAuth?: boolean;
  // headers?: AxiosHeaders;
  body?: BodyType;
}
export type UseQueryOptions = {
  requestInit?: OmittedAxiosConfig;
};

export interface CreateApiOptions<T, ActualApiRes> {
  fetchFunction?: (endpoint: string) => Promise<Response>;
  tag?: Tag;
  baseURL?: string;
  cacheExpirationTime?: number;
  transformResponse?: (response: ActualApiRes) => T;
}

/* --- STATE --- */

export interface APiConfig extends OmittedAxiosConfig {
  baseURL: string;
  /**
   * @default 90 (second or 1.5 minute)
   * Used to specify the duration for which the cached data should be considered valid before it needs to be refreshed.
   */
  cacheExpirationTime?: number;
  /**
   * @default false
   * Used to specify if caching should be disabled.
   * Does not affect the avoidance of unnecessary requests prevention.
   */
  disableCaching?: boolean;
  customFetchFunction?: ((endpoint: string) => Promise<Response>) | undefined;
  method?: Method;
  // headers?: AxiosHeaders;
  disableRefetchOnReconnect?: boolean;
  skipAuth?: boolean;
  debounce?: number;
}

export declare type QueryState = {
  endpoints: EndpointState;
  apiConfig: APiConfig;
  actionsType: Array<string>;
};

export type EndpointResult = {
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  data?: any;
  pagination: Partial<PaginationOptions>;
  success: boolean;
  tag?: Tag;
  mutation?: boolean;
  query?: boolean;
  endpoint?: EndpointKey | undefined;
  queryParams?: any;
  createdAt?: Date;
  hashKey?: EndpointKey;
  transformResponse?: (response: unknown) => unknown;
  debounce?: number;
};

export type EndpointState = {
  queries: KeysOfEndpointSate;
  mutations: KeysOfEndpointSate;
};

export type Pagination = {
  pageNo?: number | undefined;
  size?: number | undefined;
  lastPage?: number | undefined;
  currentShowingItems?: number | undefined;
  totalItems?: number | undefined;
};

export type InvalidateCachePayload<T = undefined> = {
  requestPayload: RequestPayload<T>;
  queryCatchData: EndpointResult;
};

export interface Options {
  filter?: { [key: string]: number | boolean | string | undefined | null };
  pollingInterval?: number;
  skip?: boolean;
  single?: boolean;
}

export type Method =
  | "POST"
  | "PUT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "PATCH";
export interface RequestOptions<T, ActualApiRes = undefined>
  extends CreateApiOptions<T, ActualApiRes>,
    Options {
  effect?: "takeLatest" | "takeLeading" | "takeEvery";
  method?: Method;
  disableCaching?: boolean;
  disableRefetchOnReconnect?: boolean;
  debounce?: number;
}

export interface SnapResult<T>
  extends Omit<EndpointResult, "transformResponse"> {
  data?: T | undefined;
  refetch: () => void;
  clear: () => void;
  paginationOptions: PaginationOptions;
  dispatch: Dispatch<any>;
}

export type PaginationOptions = {
  lastPage: number;
  totalItems: number;
  next: (debounce?: number) => void;
  prev: (debounce?: number) => void;
  changeSize: (value: number) => void;
  pageNo: number | undefined;
  size: number | undefined;
};

export type QueryType = {
  query?: boolean;
  mutation?: boolean;
  endpoint?: EndpointKey;
  hashKey?: EndpointKey;
};

export interface RequestSuccessPayload extends QueryType {
  data: unknown;
}
export interface RequestErrorPayload extends QueryType {
  error: Error;
}

export interface RequestPaginationPayload extends QueryType {
  pagination: Pagination;
}

/** @MutationSection */
export type BodyType = any;

export interface MutationOptions {
  method?: Method;
  body?: BodyType;
  isFormData?: boolean;
  effect?: "takeLatest" | "takeLeading" | "takeEvery";
  invalidateTags?: Array<Tag>;
}
export interface MutationRequestOptions<T, ActualApiRes = undefined>
  extends MutationOptions,
    Omit<CreateApiOptions<T, ActualApiRes>, "tag">,
    OmittedAxiosConfig {
  disableCall?: boolean;
}

export type DataCache = {
  [key: string]: {
    alreadyExecuted: boolean;
    hashKey: string;
  };
};

export interface PayloadType<T, ActualApiRes>
  extends RequestOptions<T, ActualApiRes>,
    APiConfig {
  query: boolean;
  mutation: boolean;
  baseURL: string;
  // reconnected: boolean;
  endpoint: string;
  hashKey: string | number | undefined;
  fetchFunctionIsOutsider: boolean;
  pagination?: Pagination;
}

export type ChangePageNoPayload = {
  hashKey: string | number | undefined;
  increase: boolean;
  debounce?: number;
  // command: () => void;
};
