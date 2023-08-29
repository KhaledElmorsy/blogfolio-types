import type { UnionToIntersection } from './util/types';

export enum GeneralError {
  ServerError = 'Server error',
  InvalidRequest = 'Invalid request',
  NotFound = 'Resource not found',
}

const Error = {
  General: GeneralError,
};

export default Error;

type Leaves<T> = {
  [f in keyof T]: T[f] extends Record<any, object> ? Leaves<T[f]> : T[f];
} extends infer G
  ? G[keyof G]
  : never;

type ErrorMap = UnionToIntersection<Leaves<typeof Error>>;

export type ErrorMessage = ErrorMap[keyof ErrorMap];
