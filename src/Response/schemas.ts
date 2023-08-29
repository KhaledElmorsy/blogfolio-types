import { z } from 'zod';
import {
  Error,
  SuccessResponse,
  ErrorResponse,
  ResponseBodyStatus,
} from './types';
import { ErrorMessage } from '@/Error';
import { ErrorCode, SuccessCode } from './status-codes';

export function zSuccessResponse<T extends SuccessCode, D extends z.ZodTypeAny>(
  code: T,
  data?: D
) {
  return z.object({
    status: z.literal(code),
    body: z.object({
      status: z.literal(ResponseBodyStatus.success),
      data: data ?? z.undefined(),
    }),
  }) as z.ZodType<SuccessResponse<T, z.infer<D>>>;
}

export function zError<T extends ErrorMessage, D extends z.ZodTypeAny>(
  message: T,
  detail?: D
) {
  return z.object({
    message: z.literal(message),
    detail: detail ?? z.undefined(),
  }) as z.ZodType<Error<T, z.infer<D>>>;
}

export function zErrorResponse<
  T extends ErrorCode,
  E extends ReturnType<typeof zError<ErrorMessage, z.ZodTypeAny>>[]
>(code: T, errors?: E, { errorRequired = false } = {}) {
  const errorArray = errors === undefined || !errors.length
    ? z.array(z.any()).max(0)
    : (() => {
      const elements = errors.length > 1
        ? z.union([errors[0], errors[1], ...errors.slice(1)])
        : errors[0];
      const schema = z.array(elements);
      return errorRequired ? schema.nonempty() : schema;
    })();

  return z.object({
    status: z.literal(code),
    body: z.object({
      status: z.literal(ResponseBodyStatus.failure),
      errors: errorArray,
    }),
  }) as z.ZodType<ErrorResponse<T, z.infer<E[number]>[]>>;
}
