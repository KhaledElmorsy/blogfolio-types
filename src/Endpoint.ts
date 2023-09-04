import { z } from 'zod';
import { Response } from './Response';

interface Request {
  query?: object;
  params?: object;
  body?: object;
}

export interface Endpoint {
  request: Request;
  response: Response;
}

export type EndpointSchema<T extends Endpoint> = {
  request: z.ZodType<T['request']>;
  response: z.ZodType<T['response']>;
};

export type InferEndpoint<T extends EndpointSchema<Endpoint>> = {
  request: z.infer<T['request']>;
  response: z.infer<T['response']>;
};
