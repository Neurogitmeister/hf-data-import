type NeverUnknown<Known, Any> = { [P in Exclude<keyof Any, keyof Known>]: never };

type SubtypeDef<T, S> = NeverUnknown<T, S> &
  Partial<{ [K in keyof (T | S)]: T[K] | SubtypeDef<T[K], S[K]> }>;

export type Subtype<T, S extends SubtypeDef<T, S>> = { [K in keyof S]: S[K] };
