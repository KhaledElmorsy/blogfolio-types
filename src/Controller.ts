import type { Endpoint, InferEndpoint, EndpointSchema } from './Endpoint';

export type Controller = Record<string, Endpoint>;

export type ControllerSchema<T extends Controller> = {
  [e in keyof T]: EndpointSchema<T[e]>;
};

export type InferController<T extends ControllerSchema<Controller>> = {
  [e in keyof T]: InferEndpoint<T[e]>;
};
