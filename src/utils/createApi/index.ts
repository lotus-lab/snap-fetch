/* eslint-disable react-hooks/rules-of-hooks */
import { useSagaQuery } from "../../useSagaQuery";
import { type Result, useSagaMutation } from "../../useSagaMutation";
import type { CreateApi } from "./type";
import type {
  MutationRequestOptions,
  RequestOptions,
  SagaQueryResult,
} from "../../types/types";

type ApiHooks<
  T,
  QueryFns extends Record<
    string,
    (payload?: any) => RequestOptions<T, any> | undefined
  >,
  MutationFns extends Record<
    string,
    (payload?: any) => MutationRequestOptions<T, any>
  >
> = {
  generatedQueryHooks: {
    [K in keyof QueryFns]: (
      payload?: Parameters<QueryFns[K]>[0]
    ) => SagaQueryResult<T>;
  };
  generatedMutationHooks: {
    [K in keyof MutationFns]: (
      payload?: Parameters<MutationFns[K]>[0]
    ) => Result<T | undefined>;
  };
};

// export const createApi = <T, ActualApiRes = T>({
//   builder,
//   endpoint,
// }: CreateApi<T, ActualApiRes>) => {
//   type QueryApiKeys = keyof typeof builder.query;
//   type QueryApiHooks = {
//     [K in QueryApiKeys]: (payload?: any) => SagaQueryResult<T>;
//   };

//   const generatedQueryHooks: QueryApiHooks = builder.query
//     ? Object.keys(builder.query).reduce(
//         (acc: QueryApiHooks, key: QueryApiKeys) => {
//           const requestOpt = (payload?: any) => builder?.query?.[key](payload);
//           const query = (payload?: any) => {
//             const suffixUrl = requestOpt(payload)?.suffixUrl;
//             return useSagaQuery(
//               `${endpoint}/${suffixUrl ?? ""}`,
//               requestOpt(payload)
//             );
//           };
//           acc[key] = query;

//           return acc;
//         },
//         {}
//       )
//     : ({} as QueryApiHooks);

//   type MutationApiKeys = keyof typeof builder.mutation;
//   type MutationApiHooks = {
//     [K in MutationApiKeys]: (
//       suffixUrl?: string | number
//     ) => Result<T | undefined>;
//   };

//   const generatedMutationHooks: MutationApiHooks = builder.mutation
//     ? Object.keys(builder.mutation).reduce(
//         (acc: MutationApiHooks, key: MutationApiKeys) => {
//           const requestOpt = (payload?: string | number) =>
//             builder.mutation?.[key](payload);
//           const mutation = (payload?: string | number) => {
//             const suffixUrl = requestOpt(payload)?.suffixUrl;
//             return useSagaMutation(
//               `${endpoint}/${suffixUrl ?? ""}`,
//               requestOpt(payload)
//             );
//           };
//           acc[key] = mutation;

//           return acc;
//         },
//         {}
//       )
//     : ({} as MutationApiHooks);

//   return { generatedQueryHooks, generatedMutationHooks };
// };

export const createApi = <
  T,
  ActualApiRes = T,
  QueryFns extends Record<
    string,
    (payload?: any) => RequestOptions<T, ActualApiRes> | undefined
  > = {},
  MutationFns extends Record<
    string,
    (payload?: any) => MutationRequestOptions<T, ActualApiRes>
  > = {}
>({
  builder,
  endpoint,
}: CreateApi<T, ActualApiRes> & {
  builder: {
    query?: QueryFns;
    mutation?: MutationFns;
  };
}) => {
  type QueryApiKeys = keyof QueryFns;
  type QueryApiHooks = {
    [K in QueryApiKeys]: (
      payload?: Parameters<QueryFns[K]>[0]
    ) => SagaQueryResult<T>;
  };

  const generatedQueryHooks: QueryApiHooks = builder.query
    ? (Object.keys(builder.query) as QueryApiKeys[]).reduce((acc, key) => {
        const requestOpt = (payload?: any) => builder.query![key](payload);
        const query = (payload?: Parameters<QueryFns[typeof key]>[0]) => {
          const suffixUrl = requestOpt(payload)?.suffixUrl;
          return useSagaQuery(
            `${endpoint}/${suffixUrl ?? ""}`,
            requestOpt(payload)
          );
        };
        acc[key] = query;
        return acc;
      }, {} as QueryApiHooks)
    : ({} as QueryApiHooks);

  type MutationApiKeys = keyof MutationFns;
  type MutationApiHooks = {
    [K in MutationApiKeys]: (
      payload?: Parameters<MutationFns[K]>[0]
    ) => Result<T | undefined>;
  };

  const generatedMutationHooks: MutationApiHooks = builder.mutation
    ? (Object.keys(builder.mutation) as MutationApiKeys[]).reduce(
        (acc, key) => {
          const requestOpt = (payload?: any) => builder.mutation![key](payload);
          const mutation = (
            payload?: Parameters<MutationFns[typeof key]>[0]
          ) => {
            const suffixUrl = requestOpt(payload)?.suffixUrl;
            return useSagaMutation(
              `${endpoint}/${suffixUrl ?? ""}`,
              requestOpt(payload)
            );
          };
          acc[key] = mutation;
          return acc;
        },
        {} as MutationApiHooks
      )
    : ({} as MutationApiHooks);

  return { generatedQueryHooks, generatedMutationHooks } as ApiHooks<
    T,
    QueryFns,
    MutationFns
  >;
};
