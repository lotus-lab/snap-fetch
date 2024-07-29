import { useCallback, useEffect } from 'react';
import type { EndpointKey, RefetchOptions } from '../types/types';

interface Props {
  createdAt: Date | undefined;
  cacheExpirationTime: number | undefined;
  hashKey: EndpointKey;
  refetch: (options?: RefetchOptions) => void;
}
export const useCacheInvalidate = ({
  createdAt,
  cacheExpirationTime,
  hashKey,
  refetch,
}: Props) => {
  const refetchOnCacheLimitPassed = useCallback(() => {
    if (
      cacheExpirationTime &&
      createdAt &&
      createdAt.getTime() + cacheExpirationTime * 1000 < Date.now() &&
      hashKey
    ) {
      refetch({
        staleWhileRevalidate: true,
      });
    }
  }, [cacheExpirationTime, createdAt, hashKey]);

  useEffect(() => {
    refetchOnCacheLimitPassed();
  }, [refetchOnCacheLimitPassed]);
};
