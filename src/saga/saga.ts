/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-const */
import {
  all,
  call,
  fork,
  put,
  select,
  takeEvery,
  delay,
  cancel,
  race,
  take,
  ForkEffect,
} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import { selectSnapFetchApiConfig } from "../selectors/selectors";
import { actions } from "../toolkit";
import type {
  APiConfig,
  InvalidateCachePayload,
  RequestPayload,
} from "../types/types";
import { fetchSaga } from "./fetchSaga";
import { fetcher } from "../utils/utils";

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
    filter,
    usePagination,
    pagination,
  } = action.payload;

  try {
    const queryParams = new URLSearchParams("");

    if (filter) {
      Object.keys(filter).forEach((key) => {
        if (Array.isArray(filter?.[key])) {
          if (filter?.[key]?.length > 0) {
            if (filter?.[key]?.length === 1) {
              queryParams.append(key, filter?.[key]);
              queryParams.append(key, filter?.[key]);
            } else {
              (filter[key] as string[]).forEach((value) => {
                queryParams.append(key, value);
              });
            }
          }
        } else if (![undefined, null, ""].includes(filter?.[key])) {
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
    if (query) {
      yield put(actions.finishLoading(hashKey));
    }
    if (mutation) {
      yield put(actions.finishLoading(endpoint));
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

    const baseApiConfig: APiConfig = yield select(selectSnapFetchApiConfig);

    if (mutation && queryCatchData.tag && queryCatchData.endpoint) {
      const response: Response = yield call(() =>
        fetcher({
          ...baseApiConfig,
          ...action.payload.requestPayload,
          endpoint: queryCatchData.endpoint as string,
          queryParams: queryCatchData.queryParams,
          method: "GET",
        })
      );

      data = yield response;

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

const checkCache = (type: string | undefined) => {
  const suffix = type?.split("-")[1];
  if (suffixCache.has(suffix)) {
    return false;
  }
  if (suffix) {
    suffixCache.add(suffix);
    return true;
  }
  return false;
};

const debounceTasksMap = new Map();

function* handleDebouncedAction(action: PayloadAction<RequestPayload>) {
  const { payload } = action;
  const taskId = payload?.endpoint + payload?.tag;

  if (debounceTasksMap.has(taskId)) {
    yield cancel(debounceTasksMap.get(taskId));
    // yield put(actions.removeHashKey({ key: payload.hashKey }));
    yield debounceTasksMap.delete(taskId);
  }

  const task: ForkEffect<void> = yield fork(function* () {
    if (payload.debounce) {
      yield delay(payload.debounce);
    } else if (payload.filter) {
      yield delay(10);
    }
    yield call(handleFetchDataRequest, action);
  });

  yield debounceTasksMap.set(taskId, task);

  yield race({
    task: call(function* () {
      yield task;
    }),
    cancel: take((cancelAction: any) => {
      const effectTaskId =
        (cancelAction.payload as RequestPayload)?.endpoint +
        (cancelAction.payload as RequestPayload)?.tag;
      return (
        cancelAction.type === action.type &&
        "payload" in cancelAction &&
        "endpoint" in (cancelAction.payload as RequestPayload) &&
        effectTaskId === taskId
      );
    }),
  });
}

// This watcher will only be executed if the action being dispatched has a suffix "hash"
function* watchAllHashActions() {
  // @ts-ignore
  yield takeEvery((action: PayloadAction<RequestPayload>) => {
    if (isHashAction(action)) {
      return checkCache(action.type);
    }
    return false;
  }, handleDebouncedAction);

  yield takeEvery(actions.invalidateCache.type, invalidateCatchSaga);
}

export function* rootSnapFetchSaga() {
  yield all([fork(watchAllHashActions)]);
}
