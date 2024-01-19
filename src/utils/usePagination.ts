import { useCallback, useMemo, useState } from "react";

interface PaginationValue {
  data: Array<unknown> | null | undefined;
  total: number;
}

export const usePagination = ({ data, total }: PaginationValue) => {
  const [pagination, setPagination] = useState({ pageNo: 1, size: 10 });
  const lastPage = useMemo(() => {
    return Math.ceil(total / Number(pagination.size || 1)) || 1;
  }, [total, pagination.size]);

  const changePageNo = useCallback((pageNo: number) => {
    setPagination((prev) => ({ ...prev, pageNo }));
  }, []);

  const changeSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, size }));
  }, []);

  return {
    ...pagination,
    lastPage,
    currentShowingItems: data?.length,
    totalItems: total,
    changePageNo,
    changeSize,
  };
};
