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
  (state: any) => state?.SnapFetch
);

export const selectQueryData: (state: any) => EndpointState | undefined =
  createSelector([selectSlice], (state) => state?.SnapFetch?.endpoints);

export const selectQueriesData: (
  state: any,
  hashKey: EndpointKey
) => EndpointResult = createSelector(
  [selectQueryData, (_state: any, hashKey: EndpointKey) => hashKey],

  (state, hashKey) => state?.queries?.[hashKey] || endpointInitial
);

export const selectQueriesDataByTags: (
  state: any,
  tag: Array<Tag>
) => Array<EndpointResult> = createSelector(
  [selectQueryData, (_state: any, tag: Array<Tag>) => tag],

  (state, tag) => {
    if (state?.queries) {
      const queryState = Object.values(state.queries).filter((value) => {
        if (Array.isArray(tag)) {
          return tag.map((tag) => isEqual(tag, value.tag));
        }
        return isEqual(value.tag, tag);
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

export const selectSnapApiConfig: (state: any) => APiConfig = createSelector(
  [selectRQuerySlice],
  (state) => state?.apiConfig
);

export const selectSnapCreatedActions: (state: any) => Array<string> =
  createSelector([selectSlice], (state) => {
    return state?.SnapFetch?.actionsType;
  });
