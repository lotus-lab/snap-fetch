import { useDispatch } from "react-redux";
import { APiConfig } from "./types/types";
import { useCallback, useEffect } from "react";
import { actions } from "./toolkit";

export const useSetBaseConfiguration = (requestInit: APiConfig) => {
  const requestString = JSON.stringify(requestInit);

  const dispatch = useDispatch();
  const setBaseConfiguration = useCallback(() => {
    dispatch(actions.setApiConfig(requestInit));
  }, [requestString]);

  useEffect(() => {
    setBaseConfiguration();
  }, [setBaseConfiguration]);
};
