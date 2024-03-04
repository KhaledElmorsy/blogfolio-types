import { z } from 'zod';
import { SuccessResponse, FailureResponse } from './types';
import { ErrorCode, SuccessCode } from './status-codes';
import { ErrorID, zResponseError } from '@/ResponseError';

export function zSuccessResponse<T extends SuccessCode>(
  code: T
): z.ZodType<SuccessResponse<T>>;
export function zSuccessResponse<T extends SuccessCode, D extends z.ZodTypeAny>(
  code: T,
  data: D
): z.ZodType<SuccessResponse<T, z.infer<D>>>;
export function zSuccessResponse<T extends SuccessCode, D extends z.ZodTypeAny>(
  code: T,
  data?: D
) {
  return data === undefined
    ? (z.object({
      status: z.literal(code),
      body: z.object({}),
    }) as z.ZodType<SuccessResponse<T>>)
    : z.object({
      status: z.literal(code),
      body: data,
    });
}

export function zFailureResponse<
  T extends ErrorCode,
  E extends (
    | ReturnType<typeof zResponseError<ErrorID, z.ZodObject<z.ZodRawShape>>>
    | ReturnType<typeof zResponseError<ErrorID>>
  )[]
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
      errors: errorArray,
    }),
  }) as z.ZodType<FailureResponse<T, z.infer<E[number]>[]>>;
}
