import { z } from 'zod';
import type { ErrorID } from './ErrorID';
import type { ResponseError } from './ResponseError';

export default function zResponseError<T extends ErrorID>(
  id: T
): z.ZodType<ResponseError<T>>;
export default function zResponseError<
  T extends ErrorID,
  D extends z.ZodObject<z.ZodRawShape>
>(id: T, data: D): z.ZodType<ResponseError<T, z.infer<D>>>;
export default function zResponseError<
  T extends ErrorID,
  D extends z.ZodObject<z.ZodRawShape>
>(id: T, data?: D) {
  return z.object({
    code: z.literal(id.code),
    message: z.literal(id.message),
    data: data ?? z.undefined(),
  });
}
