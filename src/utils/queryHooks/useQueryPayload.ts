import { useSelector } from "react-redux";
import { useMemo } from "react";
import type {
  EndpointKey,
  EndpointResult,
  RequestOptions,
} from "../../types/types";
import { selectSnapFetchApiConfig } from "../../selectors/selectors";

interface Options<T, ActualApiRes> {
  sagaQueryData: EndpointResult;
  endpoint: string;
  requestOptions: RequestOptions<T, ActualApiRes>;
  hashKey: EndpointKey;
}

export function useQueryPayload<T, ActualApiRes>({
  endpoint,
  hashKey,
  requestOptions,
  sagaQueryData,
}: Options<T, ActualApiRes>) {
  const baseConfig = useSelector(selectSnapFetchApiConfig);
  return useMemo(() => {
    return {
      ...baseConfig,
      ...requestOptions,
      endpoint,
      query: true,
      mutation: false,
      hashKey,
      fetchFunctionIsOutsider: !!requestOptions.fetchFunction,
      createdAt: new Date(),
      pagination: {
        pageNo: sagaQueryData?.pagination?.pageNo ?? 1,
        size: sagaQueryData?.pagination?.size ?? 10,
      },
    };
  }, [
    JSON.stringify(requestOptions),
    JSON.stringify(baseConfig),
    hashKey,
    endpoint,
    sagaQueryData?.pagination?.pageNo,
    sagaQueryData?.pagination?.size,
  ]);
}
