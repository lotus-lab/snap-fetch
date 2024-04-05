import { useCallback, useEffect } from "react";
import { EndpointResult } from "../types/types";

interface Props {
  snapFetchData: EndpointResult | undefined;
  cacheExpirationTime: number | undefined;
  fetchData: () => Promise<void>;
}
export const useCacheInvalidate = ({
  snapFetchData,
  cacheExpirationTime,
  fetchData,
}: Props) => {
  const refetchOnCacheLimitPassed = useCallback(() => {
    if (cacheExpirationTime && snapFetchData?.createdAt) {
      if (
        snapFetchData.createdAt.getTime() + cacheExpirationTime * 1000 <
        new Date().getTime()
      ) {
        fetchData();
      }
    }
  }, [cacheExpirationTime, snapFetchData?.createdAt]);

  useEffect(() => {
    refetchOnCacheLimitPassed();
  }, [refetchOnCacheLimitPassed]);
};
