import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
  takeLeading,
} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";

import { selectSnapFetchApiConfig } from "../selectors/selectors";
import { actions } from "../toolkit";
import {
  APiConfig,
  InvalidateCachePayload,
  RequestPayload,
} from "../types/types";
import { fetcher } from "../utils/utils";
import { fetchSaga } from "./fetchSaga";

function* fetchDataSaga(action: PayloadAction<RequestPayload>) {
  const { endpoint, reject, mutation, query, hashKey } = action.payload;

  try {
    yield call(() => fetchSaga(action));
  } catch (err) {
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

    if (
      mutation &&
      // isEqual(invalidateTags, queryCatchData.tags) &&
      queryCatchData.tags &&
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

      if (fetchFunctionIsOutsider) {
        data = yield response;
      } else {
        data = yield response.json();
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

export function* querySaga() {
  yield takeEvery(actions.takeEveryRequest.type, fetchDataSaga);
  yield takeLatest(actions.takeLatestRequest.type, fetchDataSaga);
  yield takeLeading(actions.takeLeadingRequest.type, fetchDataSaga);
  yield takeEvery(actions.invalidateCache.type, invalidateCatchSaga);
}

export function* rootSnapFetchSaga() {
  yield all([querySaga()]);
}
