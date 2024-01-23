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

import {
  selectQueriesDataByTags,
  selectSnapFetchApiConfig,
} from "../selectors/selectors";
import { actions } from "../toolkit";
import {
  APiConfig,
  EndpointResult,
  InvalidateCachePayload,
  RequestPayload,
} from "../types/types";
import { isEqual, fetcher } from "../utils/utils";

function* fetchDataSaga(action: PayloadAction<RequestPayload>) {
  const {
    endpoint,

    resolve,
    reject,
    mutation,
    query,
    fetchFunctionIsOutsider,
    hashKey,
    invalidateTags,
  } = action.payload;

  let data: unknown;

  try {
    const baseApiConfig: APiConfig = yield select(selectSnapFetchApiConfig);

    const response: Response & string = yield call(() =>
      fetcher({
        ...baseApiConfig,
        ...action.payload,
      })
    );

    if (!response.ok) {
      throw new Error(response);
    }

    if (fetchFunctionIsOutsider) {
      data = yield response;
    } else {
      data = yield response.json();
    }

    if (resolve) {
      yield resolve(data);
    }
    if (mutation && response && invalidateTags) {
      const allQueriesWithTag: Array<EndpointResult> = yield select((state) =>
        selectQueriesDataByTags(state, invalidateTags)
      );

      const arrayOfPuts: Array<unknown> = yield allQueriesWithTag.map(
        (queryCatchData) =>
          put(
            actions.invalidateCache({
              requestPayload: action.payload,
              queryCatchData,
            })
          )
      );

      yield all(arrayOfPuts);
    }
    yield put(actions.success({ data, endpoint, mutation, query, hashKey }));
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
  const { mutation, invalidateTags, fetchFunctionIsOutsider } =
    action.payload.requestPayload;
  const queryCatchData = action.payload.queryCatchData;

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
      isEqual(invalidateTags, queryCatchData.tags) &&
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
