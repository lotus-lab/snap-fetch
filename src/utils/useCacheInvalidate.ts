import { useCallback, useEffect } from "react";
import { suffixCache } from "../saga/saga";

interface Props {
  createdAt: Date | undefined;
  cacheExpirationTime: number | undefined;
  hashKey: string | undefined;
}
export const useCacheInvalidate = ({
  createdAt,
  cacheExpirationTime,
  hashKey,
}: Props) => {
  const refetchOnCacheLimitPassed = useCallback(() => {
    if (
      cacheExpirationTime &&
      createdAt &&
      createdAt.getTime() + cacheExpirationTime * 1000 < Date.now() &&
      hashKey
    ) {
      suffixCache.delete(hashKey);
    }
  }, [cacheExpirationTime, createdAt, hashKey]);

  useEffect(() => {
    refetchOnCacheLimitPassed();
  }, [refetchOnCacheLimitPassed]);
};
