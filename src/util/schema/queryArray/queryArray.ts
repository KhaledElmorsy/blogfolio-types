import { ZodEffects, z } from 'zod';
import { inSet } from '@/util';
import { stringifyErrorID, errorIDs } from '@/ResponseError';

interface Options<O, S extends string | undefined> {
  /**
   * Constrain array elements to be unique. With subvalues, uniqueness only
   * constrains keys.
   * @example
   * // unique = true
   * valid = 'bar,foo,buzz';
   * invalid = 'bar,bar,foo';
   * validSubvalues = 'bar:true,foo:true';
   * invalidSubvalues = 'bar:true,bar:false';
   */
  unique?: boolean;
  /**
   * Allow array elements to have paired sub-values.
   * @example
   * input = 'foo:asc,bar:desc,buzz';
   * transformed = [{foo:'asc'}, {bar: 'desc'}, {buzz: undefined}]
   */
  withSubValues?: O;
  /**
   * Limit the possible sub-value options, to allow elements without subvalues
   * add `undefined` to the array.
   *
   * Any value/undefined allowed by default.
   */
  allowedSubValues?: S[] | Readonly<S[]>;
}

function queryArray<T extends string, S extends string | undefined>(
  allowed?: T[] | Readonly<T[]> | [],
  { withSubValues = false, unique, allowedSubValues }?: Options<false, S>
): ZodEffects<z.ZodString, T[], string>;
function queryArray<T extends string, S extends string | undefined>(
  allowed: T[] | Readonly<T[]> | [],
  { withSubValues = true, unique, allowedSubValues }: Options<true, S>
): ZodEffects<z.ZodString, Partial<{ [K in T]: S }>[], string>;
/**
 * Verify and transform a comma separated query array: `foo,bar,buzz`
 * to an array of strings: `['foo','bar','buzz']`.
 *
 * Restrict possible values by passing an array of valid options.
 *
 * Only allows alphanumeric characters.
 * @param options Optional array of allowed string array options.
 */
function queryArray<T extends string, S extends string>(
  allowed: T[] | Readonly<T[]> | [] = [],
  {
    withSubValues = false,
    unique = false,
    allowedSubValues = [],
  }: Options<boolean, S> = {}
) {
  const allowedSet = new Set(allowed);
  const allowedSubValueSet = new Set(allowedSubValues);

  // Alphanumeric elements with possible optional subvalues.
  const regex = withSubValues
    ? /^([^\W_]+(:[^\W_]+)?,?)+[^,]$/ // 'foo:asc,bar,buzz:10'
    : /^([^\W_]+,?)+[^,]$/; // 'foo,bar,buzz,123'

  return z
    .string()
    .regex(regex, stringifyErrorID(errorIDs.Request.QueryArray.InvalidFormat))
    .transform((str, ctx) => {
      const elementSet: Set<T> = new Set();
      const elements: any[] = [];
      str.split(',').forEach((element: T | string) => {
        const [key, value] = withSubValues ? element.split(':') : [element];
        if (unique && inSet(elementSet, key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: stringifyErrorID(
              errorIDs.Request.QueryArray.InvalidFormat
            ),
            path: [key],
          });
          return;
        }
        if (allowedSet.size && !inSet(allowedSet, key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: stringifyErrorID(errorIDs.Request.QueryArray.InvalidValue),
            path: [element],
          });
          return;
        }
        if (withSubValues) {
          if (allowedSubValueSet.size && !inSet(allowedSubValueSet, value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: stringifyErrorID(
                errorIDs.Request.QueryArray.InvalidValue
              ),
              path: [`${key}: [${value}]`],
            });
            return;
          }
          elements.push({ [key]: value } as any);
        } else {
          elements.push(key as any);
        }
        elementSet.add(key as T);
      });
      return elements;
    });
}

export default queryArray;
