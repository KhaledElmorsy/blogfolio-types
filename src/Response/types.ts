import { SuccessCode, ErrorCode } from './status-codes';
import type { ErrorMessage } from '@/ErrorMessage';

export enum ResponseBodyStatus {
  success = 'success',
  failure = 'failure',
}

export interface SuccessResponse<
  S extends SuccessCode,
  D extends object | undefined = undefined
> {
  status: S;
  body: {
    status: ResponseBodyStatus.success;
  } & (D extends undefined ? {} : { data: D });
}

export type ResponseError<
  M extends ErrorMessage,
  T extends object | undefined = undefined
> = {
  message: M;
} & (T extends undefined ? {} : { detail: T });

export interface FailureResponse<
  S extends ErrorCode,
  T extends ResponseError<ErrorMessage, object | undefined>[]
> {
  status: S;
  body: {
    status: ResponseBodyStatus.failure;
    errors: T;
  };
}

export type Response =
  | SuccessResponse<SuccessCode, object | undefined>
  | FailureResponse<
  ErrorCode,
  ResponseError<ErrorMessage, object | undefined>[]
  >;
