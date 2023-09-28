import type { ErrorID } from './ErrorID';

export type ResponseError<
  T extends ErrorID,
  D extends object | undefined = undefined
> = T & (D extends object ? { data: D } : {});
