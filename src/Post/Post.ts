import { z } from 'zod';
import { errorIDs, zResponseError } from '@/ResponseError';
import { zWithErrors } from '@/util';
import rules from './rules';
import { ControllerSchema, Controller } from '@/Controller';
import { id as userID, response as userResponses } from '@/User';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';

/* ===================================================== */
/*                    COMPONENTS                         */
/* ===================================================== */

export const uid = z.string();

export const title = zWithErrors(
  { blank: errorIDs.Post.BlankTitle, long: errorIDs.Post.LongTitle },
  ({ blank, long }) =>
    z.string().min(1, blank).max(rules.MAX_TITLE_LENGTH, long)
);

export const summary = zWithErrors(
  { long: errorIDs.Post.LongSummary },
  ({ long }) => z.string().max(rules.MAX_SUMMARY_LENGTH, long)
);

export const body = zWithErrors({ long: errorIDs.Post.LongBody }, ({ long }) =>
  z.string().max(rules.MAX_BODY_LENGTH, long)
);

export const slug = zWithErrors(
  {
    invalid: errorIDs.Post.InvalidSlug,
    long: errorIDs.Post.LongSlug,
  },
  ({ invalid, long }) =>
    z
      .string()
      .regex(/^[a-zA-Z\d](-?[a-zA-Z\d]+)+[a-zA-Z\d]$/, invalid)
      .max(rules.MAX_SLUG_LENGTH, long)
);

export const createdAt = z.date();
export const editedAt = z.date().nullable();
export const views = z.number().positive();

/* ===================================================== */
/*                 RESOURCES/HELPERS                     */
/* ===================================================== */

const postData = z.object({
  post: z.object({
    id: uid,
    userID,
    title,
    summary,
    body,
    slug,
    createdAt,
    editedAt,
    views,
  }),
});

const pagination = z.object({
  limit: z.number().positive().optional(),
  nextID: uid.optional(),
});

/* ===================================================== */
/*                  COMMON RESPONSES                     */
/* ===================================================== */

const response = {
  success: {
    postArray: zSuccessResponse(SuccessCode.Ok, z.array(postData)),
    ok: zSuccessResponse(SuccessCode.Ok),
  },
  failure: {
    slugUnavailable: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.Post.UnavailableSlug, z.object({ slug })),
    ]),
    idNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Post.NotFound, z.object({ id: uid })),
    ]),
  },
};

/* ===================================================== */
/*                     ENDPOINTS                         */
/* ===================================================== */

export const endpoints = {
  /**
   * Get the data of the post with the passed slug
   *
   * `GET ../:slug`
   */
  GetBySlug: {
    request: z.object({
      params: z.object({ slug }),
    }),
    response: z.union([
      zSuccessResponse(SuccessCode.Ok, postData),
      zFailureResponse(ErrorCode.NotFound, [
        zResponseError(errorIDs.Post.NotFound, z.object({ slug })),
      ]),
    ]),
  },

  /**
   * Get the data of the post with the passed ID (in the request query)
   *
   * `GET ../?id=xxx`
   */
  GetByID: {
    request: z.object({
      query: z.object({ id: uid }),
    }),
    response: z.union([
      zSuccessResponse(SuccessCode.Ok, postData),
      zFailureResponse(ErrorCode.NotFound, [
        zResponseError(errorIDs.Post.NotFound, z.object({ id: uid })),
      ]),
    ]),
  },

  /**
   * Search for posts by their title | body | author username
   *
   * `GET ../?search=xx`
   */
  GetSearch: {
    request: z.object({
      query: z
        .object({
          search: z.string().nonempty(),
        })
        .and(pagination),
    }),
    response: response.success.postArray,
  },

  /**
   * Get posts by their author's ID
   *
   * `GET ../?userID=xx`
   */
  GetByUser: {
    request: z.object({
      query: z
        .object({
          userID,
        })
        .and(pagination),
    }),
    response: z.union([
      userResponses.failure.userIdNotFound,
      response.success.postArray,
    ]),
  },

  /**
   * Create a new post
   *
   * `POST ../`
   */
  Post: {
    request: z.object({
      body: z.object({
        title,
        body,
        summary: summary.optional(),
        slug: slug.optional(),
      }),
    }),
    response: z.union([
      response.failure.slugUnavailable,
      zSuccessResponse(SuccessCode.Created, z.object({ id: uid })),
    ]),
  },

  /**
   * Update a post's data
   *
   * `PUT ../:id`
   */
  Put: {
    request: z.object({
      param: z.object({ id: uid }),
      body: z.object({
        title: title.optional(),
        body: body.optional(),
        summary: summary.optional(),
        slug: slug.optional(),
      }),
    }),
    response: z.union([
      response.failure.slugUnavailable,
      response.failure.idNotFound,
      response.success.ok,
    ]),
  },

  /**
   * Delete the post with the input ID
   *
   * `DELETE ../:id`
   */
  Delete: {
    request: z.object({
      params: z.object({ id: uid }),
    }),
    response: z.union([response.failure.idNotFound, response.success.ok]),
  },
} satisfies ControllerSchema<Controller>;
