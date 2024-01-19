/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Endpoints, MaybePromise } from "./common";

import { ActionCreatorWithPayload, PrepareAction } from "@reduxjs/toolkit";
import { usePagination } from "../utils/usePagination";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface QueryResponse<T> {
  data: T;
}

export interface QueryError {
  status: string | number;
}

export type QueryFn<Args, Response> = (arg: Args) => Promise<Response>;

export type TransformResponseFn<T> = (response: QueryResponse<T>) => T;
export type TransformErrorFn = (error: QueryError) => any;
export type ProvidesTagsFn<T> = (result: T, error: any, arg: any) => string[];

export interface EndpointConfig<T, Args> {
  query: QueryFn<Args, QueryResponse<T>>;
  transformResponse: TransformResponseFn<T>;
  transformErrorResponse: TransformErrorFn;
  providesTags: ProvidesTagsFn<T>;
  onQueryStarted?: (arg: Args) => Promise<void>;
  onCacheEntryAdded?: (arg: Args) => Promise<void>;
}

export type EndpointsConfig = Record<string, EndpointConfig<any, any>>;

export type BaseQueryFn<Args, Response> = QueryFn<
  Args,
  QueryResponse<Response>
>;

export type KeysOfEndpointSate = { [key: string]: EndpointResult };

export type EndpointKey = keyof KeysOfEndpointSate;

export type Tags = Array<string | number> | number | string | undefined;

export interface FetchFunctionOptions extends RequestPayload {
  method?: Method;
}

export interface RequestPayload extends RequestInit {
  // fetchFunction: (options: FetchFunctionOptions) => Promise<Response>;
  endpoint: EndpointKey;
  tags?: Tags;
  invalidateTags?: Tags;
  fetchFunctionIsOutsider: boolean;
  resolve?: (data: any) => void;
  reject?: (reason: any) => void;
  mutation?: boolean;
  query?: boolean;
  queryParams?: any;
  method?: Method;
}
export type UseQueryOptions = {
  requestInit?: RequestInit;
};

export interface CreateApiOptions {
  fetchFunction?: (endpoint: string) => Promise<Response>;
  tags?: Tags;
}

export type FetchBaseQueryOptions = {
  baseUrl?: string;
  initHeaders?: (headers: Headers) => Headers | void;
};

/* --- STATE --- */

export interface APiConfig extends RequestInit {
  baseUrl: string;
  expirationTime?: number;
  disableCaching?: boolean;
  customFetchFunction?: ((endpoint: string) => Promise<Response>) | undefined;
  method?: Method;
}
export type Action = ActionCreatorWithPayload<
  PrepareAction<RequestPayload>,
  string
>;
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
  pagination?: Pagination;
  success: boolean;
  tags?: Tags;
  mutation?: boolean;
  query?: boolean;
  endpoint?: EndpointKey | undefined;
  queryParams?: any;
};

export type EndpointState = {
  queries: KeysOfEndpointSate;
  mutations: KeysOfEndpointSate;
};

export type Pagination = {
  pageNo?: number;
  size?: number;
};

export type InvalidateCachePayload = {
  requestPayload: RequestPayload;
  queryCatchData: EndpointResult;
};

export interface Options {
  searchTerm?: string;
  filter?: { [key: string]: number | boolean | string | undefined | null };
  expirationTime?: number | undefined;
  skip?: boolean;
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
export interface RequestOptions extends CreateApiOptions, Options {
  effect?: "takeLatest" | "takeLeading" | "takeEvery";
  method?: Method;
  disableCaching?: boolean;
}

export interface CacheBoltResult<T> extends EndpointResult {
  data?: T | undefined;
  refetch: () => void;
  paginationOptions: ReturnType<typeof usePagination>;
}

export type QueryType = {
  query?: boolean;
  mutation?: boolean;
  endpoint: EndpointKey;
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

/**@MutationSection */
export type BodyType = any;

export interface MutationOptions<T> {
  transform?: (data: T) => T;
  method?: Method;
  body?: BodyType;
  effect?: "takeLatest" | "takeLeading" | "takeEvery";
  invalidateTags?: Tags;
}
export interface MutationRequestOptions<T>
  extends MutationOptions<T>,
    Omit<CreateApiOptions, "tags"> {}
