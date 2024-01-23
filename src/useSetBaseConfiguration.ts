import { useDispatch, useSelector } from "react-redux";
import { selectSnapFetchApiConfig } from "./selectors/selectors";
import { APiConfig } from "./types/types";
import { useCallback, useEffect } from "react";
import { isEqual } from "./utils/utils";
import { actions } from "./toolkit";

export const useSetBaseConfiguration = (requestInit: APiConfig) => {
  const prevApiConfig = useSelector(selectSnapFetchApiConfig);
  const apiConfigString = JSON.stringify(prevApiConfig);
  const requestString = JSON.stringify(requestInit);
  const dispatch = useDispatch();
  const setBaseConfiguration = useCallback(() => {
    if (!isEqual(apiConfigString, requestString)) {
      dispatch(actions.setApiConfig(requestInit));
    }
  }, [dispatch, requestString, apiConfigString]);

  useEffect(() => {
    setBaseConfiguration();
  }, [setBaseConfiguration]);
};
