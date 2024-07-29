/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch } from "@reduxjs/toolkit";
import { AxiosRequestConfig, Method } from "axios";
import {} from "redux-saga";

export type KeysOfEndpointSate = { [key: string]: EndpointResult };

export type EndpointKey = keyof KeysOfEndpointSate | undefined;

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
  staleWhileRevalidate?: boolean | undefined;
}
export type UseQueryOptions = {
  requestInit?: OmittedAxiosConfig;
};

export interface CreateApiOptions<T, ActualApiRes> {
  fetchFunction?: (endpoint: string) => Promise<Response>;
  tag?: Tag;
  baseURL?: string;
  /**
   * @default 90 (second or 1.5 minute)
   * Used to specify the duration for the current query cached data should be considered valid before it needs to be refreshed.
   */
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
  disableRefetchOnReconnect?: boolean;
  skipAuth?: boolean;
  debounce?: number;
}

export declare type QueryState = {
  endpoints: EndpointState;
  apiConfig: APiConfig;
  actionsType: Array<string>;
  hashKeys: { [key: string]: string | number };
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

type FilterType = number | string | boolean;

export interface Options {
  filter?: { [key: string]: FilterType | Array<FilterType> | undefined | null };
  pollingInterval?: number;
  skip?: boolean;
  /**
   * If you are using this, make sure your API returns response in this format:
   * @example
   * {
   *   data: Array<any>,
   *   total: number
   * }
   */
  usePagination?: boolean;
}

export interface RequestOptions<T, ActualApiRes = undefined>
  extends CreateApiOptions<T, ActualApiRes>,
    Options,
    OmittedAxiosConfig {
  method?: Method;
  disableCaching?: boolean;
  disableRefetchOnReconnect?: boolean;
  /**
   * An optional debounce delay in milliseconds for filter-related actions.
   * Make sure to given "tag" for your current query if you have multiple useSagaQuery using the same endpoint with in the same component or page
   * This will be used to avoid canceling fetches with the same endpoint and different filter, because internally we use the (endpoint + tag) as a taskId in redux-saga race effect
   */
  debounce?: number;
  suffixUrl?: string | number;
  skipAuth?: boolean;
}

export interface FetchResult<T>
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
  changePageNo: (value?: number, debounce?: number) => void;
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
  invalidateTags?: Array<Tag>;
  suffixUrl?: string | number | undefined;
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
  pagination?: Pagination | undefined;
  createdAt?: Date | undefined;
  staleWhileRevalidate?: boolean | undefined;
}

export type ChangePageNoPayload = {
  hashKey: string | number | undefined;
  increase?: boolean | undefined;
  debounce?: number | undefined;
  value?: number | undefined;
};

export type RefetchOptions = {
  resetPagination?: boolean;
  staleWhileRevalidate?: boolean;
};
