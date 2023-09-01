import { z } from 'zod';

export type Endpoint = {
  request: z.ZodTypeAny;
  response: z.ZodTypeAny;
};

export type InferEndpoint<T extends Endpoint> = {
  request: z.infer<T['request']>;
  response: z.infer<T['response']>;
};

export type EndpointRecord = Record<string, Endpoint>;

/**
 * Get the inferred types of a record of endpoint schemas.
 *
 * Makes it easier and more concise to group and export types
 * for a group of endpoint schema definitions.
 *
 * @example
 * const Get = {
 *   request: z.object({ params: z.object({ id: z.string() })}),
 *   response: z.boolean(),
 * }
 *
 * const endpoints = {
 *  Get,
 *  //Other endpoints
 * }
 *
 * type EndpointTypes = InferEndpointRecord<endpoints>;
 * // EndpointTypes['Get']['request'] = { params: { id: string }}
 */
export type InferEndpointRecord<T extends EndpointRecord> = {
  [endpoint in keyof T]: InferEndpoint<T[endpoint]>;
};
