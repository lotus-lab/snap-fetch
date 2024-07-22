import { useEffect, useMemo, useRef } from "react";
import { useNetworkStatus } from "../useNetworkStatus";
import { RefetchOptions } from "src/types/types";

export function useQueryNetworkStatus(
  refetch: (options?: RefetchOptions) => void
) {
  const { isOnline } = useNetworkStatus();
  const onlineRef = useRef(isOnline);

  const networkStatusChanged = useMemo(() => {
    if (isOnline !== onlineRef.current) {
      onlineRef.current = isOnline;
      return true;
    }
    return false;
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && networkStatusChanged) {
      refetch({
        staleWhileRevalidate: true,
      });
    }
  }, [networkStatusChanged, isOnline, refetch]);
}
