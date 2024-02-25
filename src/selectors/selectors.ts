/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSelector } from "@reduxjs/toolkit";

import {
  APiConfig,
  EndpointKey,
  EndpointResult,
  EndpointState,
  QueryState,
  Tag,
} from "../types/types";
import { endpointInitial } from "../constants";
import { isEqual } from "../utils/utils";

const selectSlice = (state: any) => state;
const selectRQuerySlice: (state: any) => QueryState = createSelector(
  [selectSlice],
  (state: any) => state?.snapFetch
);

export const selectQueryData: (state: any) => EndpointState | undefined =
  createSelector([selectSlice], (state) => state?.snapFetch?.endpoints);

export const selectQueriesData: (
  state: any,
  hashKey: EndpointKey
) => EndpointResult = createSelector(
  [selectQueryData, (_state: any, hashKey: EndpointKey) => hashKey],

  (state, hashKey) => state?.queries?.[hashKey] || endpointInitial
);

export const selectQueriesDataByTags: (
  state: any,
  tags: Array<Tag>
) => Array<EndpointResult> = createSelector(
  [selectQueryData, (_state: any, tags: Array<Tag>) => tags],

  (state, tags) => {
    if (state?.queries) {
      const queryState = Object.values(state.queries).filter((value) => {
        if (Array.isArray(tags)) {
          return tags.map((tag) => isEqual(tag, value.tags));
        }
        return isEqual(value.tags, tags);
      });
      return queryState;
    }
    return [endpointInitial];
  }
);

export const selectMutationsData: (
  state: any,
  endpoint: EndpointKey
) => EndpointResult = createSelector(
  [selectQueryData, (_state: any, endpoint: EndpointKey) => endpoint],

  (state, endpoint) => {
    return state?.mutations?.[endpoint] || endpointInitial;
  }
);

export const selectSnapFetchApiConfig: (state: any) => APiConfig =
  createSelector([selectRQuerySlice], (state) => state?.apiConfig);

export const selectSnapFetchCreatedActions: (state: any) => Array<string> =
  createSelector([selectSlice], (state) => {
    return state?.snapFetch?.actionsType;
  });
