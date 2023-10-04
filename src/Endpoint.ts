import { z } from 'zod';
import { ErrorCode, FailureResponse, Response } from './Response';
import { GetSchemaErrors } from './util';

interface Request {
  query?: object;
  params?: object;
  body?: object;
}

export interface Endpoint {
  request: Request;
  response: Response;
}

export type EndpointSchema<T extends Endpoint = Endpoint> = {
  request: z.ZodType<T['request']>;
  response: z.ZodType<T['response']>;
};

/** Ubiquitous responses that can be expected from any endpoint. */
type GeneralEndpointResponses<T extends EndpointSchema['request']> =
  | FailureResponse<typeof ErrorCode.InternalServerError>
  | FailureResponse<typeof ErrorCode.BadRequest, GetSchemaErrors<T>[]>;

export type InferEndpoint<T extends EndpointSchema<Endpoint>> = {
  request: z.infer<T['request']>;
  response: z.infer<T['response']> | GeneralEndpointResponses<T['request']>;
};
