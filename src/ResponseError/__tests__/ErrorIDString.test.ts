import { describe, it, expect } from 'vitest';
import { ErrorID } from '../ErrorID';
import { ErrorIDString, parseErrorID, stringifyErrorID } from '../ErrorIDString';
import { BaseErrorID } from '../misc';

const testID = {
  code: 999,
  message: 'Testing 1, 2, 3! | (message seen)',
} satisfies BaseErrorID as ErrorID;

const testIDString = `${testID.code}|${testID.message}` as ErrorIDString<
  typeof testID
>;

describe('stringifyID():', () => {
  it('Converts error IDs to a string with the correct format', () => {
    expect(stringifyErrorID(testID)).toBe(testIDString);
  });
});

describe('parseErrorID():', () => {
  it('Parses error ID strings into error IDs', () => {
    expect(parseErrorID(testIDString)).toEqual(testID);
  });

  it.each([
    ['No code', '|test'],
    ['Invalid code', 'a1|test'],
    ['No message', '123|'],
    ['No pipe', '123test'],
  ])('Throws if passed an invalid string: %s', (_, invalidID) => {
    expect(() => parseErrorID(invalidID as ErrorIDString)).toThrow();
  });
});
