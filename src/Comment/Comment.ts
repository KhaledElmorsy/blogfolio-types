import { z } from 'zod';
import { errorIDs, zResponseError } from '@/ResponseError';
import { zWithErrors } from '@/util';
import { ControllerSchema, Controller } from '@/Controller';
import { response as userResponse, id as userID, username } from '@/User';
import { response as postResponse, id as postID, slug } from '@/Post';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';

/* ===================================================== */
/*                    COMPONENTS                         */
/* ===================================================== */

export const id = zWithErrors(
  { empty: errorIDs.Comment.IDBlank },
  ({ empty }) => z.string().nonempty(empty)
);

export const body = zWithErrors(
  { empty: errorIDs.Comment.BodyBlank },
  ({ empty }) => z.string().nonempty(empty)
);

const createdAt = z.date();
const editedAt = z.date().nullable();
const emotes = z.number();

/* ===================================================== */
/*                 RESOURCES/HELPERS                     */
/* ===================================================== */

export const comment = z.object({
  id,
  parentID: id.nullable(),
  userID: userID.shape.id.nullable(),
  postID,
  body,
  createdAt,
  editedAt,
  emotes,
});

const pagination = z.object({
  limit: z.number().positive().optional(),
  nextID: id.optional(),
});

const popular = z.boolean();

/* ===================================================== */
/*                  COMMON RESPONSES                     */
/* ===================================================== */

export const response = {
  success: {
    ok: zSuccessResponse(SuccessCode.Ok),
    comment: zSuccessResponse(SuccessCode.Ok, z.object({ comment })),
    comments: zSuccessResponse(
      SuccessCode.Ok,
      z.object({ comments: z.array(comment) })
    ),
  },

  failure: {
    IdNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Comment.NotFound, z.object({ id })),
    ]),
    blankBody: zFailureResponse(ErrorCode.BadRequest, [
      zResponseError(errorIDs.Comment.BodyBlank),
    ]),
    blankID: zFailureResponse(ErrorCode.BadRequest, [
      zResponseError(errorIDs.Comment.IDBlank),
    ]),
    unauthorized: zFailureResponse(ErrorCode.Unauthorized),
  },
};

/* ===================================================== */
/*                     ENDPOINTS                         */
/* ===================================================== */

export const endpoints = {
  /**
   * Get comment by ID
   *
   * `GET ../:id`
   */
  Get: {
    request: z.object({
      params: z.object({ id }),
    }),
    response: z.union([response.failure.IdNotFound, response.success.comment]),
  },

  /**
   * Get comments for a particular post and/or user.
   * - Supports pagination
   * - Supports popularity sorting
   * `GET ../?postID=__&userID=__&popular=__&nextID=__&limit=__`
   */
  GetByRelation: {
    request: z.object({
      query: z
        .object({
          userID: userID.shape.id,
          postID,
          popular,
        })
        .partial()
        .and(pagination),
    }),
    response: z.union([
      response.success.comments,
      userResponse.failure.userIdNotFound,
      postResponse.failure.idNotFound,
    ]),
  },

  /**
   * Get comments for a post by its nested route
   * - Supports pagination
   * - Supports popularity sorting
   *
   * `GET user/:username/post/:slug/comments?limit=__&popular=__&nextID=__`
   */
  GetBySlug: {
    request: z.object({
      params: z.object({
        username,
        slug,
      }),
      query: z
        .object({
          popular,
        })
        .partial()
        .and(pagination),
    }),
    response: z.union([
      response.success.comments,
      userResponse.failure.usernameNotFound,
      postResponse.failure.slugNotFound,
    ]),
  },

  /**
   * Create a comment with the user ID  (from auth), post ID,
   * and parent comment (if available)
   *
   * `POST ../`
   */
  Post: {
    request: z.object({
      body: z.object({
        postID, // User ID should come from authorization
        body,
        parentID: id.optional(),
      }),
    }),
    response: z.union([
      zSuccessResponse(SuccessCode.Created, z.object({ id })),
      postResponse.failure.idNotFound,
      response.failure.unauthorized,
    ]),
  },

  /**
   * Edit a comment's body.
   * - Requires authorization
   *
   * `PUT ../:id`
   */
  Put: {
    request: z.object({
      params: z.object({ id }),
      body: z.object({ body }),
    }),
    response: z.union([
      response.success.ok,
      response.failure.unauthorized,
      response.failure.IdNotFound,
    ]),
  },

  /**
   * Delete a comment by its ID
   * - Requires authorization
   *
   * `DELETE ../:id`
   */
  Delete: {
    request: z.object({
      params: z.object({ id }),
    }),
    response: z.union([
      response.failure.unauthorized,
      response.failure.IdNotFound,
      response.success.ok,
    ]),
  },
} satisfies ControllerSchema<Controller>;
