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
const selectSagaQuerySlice: (state: any) => QueryState = createSelector(
  [selectSlice],
  (state: any) => state?.snapFetch
);

export const selectQueryData: (state: any) => EndpointState | undefined =
  createSelector([selectSlice], (state) => state?.snapFetch?.endpoints);

export const selectAllHashKeys: (
  state: any
) => { [key: string]: string | number } | undefined = createSelector(
  [selectSlice],
  (state) => state?.snapFetch?.hashKeys
);

export const selectQueriesData: (
  state: any,
  hashKey: EndpointKey
) => EndpointResult = createSelector(
  [selectQueryData, (_state: any, hashKey: EndpointKey) => hashKey],

  (state, hashKey) => {
    if (hashKey && state?.queries?.[hashKey]) {
      return state?.queries?.[hashKey];
    }
    return endpointInitial;
  }
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
    if (endpoint && state?.mutations?.[endpoint]) {
      return state?.mutations?.[endpoint];
    }
    return endpointInitial;
  }
);

export const selectSnapFetchApiConfig: (state: any) => APiConfig =
  createSelector([selectSagaQuerySlice], (state) => state?.apiConfig);
