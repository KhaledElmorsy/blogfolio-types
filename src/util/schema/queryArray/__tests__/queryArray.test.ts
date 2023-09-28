import { it, expect } from 'vitest';
import queryArray from '../queryArray';

it.each([
  ['Comma sep. letters', 'foo,bar,buzz', ['foo', 'bar', 'buzz']],
  [
    'Comma sep. alphanunmeric chars',
    'foo123,123,buzz',
    ['foo123', '123', 'buzz'],
  ],
])('Parses valid inputs: %s', (_, testString, expected) => {
  expect(queryArray().parse(testString)).toEqual(expected);
});

it.each([
  [
    'Alphanumeric subvalues',
    'foo:asc,bar:120',
    [{ foo: 'asc' }, { bar: '120' }],
  ],
  [
    'Optional subvalues',
    'foo:asc,bar,buzz:120',
    [{ foo: 'asc' }, { bar: undefined }, { buzz: '120' }],
  ],
])('Parses valid key/value pairs : %s', (_, testString, expected) => {
  const output = queryArray([], { withSubValues: true }).parse(testString);
  expect(output).toEqual(expected);
});

it.each([
  ['Spaces', 'foo, bar, buzz'],
  ['Trailing comma', 'foo,bar,buzz,'],
  ['Leading comma', ',foo,bar'],
  ['Symbols', 'foo!,bar?'],
  ['Adjacent commas', 'foo,,bar'],
  ['Key/value pairs (with the option disables)', 'foo:asc,bar:20'],
])('Invalid inputs throw: %s', (_, testString) => {
  expect(() => queryArray().parse(testString)).toThrow();
});

it('Can constrain element values to specific passed inputs', () => {
  const limitedQA = queryArray(['foo', 'bar']);
  const invalidString = 'foo,bar,buzz';
  expect(() => limitedQA.parse(invalidString)).toThrow();
  const validString = 'foo,bar';
  expect(() => limitedQA.parse(validString)).not.toThrow();

  const limitedQAPairs = queryArray(['foo'], { withSubValues: true });
  const invalidPairs = 'foo:test,bar:asc,buzz';
  expect(() => limitedQAPairs.parse(invalidPairs)).toThrow();
  const validPairs = 'foo:test';
  expect(() => limitedQAPairs.parse(validPairs)).not.toThrow();
});

it('Can constrain arrays to only unique values', () => {
  const uniqueQA = queryArray([], { unique: true });

  const invalidString = 'foo,bar,bar';
  expect(() => uniqueQA.parse(invalidString)).toThrow();

  const validString = 'foo,bar';
  expect(() => uniqueQA.parse(validString)).not.toThrow();
});

it('Can constrain sub-values to passed values', () => {
  const testQueryArray = queryArray([], {
    withSubValues: true,
    allowedSubValues: ['true', undefined],
  });
  const invalidString = 'foo:true,bar:none,buzz';
  expect(() => testQueryArray.parse(invalidString)).toThrow();

  const validString = 'foo:true,bar:true,buzz';
  expect(() => testQueryArray.parse(validString)).not.toThrow();
});
