import { z } from 'zod';
import { components as user } from '@/User';
import { ControllerSchema, Controller } from '@/Controller';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';
import { zResponseError, errorIDs } from '@/ResponseError';

const endpoints = {
  PostLogin: {
    request: z.object({
      body: z.object({
        username: user.Username,
        password: user.Password,
      }),
    }),
    response: z.union([
      zFailureResponse(ErrorCode.NotFound, [
        zResponseError(errorIDs.User.UserNotFound),
      ]),
      zFailureResponse(ErrorCode.Forbidden, [
        zResponseError(errorIDs.Login.IncorrectPassword),
      ]),
      zSuccessResponse(SuccessCode.Ok),
    ]),
  },
  PostLogout: {
    request: z.object({}),
    response: zSuccessResponse(SuccessCode.Ok),
  },
} satisfies ControllerSchema<Controller>;

export default endpoints;
