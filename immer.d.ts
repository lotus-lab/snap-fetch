declare module "immer" {
  export type Draft<T> = T extends ReadonlyArray<infer U>
    ? DraftArray<U>
    : T extends ReadonlyMap<infer K, infer V>
    ? DraftMap<K, V>
    : T extends ReadonlySet<infer S>
    ? DraftSet<S>
    : T extends object
    ? DraftObject<T>
    : T;

  export interface DraftArray<T> extends Array<Draft<T>> {}

  export interface DraftMap<K, V> extends Map<Draft<K>, Draft<V>> {}

  export interface DraftSet<T> extends Set<Draft<T>> {}

  export type DraftObject<T> = {
    [K in keyof T]: Draft<T[K]>;
  };

  export type DraftState<T> = T extends object ? Draft<T> : T;

  export function produce<T>(
    baseState: T,
    recipe: (draftState: DraftState<T>) => void | T,
    options?: PatchListenerOptions
  ): T;

  // Other immer functions and types...
}
