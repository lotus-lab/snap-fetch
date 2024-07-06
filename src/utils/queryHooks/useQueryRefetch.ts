import { useCallback } from "react";
import { suffixCache } from "../../saga/saga";

export function useQueryRefetch(
  hashKey: string,
  actionCreator: (skip?: boolean | undefined) => void
) {
  const refetch = useCallback(() => {
    if (hashKey) {
      suffixCache.delete(hashKey);
      actionCreator(false);
    }
  }, [hashKey]);

  return refetch;
}
