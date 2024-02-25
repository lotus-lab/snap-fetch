import { all, call, put, select } from "redux-saga/effects";
import { APiConfig, EndpointResult, RequestPayload } from "../types/types";
import {
  selectQueriesDataByTags,
  selectSnapFetchApiConfig,
} from "../selectors/selectors";
import { fetcher } from "../utils/utils";
import { PayloadAction } from "@reduxjs/toolkit";
import { actions } from "../toolkit";

export function* fetchSaga(action: PayloadAction<RequestPayload>) {
  const {
    endpoint,
    resolve,

    mutation,
    query,
    fetchFunctionIsOutsider,
    hashKey,
    invalidateTags,
    transformResponse,
  } = action.payload;

  let data: unknown;

  const baseApiConfig: APiConfig = yield select(selectSnapFetchApiConfig);

  const response: Response & string = yield call(() =>
    fetcher({
      ...baseApiConfig,
      ...action.payload,
    })
  );

  if (fetchFunctionIsOutsider) {
    data = yield response;
  } else {
    data = yield response?.json();
  }

  if (resolve) {
    yield resolve(data);
  }

  if (mutation && response && invalidateTags) {
    const allQueriesWithTag: Array<EndpointResult> = yield select((state) =>
      selectQueriesDataByTags(state, invalidateTags)
    );
    if (allQueriesWithTag?.length) {
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
  }
  if (transformResponse) {
    data = yield transformResponse(data);
  }

  yield put(actions.success({ data, endpoint, mutation, query, hashKey }));
}
