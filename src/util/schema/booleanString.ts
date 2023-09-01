import { z } from 'zod';

/**
 * Enforce stringified boolean values (and 0/1), and transform them to their
 * boolean equivalents.
 *
 * For those times your booleans get serialized.
 * Like URL query parameters.
 */
export default z
  .enum(['true', 'false', '0', '1'])
  .transform((value) => ['true', '1'].includes(value.toLowerCase()));
