import { CaseReducer, PayloadAction, createSlice } from "@reduxjs/toolkit";

import {
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
    cacheExpirationTime: 120,
  },
  actionsType: [],
};

const requestActions: CaseReducer<QueryState, PayloadAction<RequestPayload>> = (
  state,
  action
) => {
  const {
    endpoint,
    tag,
    mutation,
    query,
    queryParams,
    hashKey,
    transformResponse,
  } = action.payload;

  const requestData = {
    error: undefined,
    isLoading: true,
    isError: false,
    success: false,
    tag,
    mutation,
    query,
    endpoint,
    queryParams,
    hashKey,
    transformResponse,
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

const SnapSlice = createSlice({
  name: "SnapFetch",
  initialState,
  reducers: {
    takeLeadingRequest: (state, action: PayloadAction<RequestPayload>) =>
      requestActions(state, action),
    fetchDataAction: (state, action: PayloadAction<RequestPayload>) =>
      requestActions(state, action),
    takeLatestRequest: (state, action: PayloadAction<RequestPayload>) =>
      requestActions(state, action),

    loading: (state, action: PayloadAction<RequestPayload>) => {
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
      const loadingData = {
        isLoading: false,
        error: undefined,
        isError: false,
        success: false,
      };

      if (action.payload) {
        state.endpoints.queries[action.payload] = {
          ...state.endpoints.queries[action.payload],
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

    invalidateCache: (_, _action: PayloadAction<InvalidateCachePayload>) => {},
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
        } else {
          if (state.endpoints.queries[hashKey as string]) {
            if (debounce) {
              state.endpoints.queries[hashKey as string].debounce = debounce;
            }
            state.endpoints.queries[hashKey as string].pagination.pageNo =
              Number(currentPageNo) - 1;
          }
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
  SnapSlice;
