import type { MutationRequestOptions, RequestOptions } from "../../types/types";

// export interface CreateApi<T, ActualApiRes> {
//   endpoint: string;
//   builder: {
//     query?: {
//       [key: string]: (
//         payload?: any
//       ) => RequestOptions<T, ActualApiRes> | undefined;
//     };
//     mutation?: {
//       [key: string]: (payload?: any) => MutationRequestOptions<T, ActualApiRes>;
//     };
//   };
// }

export interface CreateApi<T, ActualApiRes> {
  endpoint: string;
  builder: {
    query?: Record<
      string,
      (payload?: any) => RequestOptions<T, ActualApiRes> | undefined
    >;
    mutation?: Record<
      string,
      (payload?: any) => MutationRequestOptions<T, ActualApiRes>
    >;
  };
}
