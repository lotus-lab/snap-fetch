import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { actions } from "..";
import { suffixCache } from "../saga/saga";

interface Props {
  hashKey: string | number | undefined;
  total: number;
  pageNo: number | undefined;
  size: number | undefined;
  usePagination?: boolean | undefined;
}
export const usePagination = ({
  hashKey,
  total,
  pageNo,
  size,
  usePagination,
}: Props) => {
  const dispatch = useDispatch();

  const lastPage = useMemo(() => {
    return Math.ceil(Number(total) / Number(size || 1)) || 1;
  }, [total, size]);

  const changeSize = useCallback(
    (value: number) => {
      if (hashKey && usePagination) {
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

  const next = useCallback(
    (debounce?: number) => {
      if (hashKey && usePagination) {
        suffixCache.delete(hashKey);
        dispatch(
          actions.changePageNo({
            hashKey,
            increase: true,
            debounce,
          })
        );
      }
    },
    [usePagination, hashKey]
  );

  const prev = useCallback(
    (debounce?: number) => {
      if (hashKey && usePagination) {
        suffixCache.delete(hashKey);
        dispatch(
          actions.changePageNo({
            hashKey,
            increase: false,
            debounce,
          })
        );
      }
    },
    [hashKey, usePagination]
  );

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
