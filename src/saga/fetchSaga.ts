/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { all, call, put, select } from "redux-saga/effects";
import { APiConfig, EndpointResult, RequestPayload } from "../types/types";
import {
  selectQueriesDataByTags,
  selectSnapApiConfig,
} from "../selectors/selectors";
import { fetcher } from "../utils/utils";
import { actions } from "../toolkit";

export function* fetchSnap(payload: RequestPayload) {
  const {
    endpoint,
    resolve,
    mutation,
    query,
    hashKey,
    invalidateTags,
    transformResponse,
  } = payload;

  let data: unknown;

  const baseApiConfig: APiConfig = yield select(selectSnapApiConfig);
  const fetcherPayload: RequestPayload<any, any> = {
    ...baseApiConfig,
    ...payload,
    headers: { ...baseApiConfig.headers, ...payload.headers },
  };

  //@ts-ignore
  const response: Response = yield call(() => fetcher(fetcherPayload));

  data = yield response;

  if (resolve) {
    yield resolve(data);
  }

  if (transformResponse && data) {
    data = yield transformResponse(data);
  }
  yield put(actions.success({ data, endpoint, mutation, query, hashKey }));

  if (mutation && response && invalidateTags) {
    const allQueriesWithTag: Array<EndpointResult> = yield select((state) =>
      selectQueriesDataByTags(state, invalidateTags)
    );
    if (allQueriesWithTag?.length) {
      const arrayOfPuts: Array<unknown> = yield allQueriesWithTag.map(
        (queryCatchData) =>
          put(
            actions.invalidateCache({
              requestPayload: payload,
              queryCatchData,
            })
          )
      );

      yield all(arrayOfPuts);
    }
  }
}
