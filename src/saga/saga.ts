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
  selectCacheBoltApiConfig,
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

    invalidateTags,
  } = action.payload;

  let data: unknown;

  try {
    const baseApiConfig: APiConfig = yield select(selectCacheBoltApiConfig);

    const response: Response = yield call(() =>
      fetcher({
        ...baseApiConfig,
        ...action.payload,
      })
    );

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
    yield put(actions.success({ data, endpoint, mutation, query }));
  } catch (err) {
    yield put(
      actions.failure({ endpoint, error: err as Error, query, mutation })
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
      })
    );

    const baseApiConfig: APiConfig = yield select(selectCacheBoltApiConfig);

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

export function* rootCacheBoltSaga() {
  yield all([querySaga()]);
}
