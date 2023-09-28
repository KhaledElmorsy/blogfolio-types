import { ErrorID } from './ErrorID';

export type ErrorIDString<T extends ErrorID = ErrorID> = T extends any
  ? `${T['code']}|${T['message']}`
  : never;

export function stringifyErrorID<T extends ErrorID>(errorID: T) {
  return `${errorID.code}|${errorID.message}` as ErrorIDString<T>;
}

type GetCode<T extends ErrorIDString> = T extends `${infer C}|${string}`
  ? C
  : never;

type ParseErrorIDString<
  T extends ErrorIDString,
  G extends ErrorID = ErrorID
> = G extends any ? (`${G['code']}` extends GetCode<T> ? G : never) : never;

export function parseErrorID<T extends ErrorIDString>(
  errorIDString: T
): ParseErrorIDString<T>;
export function parseErrorID(errorIDString: string): ErrorID;
export function parseErrorID<T extends ErrorIDString>(errorIDString: T) {
  const format = /^\d+\|.+$/;

  if (!format.test(errorIDString)) {
    throw new Error(`Cannot parse invalid error ID string: ${errorIDString}`);
  }

  const [code, message] = errorIDString.split(/(?<=^\d+)\|/);
  return {
    code: Number(code),
    message,
  };
}
