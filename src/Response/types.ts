import { SuccessCode, ErrorCode } from './status-codes';
import type { ErrorMessage } from '@/Error';

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

export type Error<
  M extends ErrorMessage,
  T extends object | undefined = undefined
> = {
  message: M;
} & (T extends undefined ? {} : { detail: T });

export interface ErrorResponse<
  S extends ErrorCode,
  T extends Error<ErrorMessage, object | undefined>[]
> {
  status: S;
  body: {
    status: ResponseBodyStatus.failure;
    errors: T;
  };
}

export type Response =
  | SuccessResponse<SuccessCode, object | undefined>
  | ErrorResponse<ErrorCode, Error<ErrorMessage, object | undefined>[]>;
