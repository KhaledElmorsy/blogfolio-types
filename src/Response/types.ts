import { SuccessCode, ErrorCode } from './status-codes';
import type { ErrorID, ResponseError } from '@/ResponseError';

export interface Response {
  status: SuccessCode | ErrorCode;
  body: Object;
}

export interface SuccessResponse<
  T extends SuccessCode = SuccessCode,
  D extends Object | undefined = undefined
> extends Response {
  status: T;
  body: D extends undefined ? {} : D;
}

export interface FailureResponse<
  T extends ErrorCode = ErrorCode,
  E extends undefined | ResponseError<ErrorID>[] = undefined
> extends Response {
  status: T;
  body: {
    errors: E extends undefined ? [] : E;
  };
}
