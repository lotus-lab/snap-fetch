import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { actions } from "src/toolkit";
import { suffixCache } from "../saga/saga";

interface Props {
  hashKey: string | number | undefined;
  total: number;
  pageNo: number | undefined;
  size: number | undefined;
}
export const usePagination = ({ hashKey, total, pageNo, size }: Props) => {
  const dispatch = useDispatch();

  const lastPage = useMemo(() => {
    return Math.ceil(Number(total) / Number(size || 1)) || 1;
  }, [total, size]);

  const changeSize = useCallback(
    (value: number) => {
      if (hashKey) {
        suffixCache.delete(hashKey);
        dispatch(
          actions.changeSize({
            hashKey,
            value,
          })
        );
      }
    },
    [hashKey]
  );

  const next = (debounce?: number) => {
    if (hashKey) {
      suffixCache.delete(hashKey);
      dispatch(
        actions.changePageNo({
          hashKey,
          increase: true,
          debounce,
        })
      );
    }
  };

  const prev = (debounce?: number) => {
    if (hashKey) {
      suffixCache.delete(hashKey);
      dispatch(
        actions.changePageNo({
          hashKey,
          increase: false,
          debounce,
        })
      );
    }
  };

  return {
    lastPage,
    prev,
    totalItems: total,
    next,
    changeSize,
    pageNo,
    size,
  };
};
