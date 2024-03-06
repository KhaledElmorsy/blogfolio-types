import { z } from 'zod';
import { zWithErrors } from '@/util';
import { errorIDs, zResponseError } from '@/ResponseError';
import rules from './rules';
import { id as userIDObj, response as userResponse } from '@/User';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';
import { ControllerSchema, Controller } from '@/Controller';

const userIDSchema = userIDObj.shape.id;

/* ===================================================== */
/*                     COMPONENTS                        */
/* ===================================================== */

export const idSchema = z.string();

export const nameSchema = zWithErrors(
  { blank: errorIDs.Project.nameBlank, long: errorIDs.Project.nameTooLong },
  ({ blank, long }) =>
    z.string().min(0, blank).max(rules.MAX_PROJECT_NAME, long)
);

export const descriptionSchema = zWithErrors(
  { blank: errorIDs.Project.descriptionBlank },
  ({ blank }) => z.string().min(0, blank)
);

export const skillsSchema = zWithErrors(
  { blank: errorIDs.Project.skillBlank },
  ({ blank }) => z.array(z.string().min(0, blank))
);

export const prioritySchema = zWithErrors(
  { invalid: errorIDs.Project.priorityInvalid },
  ({ invalid }) => z.number().nonnegative(invalid).int(invalid)
);
/* ===================================================== */
/*                  RESOURCES/HELPERS                    */
/* ===================================================== */

export const projectSchema = z.object({
  name: nameSchema,
  projectID: idSchema,
  description: descriptionSchema,
  skills: skillsSchema,
  userID: userIDSchema,
  priority: prioritySchema,
});

export type Project = z.infer<typeof projectSchema>;

/* ===================================================== */
/*                   COMMON RESPONSES                    */
/* ===================================================== */

const response = {
  success: {
    ok: zSuccessResponse(SuccessCode.Ok),
    project: zSuccessResponse(SuccessCode.Ok, projectSchema),
    projectList: zSuccessResponse(SuccessCode.Ok, z.array(projectSchema)),
    projectCreated: zSuccessResponse(
      SuccessCode.Created,
      z.object({ projectID: idSchema })
    ),
  },
  failure: {
    notFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(
        errorIDs.Project.notFound,
        z.object({ projectID: idSchema })
      ),
    ]),
    unauthorized: zFailureResponse(ErrorCode.Unauthorized),
  },
};

/* ===================================================== */
/*                      ENDPOINTS                        */
/* ===================================================== */

export const endpoints = {
  /**
   * Get a particular project
   *
   * `GET ../projects/:projectID`
   */
  GetProject: {
    request: z.object({
      params: z.object({ projectID: idSchema }),
    }),
    response: z.union([response.success.project, response.failure.notFound]),
  },

  /**
   * Get all projects for a specific user
   *
   * `GET ../projects/?userID=__`
   */
  GetUserProjects: {
    request: z.object({
      query: z.object({
        userID: userIDSchema,
      }),
    }),
    response: z.union([
      userResponse.failure.userIdNotFound,
      response.success.projectList,
    ]),
  },

  /**
   * Create a new project
   * - Requires authorization
   *
   * `POST ../projects/`
   */
  Post: {
    request: z.object({
      body: z.object({
        description: descriptionSchema,
        name: nameSchema,
        skills: skillsSchema,
        priority: prioritySchema,
      }),
    }),
    response: z.union([
      response.success.projectCreated,
      response.failure.unauthorized,
    ]),
  },

  /**
   * Update a project's properties
   * - Requires authorization
   *
   * `PUT ../projects/`
   */
  Put: {
    request: z.object({
      body: z.object({
        projectID: idSchema,
        description: descriptionSchema.optional(),
        name: nameSchema.optional(),
        skills: skillsSchema.optional(),
        priority: prioritySchema.optional(),
      }),
    }),
    response: z.union([
      response.success.ok,
      response.failure.notFound,
      response.failure.unauthorized,
    ]),
  },

  /**
   * Delete a particular project
   * - Requires authorization
   *
   * `DELETE ../projects/:projectID`
   */
  Delete: {
    request: z.object({
      params: z.object({ projectID: idSchema }),
    }),
    response: z.union([
      response.success.ok,
      response.failure.notFound,
      response.failure.unauthorized,
    ]),
  },
} satisfies ControllerSchema<Controller>;
