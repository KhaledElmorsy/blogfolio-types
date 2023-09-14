// @ts-nocheck

import { z } from 'zod';
import { describe, it, expect } from 'vitest';
import { zSuccessResponse, zResponseError, zFailureResponse } from '../schemas';
import { ResponseBodyStatus } from '../types';

const TestEnum = {
  Test: 1,
  Test2: 2,
};

describe('zSuccessResponse()', () => {
  it.each([
    [
      'Without a "data" field',
      {
        schema: zSuccessResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test,
          body: {
            status: ResponseBodyStatus.success,
          },
        },
      },
    ],
    [
      'With a "data" field',
      {
        schema: zSuccessResponse(TestEnum.Test, z.array(z.string())),
        response: {
          status: TestEnum.Test,
          body: {
            status: ResponseBodyStatus.success,
            data: ['wow'],
          },
        },
      },
    ],
  ])('Parses valid responses: %s', (_, { schema, response }) => {
    expect(() => schema.parse(response)).not.toThrow();
  });

  it.each([
    [
      'Wrong code',
      {
        schema: zSuccessResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test2,
          body: {
            status: ResponseBodyStatus.success,
          },
        },
      },
    ],
    [
      'Present "data" field that should be undefined',
      {
        schema: zSuccessResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test,
          body: {
            status: ResponseBodyStatus.success,
            data: 'darn',
          },
        },
      },
    ],
    [
      'Missing "data" field',
      {
        schema: zSuccessResponse(TestEnum.Test, z.string()),
        response: {
          status: ResponseBodyStatus.success,
        },
      },
    ],
    [
      'Incorrect "data" field type',
      {
        schema: zSuccessResponse(TestEnum.Test, z.string()),
        response: {
          status: ResponseBodyStatus.success,
          data: 1,
        },
      },
    ],
    [
      'Incorrect response body status',
      {
        schema: zSuccessResponse(TestEnum.Test),
        response: {
          status: ResponseBodyStatus.failure,
        },
      },
    ],
  ])('Catches invalid responses: %s', (_, { schema, response }) => {
    expect(() => schema.parse(response)).toThrow();
  });
});

describe('zResponseError()', () => {
  it.each([
    [
      'Correct error message',
      {
        schema: zResponseError(TestEnum.Test),
        error: {
          message: TestEnum.Test,
        },
      },
    ],
    [
      'Correct "detail" field type',
      {
        schema: zResponseError(TestEnum.Test, z.string()),
        error: {
          message: TestEnum.Test,
          detail: 'nice',
        },
      },
    ],
  ])('Parses valid inputs: %s', (_, { schema, error }) => {
    expect(() => schema.parse(error)).not.toThrow();
  });

  it.each([
    [
      'Wrong error message',
      {
        schema: zResponseError(TestEnum.Test),
        error: {
          message: TestEnum.Test2,
        },
      },
    ],
    [
      'Wrong "detail" field type',
      {
        schema: zResponseError(TestEnum.Test, z.string()),
        error: {
          message: TestEnum.Test,
          detail: 0,
        },
      },
    ],
    [
      'Has "detail" field when not defined in the schema',
      {
        schema: zResponseError(TestEnum.Test),
        error: {
          message: TestEnum.Test,
          detail: {},
        },
      },
    ],
    [
      'Missing "detail" field',
      {
        schema: zResponseError(TestEnum.Test, z.number()),
        error: {
          message: TestEnum.Test,
        },
      },
    ],
  ])('Catches invalid inputs: %s', (_, { schema, error }) => {
    expect(() => schema.parse(error)).toThrow();
  });
});

describe('zFailureResponse():', () => {
  const defaultBody = {
    status: ResponseBodyStatus.failure,
    errors: [],
  };

  it.each([
    [
      'Correct error code',
      {
        schema: zFailureResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test,
          body: defaultBody,
        },
      },
    ],
    [
      'Correct -required- error(s)',
      {
        schema: zFailureResponse(
          TestEnum.Test,
          [z.literal('yes'), z.literal('good')],
          { errorRequired: true }
        ),
        response: {
          status: TestEnum.Test,
          body: {
            status: ResponseBodyStatus.failure,
            errors: ['yes'],
          },
        },
      },
    ],
    [
      'Correct -optional- errors',
      {
        schema: zFailureResponse(TestEnum.Test, [z.literal('?')], {
          errorRequired: false,
        }),
        response: {
          status: TestEnum.Test,
          body: defaultBody,
        },
      },
    ],
  ])('Parses valid responses: %s', (_, { schema, response }) => {
    expect(() => schema.parse(response)).not.toThrow();
  });

  it.each([
    [
      'Wrong error code',
      {
        schema: zFailureResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test2,
          body: defaultBody,
        },
      },
    ],
    [
      'Wrong response body status',
      {
        schema: zFailureResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test,
          body: { ...defaultBody, status: ResponseBodyStatus.success },
        },
      },
    ],
    [
      'Missing errors array',
      {
        schema: zFailureResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test,
          body: {
            status: defaultBody.status,
          },
        },
      },
    ],
    [
      'Invalid error types',
      {
        schema: zFailureResponse(TestEnum.Test, [z.literal('oof')]),
        response: {
          status: TestEnum.Test,
          body: {
            ...defaultBody,
            errors: ['wrong'],
          },
        },
      },
    ],
    [
      'Empty error array when errors are required',
      {
        schema: zFailureResponse(TestEnum.Test, [z.literal('any')], {
          errorRequired: true,
        }),
        response: {
          status: TestEnum.Test,
          body: { ...defaultBody, errors: [] },
        },
      },
    ],
    [
      'Non-empty Error array with no defined error schemas',
      {
        schema: zFailureResponse(TestEnum.Test),
        response: {
          status: TestEnum.Test,
          body: { ...defaultBody, errors: ['?'] },
        },
      },
    ],
  ])('Catches invalid responses: %s', (_, { schema, response }) => {
    expect(() => schema.parse(response)).toThrow();
  });
});
