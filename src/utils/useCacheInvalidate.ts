import { useCallback, useEffect } from "react";
import { EndpointResult } from "../types/types";

interface Props {
  SnapFetchData: EndpointResult | undefined;
  cacheExpirationTime: number | undefined;
  refetch: () => void;
}
export const useCacheInvalidate = ({
  SnapFetchData,
  cacheExpirationTime,
  refetch,
}: Props) => {
  const refetchOnCacheLimitPassed = useCallback(
    () =>
      cacheExpirationTime &&
      SnapFetchData?.createdAt &&
      SnapFetchData.createdAt.getTime() + cacheExpirationTime * 1000 <
        Date.now() &&
      refetch(),
    [cacheExpirationTime, SnapFetchData?.createdAt]
  );

  useEffect(() => {
    refetchOnCacheLimitPassed();
  }, [refetchOnCacheLimitPassed]);
};
