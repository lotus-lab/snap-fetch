import { useCallback, useEffect, useState } from "react";
import { generateUniqueId } from "./utils/utils";

export const useGenHashKey = (value: string) => {
  const [hashKey, setHashKey] = useState("");
  const hashKeyGen = useCallback(async () => {
    const hashedValue = await generateUniqueId(value);

    setHashKey(hashedValue);
  }, [value]);

  useEffect(() => {
    hashKeyGen();
  }, [hashKeyGen]);
  return { hashKey };
};
