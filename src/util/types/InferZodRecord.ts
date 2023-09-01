import { ZodTypeAny, infer as zInfer } from 'zod';

/**
 * Infer the types of Zod type properties in an object.
 *
 * Makes grouping and exporting schemas and their types
 * more concise without inferring at the destination module.
 *
 * @example
 * const ZodTypes = {
 *  foo: z.string(),
 *  bar: z.number()
 * }
 *
 * type Types = InferZodRecord<ZodRecord>;
 * // Types['foo'] = string;
 * // Types['bar'] = number;
 */
export type InferZodRecord<T extends { [key: string]: ZodTypeAny }> = {
  [key in keyof T]: zInfer<T[key]>;
};
