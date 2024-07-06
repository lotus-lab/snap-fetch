/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
import {
  all,
  call,
  fork,
  put,
  select,
  takeLeading,
  takeEvery,
  delay,
  takeLatest,
} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import {
  selectQueriesData,
  selectSagaQueryApiConfig,
} from "../selectors/selectors";
import { actions } from "../toolkit";
import {
  APiConfig,
  EndpointResult,
  InvalidateCachePayload,
  Pagination,
  RequestPayload,
} from "../types/types";
import { fetchSaga } from "./fetchSaga";
import { fetcher } from "../utils/utils";
// import {CustomURLSearchParams} from 'saga-query';

export const suffixCache = new Set();
function* handleFetchDataRequest(action: PayloadAction<RequestPayload>) {
  let {
    endpoint,
    reject,
    mutation,
    query,
    hashKey,
    disableCaching,
    skip,
    debounce,
    filter,
    usePagination,
  } = action.payload;

  try {
    const hashData: EndpointResult = yield select((state) =>
      selectQueriesData(state, hashKey as string)
    );
    if (hashData.debounce) {
      debounce = hashData.debounce;
    }

    const queryParams = new URLSearchParams("");

    const pagination: Pagination | undefined = yield action.payload.pagination;

    if (filter) {
      Object.keys(filter).forEach((key) => {
        if (filter?.[key] !== undefined && filter[key] !== "") {
          queryParams.set(key, filter[key] as string);
        }
      });
    }

    if (pagination?.pageNo && usePagination) {
      queryParams.set("pageNo", pagination.pageNo.toString());
    }

    if (pagination?.size && usePagination) {
      queryParams.set("size", pagination.size.toString());
    }

    if (debounce) {
      yield delay(debounce);
    }
    if (!skip) {
      yield put(actions.loading({ ...action.payload, queryParams }));
      yield call(() => fetchSaga({ ...action.payload, queryParams }));
    }
  } catch (err) {
    suffixCache.delete(hashKey);
    yield put(
      actions.failure({
        endpoint,
        error: err as Error,
        query,
        mutation,
        hashKey,
      })
    );
    if (reject) {
      reject(err);
    }
  } finally {
    if (disableCaching || mutation || skip) {
      suffixCache.delete(hashKey);
    }
  }
}

function* invalidateCatchSaga(action: PayloadAction<InvalidateCachePayload>) {
  const { mutation, fetchFunctionIsOutsider } = action.payload.requestPayload;

  const { queryCatchData } = action.payload;
  let data: unknown;
  try {
    yield put(
      actions.loading({
        ...queryCatchData,
        fetchFunctionIsOutsider,
        endpoint: queryCatchData.endpoint as string,
        hashKey: queryCatchData.hashKey as string,
      })
    );

    const baseApiConfig: APiConfig = yield select(selectSagaQueryApiConfig);

    if (
      mutation &&
      // isEqual(invalidateTags, queryCatchData.tag) &&
      queryCatchData.tag &&
      queryCatchData.endpoint
    ) {
      const response: Response = yield call(() =>
        fetcher({
          ...baseApiConfig,
          ...action.payload.requestPayload,
          endpoint: queryCatchData.endpoint as string,
          queryParams: queryCatchData.queryParams,
          method: "GET",
        })
      );

      // if (fetchFunctionIsOutsider) {
      //   data = yield response;
      // } else {
      data = yield response;
      // }
      if (queryCatchData.transformResponse) {
        data = yield queryCatchData.transformResponse(data);
      }

      yield put(
        actions.success({
          data,
          endpoint: queryCatchData.endpoint,
          mutation: false,
          query: true,
          hashKey: queryCatchData.hashKey as string,
        })
      );
    }
  } catch (err) {
    yield put(
      actions.failure({
        endpoint: queryCatchData.endpoint as string,
        error: err as Error,
        query: true,
        mutation: false,
        hashKey: queryCatchData.hashKey as string,
      })
    );
  }
}

const hashPrefix = "hash-".charCodeAt(0);
function isHashAction(action: PayloadAction<RequestPayload>) {
  return action.type.charCodeAt(0) === hashPrefix;
}

function* watchAllHashActions() {
  //@ts-ignore
  yield takeEvery((action: PayloadAction<RequestPayload>) => {
    if (isHashAction(action) && !action.payload.debounce) {
      const suffix = action.type?.split("-")[1];
      if (suffixCache.has(suffix)) {
        return false;
      }
      if (suffix) {
        suffixCache.add(suffix);
        return true;
      }
    } else {
      return false;
    }
  }, handleFetchDataRequest);
  //@ts-ignore
  yield takeLatest((action: PayloadAction<RequestPayload>) => {
    if (isHashAction(action) && action.payload.debounce) {
      const suffix = action.type?.split("-")[1];
      if (suffixCache.has(suffix)) {
        return false;
      }
      if (suffix) {
        suffixCache.add(suffix);
        return true;
      }
    } else {
      return false;
    }
  }, handleFetchDataRequest);
  yield takeEvery(actions.invalidateCache.type, invalidateCatchSaga);
}

export function* rootSagaFetchSaga() {
  yield all([fork(watchAllHashActions)]);
}
