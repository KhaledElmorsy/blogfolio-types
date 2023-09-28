import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import zResponseError from '../zResponseError';
import { ErrorID } from '../ErrorID';

const testID = {
  code: 999,
  message: 'Test',
} as unknown as ErrorID;

describe('zResponseError()', () => {
  it.each([
    [
      'Correct error ID',
      {
        schema: zResponseError(testID),
        error: {
          ...testID,
        },
      },
    ],
    [
      'Correct "data" field type',
      {
        schema: zResponseError(testID, z.object({ a: z.string() })),
        error: {
          ...testID,
          data: { a: 'nice' },
        },
      },
    ],
  ])('Parses valid inputs: %s', (_, { schema, error }) => {
    expect(() => schema.parse(error)).not.toThrow();
  });

  it.each([
    [
      'Wrong error ID code',
      {
        schema: zResponseError(testID),
        error: {
          ...testID,
          code: testID.code + 1,
        },
      },
    ],
    [
      'Wrong error ID message',
      {
        schema: zResponseError(testID),
        error: {
          ...testID,
          message: `${testID.message}!`,
        },
      },
    ],
    [
      'Wrong "data" field type',
      {
        schema: zResponseError(testID, z.object({ a: z.string() })),
        error: {
          ...testID,
          data: { a: 123 },
        },
      },
    ],
    [
      'Error has "data" field when not defined in the schema',
      {
        schema: zResponseError(testID),
        error: {
          ...testID,
          data: {},
        },
      },
    ],
    [
      'Missing "data" field while defined in the schema',
      {
        schema: zResponseError(testID, z.object({ a: z.number() })),
        error: {
          ...testID,
        },
      },
    ],
  ])('Catches invalid inputs: %s', (_, { schema, error }) => {
    expect(() => schema.parse(error)).toThrow();
  });
});
