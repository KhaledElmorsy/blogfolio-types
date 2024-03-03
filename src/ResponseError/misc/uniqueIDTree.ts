import type { BaseErrorID } from './BaseErrorID';
import type { UnionToIntersection } from '@/util/types';

type DuplicateFieldValues<
  T extends Record<string, BaseErrorID>,
  F extends keyof BaseErrorID
> = {
  [x in keyof T as Exclude<keyof T, x> extends infer I
    ? I extends keyof T
      ? T[I][F] extends T[x][F]
        ? x
        : never
      : never
    : never]: T[x][F];
} extends infer G
  ? G[keyof G]
  : never;

type MapDuplicateFieldsToErrors<
  T extends Record<string, BaseErrorID>,
  F extends keyof BaseErrorID,
  V extends T[F] & string = DuplicateFieldValues<T, F>
> = {
  [x in V]: keyof T extends infer K
    ? K extends keyof T
      ? T[K][F] extends x
        ? K
        : never
      : never
    : never;
};

type KeysToDotPath<T extends object, S extends string = ''> = {
  [x in keyof T & string as `${S}${x}`]: T[x] extends BaseErrorID
    ? T[x]
    : T[x] extends object
      ? KeysToDotPath<T[x], `${S}${x}.`>
      : never;
};

type Leaves<T extends object> = {
  [x in keyof T as T[x] extends BaseErrorID ? x : never]: T[x];
} & UnionToIntersection<
{
  [x in keyof T as T[x] extends BaseErrorID ? never : x]: T[x] extends object
    ? Leaves<T[x]>
    : never;
} extends infer L
  ? L[keyof L]
  : never
>;

/**
 * Ensure that all {@link ErrorID} leaves in an optionally nested object have
 * unique codes and messages.
 *
 * Checking is done by Typescript and compile/build time, not runtime.
 */
export default function uniqueIDTree<
  T extends object,
  V = Leaves<KeysToDotPath<T>>,
  I extends Record<string, BaseErrorID> = V extends Record<string, BaseErrorID>
    ? { [k in keyof V]: V[k] }
    : Record<string, BaseErrorID>,
  DCode = MapDuplicateFieldsToErrors<I, 'code'>,
  DMessage = MapDuplicateFieldsToErrors<I, 'message'>
>(
  errorMap: T extends (
    Leaves<T> extends Record<string, BaseErrorID> ? T : never
  )
    ? T extends ({} extends DCode & DMessage ? T : never)
      ? T
      : [
        never,
        'Duplicate codes/messages exist',
        { 'Duplicate Codes': { [x in keyof DCode]: DCode[x] } },
        { 'Duplicate Messages': { [x in keyof DMessage]: DMessage[x] } }
      ]
    : [never, 'Leaves must satisfy type Record<string, BaseErrorID>']
) {
  return errorMap;
}
