import UserError from './User/ErrorMessage';
import { ErrorMessage as QueryArrayError } from './util/schema/queryArray';
import type { UnionToIntersection } from './util/types';

export enum GeneralError {
  ServerError = 'Server error',
  InvalidRequest = 'Invalid request',
  NotFound = 'Resource not found',
}

const ErrorMessages = {
  General: GeneralError,
  User: UserError,
  Request: {
    QueryArray: QueryArrayError,
  },
};

export default ErrorMessages;

type Leaves<T> = {
  [f in keyof T]: T[f] extends Record<any, object> ? Leaves<T[f]> : T[f];
} extends infer G
  ? G[keyof G]
  : never;

type ErrorMap = UnionToIntersection<Leaves<typeof ErrorMessages>>;

export type ErrorMessage = ErrorMap[keyof ErrorMap];
