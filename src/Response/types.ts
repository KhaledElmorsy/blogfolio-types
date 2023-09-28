import { SuccessCode, ErrorCode } from './status-codes';
import type { ErrorID, ResponseError } from '@/ResponseError';

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

export interface FailureResponse<
  S extends ErrorCode,
  T extends ResponseError<ErrorID, object | undefined>[]
> {
  status: S;
  body: {
    status: ResponseBodyStatus.failure;
    errors: T;
  };
}

export type Response =
  | SuccessResponse<SuccessCode, object | undefined>
  | FailureResponse<ErrorCode, ResponseError<ErrorID, object | undefined>[]>;
