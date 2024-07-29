/* eslint-disable @typescript-eslint/no-unused-vars */
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

import type {
  APiConfig,
  ChangePageNoPayload,
  InvalidateCachePayload,
  QueryState,
  QueryType,
  RequestErrorPayload,
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
    baseURL: "",
    cacheExpirationTime: 90,
  },
  actionsType: [],
  hashKeys: {},
};

const SnapFetchSlice = createSlice({
  name: "snapFetch",
  initialState,
  reducers: {
    setHashKey(state, action: PayloadAction<string>) {
      if (action.payload) {
        state.hashKeys[action.payload] = action.payload;
      }
    },
    removeHashKey(
      state,
      action: PayloadAction<{ key: string | number | undefined }>
    ) {
      if (action.payload.key) {
        delete state.hashKeys[action.payload.key];
      }
    },
    loading: (state, action: PayloadAction<RequestPayload>) => {
      const { endpoint, mutation, query, hashKey, staleWhileRevalidate } =
        action.payload;
      const loadingData = {
        isLoading: !staleWhileRevalidate,
        error: undefined,
        isError: false,
        success: false,
      };

      if (query && hashKey) {
        state.endpoints.queries[hashKey] = {
          ...state.endpoints.queries[hashKey],
          ...action.payload,
          ...loadingData,
        };
      }

      if (mutation && endpoint) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          ...action.payload,
          ...loadingData,
        };
      }
    },
    finishLoading: (
      state,
      action: PayloadAction<string | number | undefined>
    ) => {
      if (action.payload) {
        state.endpoints.queries[action.payload] = {
          ...state.endpoints.queries[action.payload],
          isLoading: false,
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

      if (mutation && endpoint) {
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
      if (mutation && endpoint) {
        state.endpoints.mutations[endpoint] = {
          ...state.endpoints.mutations[endpoint],
          ...failureData,
        };
      }
    },

    clearState: (state, action: PayloadAction<QueryType>) => {
      const { endpoint, mutation, query, hashKey } = action.payload;
      if (query && hashKey) {
        state.endpoints.queries[hashKey] = endpointInitial;
      }
      if (mutation && endpoint) {
        state.endpoints.mutations[endpoint] = endpointInitial;
      }
    },
    setApiConfig(state, action: PayloadAction<APiConfig>) {
      state.apiConfig = { ...state.apiConfig, ...action.payload };
    },

    setNewCreatedAction(state, action: PayloadAction<string>) {
      state.actionsType = [...state.actionsType, action.payload];
    },

    invalidateCache: (
      _state,
      _action: PayloadAction<InvalidateCachePayload>
    ) => {},
    setPageNo: (
      state,
      action: PayloadAction<Omit<ChangePageNoPayload, "increase">>
    ) => {
      const { hashKey, value, debounce } = action.payload;
      if (hashKey) {
        const currentPageNo =
          state.endpoints.queries[hashKey as string]?.pagination?.pageNo;
        if (currentPageNo) {
          state.endpoints.queries[hashKey as string].pagination.pageNo = value;
          state.endpoints.queries[hashKey as string].debounce = debounce;
        }
      }
    },
    changePageNo: (state, action: PayloadAction<ChangePageNoPayload>) => {
      const { hashKey, increase, debounce } = action.payload;
      if (hashKey) {
        const currentPageNo =
          state.endpoints.queries[hashKey as string]?.pagination?.pageNo;

        if (increase && state.endpoints.queries[hashKey as string]) {
          if (debounce) {
            state.endpoints.queries[hashKey as string].debounce = debounce;
          }
          state.endpoints.queries[hashKey as string].pagination.pageNo =
            Number(currentPageNo) + 1;
        } else if (state.endpoints.queries[hashKey as string]) {
          if (debounce) {
            state.endpoints.queries[hashKey as string].debounce = debounce;
          }
          state.endpoints.queries[hashKey as string].pagination.pageNo =
            Number(currentPageNo) - 1;
        }
      }
    },
    changeSize: (
      state,
      action: PayloadAction<{
        hashKey: string | number | undefined;
        value: number;
      }>
    ) => {
      const { hashKey, value } = action.payload;
      const currentPagination =
        state.endpoints.queries[hashKey as string]?.pagination;
      if (currentPagination) {
        currentPagination.size = value;
      }
    },
  },
});

export const { reducer, actions, name, caseReducers, getInitialState } =
  SnapFetchSlice;
