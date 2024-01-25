import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../toolkit";

interface PaginationValue {
  data: Array<unknown> | null | undefined;
  total: number;
  pageNo: number | undefined;
  size: number | undefined;
  hashKey: string | undefined;
}

export const usePagination = ({
  data,
  total,
  pageNo,
  size,
  hashKey,
}: PaginationValue) => {
  const dispatch = useDispatch();

  const lastPage = useMemo(() => {
    return Math.ceil(total / Number(size || 1)) || 1;
  }, [total, size]);

  const changePageNo = useCallback(
    (value: number) => {
      dispatch(
        actions.changePageNo({
          hashKey,
          value,
        })
      );
    },
    [hashKey]
  );

  const changeSize = useCallback(
    (value: number) => {
      dispatch(
        actions.changeSize({
          hashKey,
          value,
        })
      );
    },
    [hashKey]
  );

  return {
    lastPage,
    currentShowingItems: data?.length,
    totalItems: total,
    changePageNo,
    changeSize,
    pageNo,
    size,
  };
};
