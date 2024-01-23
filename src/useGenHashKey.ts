import { useCallback, useEffect, useState } from "react";
import { generateUniqueId } from "./utils/utils";

export const useGenHashKey = (value: string) => {
  const [hashKey, setHashKey] = useState("");
  const hashKeyGen = useCallback(() => {
    return generateUniqueId(value).then(setHashKey);
  }, [value]);

  useEffect(() => {
    hashKeyGen();
  }, [hashKeyGen]);
  return { hashKey };
};
