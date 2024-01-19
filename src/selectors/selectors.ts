/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSelector } from "@reduxjs/toolkit";

import {
  APiConfig,
  EndpointKey,
  EndpointResult,
  EndpointState,
  QueryState,
  Tags,
} from "../types/types";
import { endpointInitial } from "../constants";
import { isEqual } from "lodash";

const selectSlice = (state: any) => state;
const selectRQuerySlice: (state: any) => QueryState = createSelector(
  [selectSlice],
  (state: any) => state?.cachebolt
);

export const selectQueryData: (state: any) => EndpointState | undefined =
  createSelector([selectSlice], (state) => state?.cachebolt?.endpoints);

export const selectQueriesData: (
  state: any,
  endpoint: EndpointKey
) => EndpointResult = createSelector(
  [selectQueryData, (_state: any, endpoint: EndpointKey) => endpoint],

  (state, endpoint) => state?.queries?.[endpoint] || endpointInitial
);

export const selectQueriesDataByTags: (
  state: any,
  tags: Tags
) => Array<EndpointResult> = createSelector(
  [selectQueryData, (_state: any, tags: Tags) => tags],

  (state, tags) => {
    if (state?.queries) {
      const queryState = Object.values(state.queries).filter((value) =>
        isEqual(value.tags, tags)
      );
      return queryState;
    } else {
      return [endpointInitial];
    }
  }
);

export const selectMutationsData: (
  state: any,
  endpoint: EndpointKey
) => EndpointResult = createSelector(
  [selectQueryData, (_state: any, endpoint: EndpointKey) => endpoint],

  (state, endpoint) => state?.mutations?.[endpoint] || endpointInitial
);

export const selectCacheBoltApiConfig: (state: any) => APiConfig =
  createSelector([selectRQuerySlice], (state) => state?.apiConfig);

export const selectCacheBoltCreatedActions: (state: any) => Array<string> =
  createSelector([selectSlice], (state) => {
    return state?.cachebolt?.actionsType;
  });
