import { z } from 'zod';
import {
  ErrorID,
  ErrorIDString,
  stringifyErrorID,
  ResponseError,
} from '@/ResponseError';

type SchemaError<T extends ErrorID> = ResponseError<
T,
{ path: (string | number)[] }
>;

export type ZodSchemaWithErrors<
  T extends z.ZodTypeAny = z.ZodTypeAny,
  E extends ErrorID = ErrorID
> = T & { __schemaErrors: SchemaError<E> };

/**
 * Create a Zod schema that's expected to throw errors (zod issues) with
 * stringified {@link ErrorID}'s as their message.
 *
 * Useful for quickly and automatically mapping out all the possible errors a
 * composite schema, like one for an HTTP request object, can throw.
 *
 * Errors are expected to contain the `path` array that's provided with each
 * {@link https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md#zodissue zod issue}.
 *
 * Use {@link GetSchemaErrors} to get a union of the possible errors a schema
 * (and its constituents) can throw.
 *
 * Note: We can, for the most part, only customize the message string of a zod
 * issue¹, so this factory {@link stringifyErrorID stringifies `ErrorID`s} to
 * facilitate passing them as error messages when creating the schema. The
 * server should then parse these messages back into `ErrorID`s.
 *
 * **[1]**: With {@link https://github.com/colinhacks/zod/#customize-error-path `.refine()`}
 * the zod issue `path` *can* be customized, potentially allowing us to pass the
 * error ID code there, but that forces us to use `refine()` for each rule which
 * is cumbersome, and would need accounting for if a custom error *does* need to
 * pass its own values in `path`.
 *
 * @example
 * const password = zWithErrors(
 *  // ErrorID map
 *  {
 *    tooShort: errorIDs.User.PasswordShort,
 *    tooLong: errorIDs.User.PasswordLong
 *  },
 *  // Factory CB with passed IDs already stringified.
 *  ({tooShort, tooLong}) => z.string().min(8, tooShort).max(50, tooLong)
 * )
 */
export function zWithErrors<
  T extends Record<string, ErrorID>,
  S extends z.ZodTypeAny,
  ErrorStrings = { [x in keyof T]: ErrorIDString<T[x]> }
>(errorIDMap: T, schemaFactory: (errors: ErrorStrings) => S) {
  const errorStrings = Object.fromEntries(
    Object.entries(errorIDMap).map(([key, errorID]) => [
      key,
      stringifyErrorID(errorID) as ErrorIDString<T[keyof T]>,
    ])
  ) as ErrorStrings;
  const schema = schemaFactory(errorStrings);
  return schema as ZodSchemaWithErrors<typeof schema, T[keyof T]>;
}

export type GetSchemaErrors<
  T extends
  | ZodSchemaWithErrors
  | z.ZodUnion<[z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>
  | z.ZodObject<z.ZodRawShape>
  | z.ZodArray<z.ZodTypeAny>
  | z.ZodTypeAny
> = T extends ZodSchemaWithErrors
  ? T['__schemaErrors']
  : // Distribute¹ inner schema types to keep the output type a flat union²
  T extends z.ZodUnion<[z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>
    ? T['options'][number] extends infer I
      ? I extends z.ZodTypeAny // <- [1]: Distributive conditional
        ? GetSchemaErrors<I>
        : never
      : never
    : T extends z.ZodObject<z.ZodRawShape>
      ? T['shape'][keyof T['shape']] extends infer I
        ? I extends z.ZodTypeAny
          ? GetSchemaErrors<I>
          : never
        : never
      : T extends z.ZodArray<z.ZodTypeAny>
        ? T['element'] extends infer I
          ? I extends z.ZodTypeAny
            ? GetSchemaErrors<I>
            : never
          : never
        : T extends z.ZodTypeAny & { _def: { innerType: z.ZodTypeAny } }
          ? T['_def']['innerType'] extends infer I
            ? I extends z.ZodTypeAny
              ? GetSchemaErrors<I>
              : never
            : never
          : never;
// [2]: To avoid deep types and excessive depth TS errors.
