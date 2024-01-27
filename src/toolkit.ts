/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CaseReducer, PayloadAction, createSlice } from "@reduxjs/toolkit";

import {
  APiConfig,
  EndpointResult,
  InvalidateCachePayload,
  QueryState,
  QueryType,
  RequestErrorPayload,
  RequestPaginationPayload,
  RequestPayload,
  RequestSuccessPayload,
} from "./types/types";

import { endpointInitial } from "./constants";

export const initialState: QueryState = {
  endpoints: {
    mutations: {},
    queries: {},
  },
  apiConfig: {
    baseUrl: "",
  },
  actionsType: [],
};

const requestActions: CaseReducer<QueryState, PayloadAction<RequestPayload>> = (
  state,
  action
) => {
  const { endpoint, tags, mutation, query, queryParams, hashKey, pagination } =
    action.payload;

  const requestData = {
    error: undefined,
    isLoading: true,
    isError: false,
    success: false,
    tags,
    mutation,
    query,
    endpoint,
    queryParams,
    hashKey,
    pagination,
  };

  if (query && hashKey) {
    state.endpoints.queries[hashKey as string] = {
      ...state.endpoints.queries[hashKey as string],
      ...requestData,
    };
  }
  if (mutation) {
    state.endpoints.mutations[endpoint] = {
      ...state.endpoints.mutations[endpoint],
      ...requestData,
    };
  }
};

const SnapFetchSlice = createSlice({
  name: "snapFetch",
  initialState,
  reducers: {
    takeLeadingRequest: (state, action: PayloadAction<RequestPayload>) =>
      requestActions(state, action),
    takeEveryRequest: (state, action: PayloadAction<RequestPayload>) =>
      requestActions(state, action),
    takeLatestRequest: (state, action: PayloadAction<RequestPayload>) =>
      requestActions(state, action),

    loading: (
      state,
      action: PayloadAction<RequestPayload & EndpointResult>
    ) => {
      const { endpoint, mutation, query, hashKey } = action.payload;
      const loadingData = {
        isLoading: true,
        error: undefined,
        isError: false,
        success: false,
      };

      if (query && hashKey) {
        state.endpoints.queries[hashKey] = {
          ...state.endpoints.queries[hashKey],
          ...loadingData,
        };
      }

      if (mutation) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          ...loadingData,
        };
      }
    },

    success: (state, action: PayloadAction<RequestSuccessPayload>) => {
      const { endpoint, data, mutation, query, hashKey } = action.payload;
      const successData = {
        data,
        isLoading: false,
        error: undefined,
        isError: false,
        success: true,
        createdAt: new Date(),
      };

      if (query && hashKey) {
        state.endpoints.queries[hashKey] = {
          ...state.endpoints.queries[hashKey],
          ...successData,
        };
      }

      if (mutation) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          ...successData,
        };
      }
    },
    failure: (state, action: PayloadAction<RequestErrorPayload>) => {
      const { endpoint, error, mutation, query, hashKey } = action.payload;
      const failureData = {
        isLoading: false,
        error,
        isError: true,
        success: false,
      };
      if (query && hashKey) {
        state.endpoints.queries[hashKey] = {
          ...state.endpoints.queries[hashKey],
          ...failureData,
        };
      }
      if (mutation) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          ...failureData,
        };
      }
    },
    setPagination(state, action: PayloadAction<RequestPaginationPayload>) {
      const { endpoint, pagination, mutation, query, hashKey } = action.payload;

      if (query && hashKey) {
        state.endpoints.queries[hashKey] = {
          ...state.endpoints.queries[hashKey],
          pagination,
        };
      }
      if (mutation) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          pagination,
        };
      }
    },
    clearState: (state, action: PayloadAction<QueryType>) => {
      const { endpoint, mutation, query, hashKey } = action.payload;
      if (query && hashKey) {
        state.endpoints.queries[hashKey] = endpointInitial;
      }
      if (mutation) {
        state.endpoints.mutations[endpoint] = endpointInitial;
      }
    },
    setApiConfig(state, action: PayloadAction<APiConfig>) {
      state.apiConfig = action.payload;
    },

    setNewCreatedAction(state, action: PayloadAction<string>) {
      state.actionsType = [...state.actionsType, action.payload];
    },

    invalidateCache: (state, action: PayloadAction<InvalidateCachePayload>) => {
      const { endpoint, tags, mutation, query, queryParams, hashKey } =
        action.payload.requestPayload;

      const requestData = {
        error: undefined,
        isLoading: true,
        isError: false,
        success: false,
        tags,
        mutation,
        query,
        endpoint,
        queryParams,
      };

      if (query && hashKey) {
        state.endpoints.queries[hashKey] = {
          ...state.endpoints.queries[hashKey],
          ...requestData,
        };
      }
      if (mutation) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          ...requestData,
        };
      }
    },
    changePageNo: (
      state,
      action: PayloadAction<{ hashKey: string | undefined; value: number }>
    ) => {
      const { hashKey, value } = action.payload;
      const currentPagination =
        state.endpoints.queries[hashKey as string].pagination;
      if (currentPagination) currentPagination.pageNo = value;
    },
    changeSize: (
      state,
      action: PayloadAction<{ hashKey: string | undefined; value: number }>
    ) => {
      const { hashKey, value } = action.payload;
      const currentPagination =
        state.endpoints.queries[hashKey as string].pagination;
      if (currentPagination) currentPagination.size = value;
    },
  },
});

export const { reducer, actions, name, caseReducers, getInitialState } =
  SnapFetchSlice;
