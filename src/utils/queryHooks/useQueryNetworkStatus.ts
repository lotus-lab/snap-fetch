import { useEffect, useMemo, useRef } from "react";
import { useNetworkStatus } from "../useNetworkStatus";

export function useQueryNetworkStatus(refetch: () => void) {
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
      refetch();
    }
  }, [networkStatusChanged, isOnline, refetch]);
}
