import { SuccessCode, ErrorCode } from './status-codes';
import type { ErrorMessage } from '@/Error';

export enum ResponseBodyStatus {
  success = 'success',
  failure = 'failure',
}

export interface SuccessResponse<
  S extends SuccessCode,
  D extends object | undefined
> {
  status: S;
  body: {
    status: ResponseBodyStatus.success;
    data?: D;
  };
}

export interface Error<M extends ErrorMessage, T> {
  message: M;
  detail?: T;
}

export interface ErrorResponse<
  S extends ErrorCode,
  T extends Error<ErrorMessage, unknown>[]
> {
  status: S;
  body: {
    status: ResponseBodyStatus.failure;
    errors: T;
  };
}

export type Response<
  R extends (
    | SuccessResponse<SuccessCode, object | undefined>
    | ErrorResponse<ErrorCode, Error<ErrorMessage, unknown>[]>
  )[]
> = R[number];
