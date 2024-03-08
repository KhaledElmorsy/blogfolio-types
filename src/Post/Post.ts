import { z } from 'zod';
import { errorIDs, zResponseError } from '@/ResponseError';
import { zWithErrors } from '@/util';
import rules from './rules';
import { ControllerSchema, Controller } from '@/Controller';
import { id as userID, username, response as userResponses } from '@/User';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';

/* ===================================================== */
/*                    COMPONENTS                         */
/* ===================================================== */

export const id = z.string();

export const title = zWithErrors(
  { blank: errorIDs.Post.BlankTitle, long: errorIDs.Post.LongTitle },
  ({ blank, long }) =>
    z.string().min(1, blank).max(rules.MAX_TITLE_LENGTH, long)
);

export const summary = zWithErrors(
  { long: errorIDs.Post.LongSummary },
  ({ long }) => z.string().max(rules.MAX_SUMMARY_LENGTH, long).nullable()
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
export const views = z.number().min(0);
export const visible = z.boolean();

/* ===================================================== */
/*                 RESOURCES/HELPERS                     */
/* ===================================================== */

export const postSchema = z.object({
  id,
  title,
  summary,
  body,
  slug,
  createdAt,
  editedAt,
  views,
  visible,
  userID: userID.shape.id,
});

const pagination = z.object({
  limit: z.number().positive().optional(),
  nextID: id.optional(),
});

const search = z.string().nonempty();

const sortByDateViews = z.enum(['date', 'views']);

/* ===================================================== */
/*                  COMMON RESPONSES                     */
/* ===================================================== */

export const response = {
  success: {
    post: zSuccessResponse(SuccessCode.Ok, z.object({ post: postSchema })),
    postArray: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        posts: z.array(postSchema.omit({ visible: true, body: true })),
      })
    ),
    ok: zSuccessResponse(SuccessCode.Ok),
  },
  failure: {
    slugUnavailable: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.Post.UnavailableSlug, z.object({ slug })),
    ]),
    idNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Post.NotFound, z.object({ id })),
    ]),
    multipleIDsNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Post.NotFound, z.object({ ids: z.array(id) })),
    ]),
    slugNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Post.NotFound, z.object({ slug })),
    ]),
  },
};

/* ===================================================== */
/*                     ENDPOINTS                         */
/* ===================================================== */

export const endpoints = {
  /**
   * Get the data of the post with the passed id
   *
   * `GET ../:id`
   */
  Get: {
    request: z.object({
      params: z.object({ id }),
    }),
    response: z.union([
      response.success.post,
      zFailureResponse(ErrorCode.NotFound, [
        zResponseError(errorIDs.Post.NotFound, z.object({ id })),
      ]),
    ]),
  },

  /**
   * Find the post by its slug (at a specific username).
   *
   * `GET ../:username/post/:slug`
   */
  GetBySlug: {
    request: z.object({
      params: z.object({ username, slug }),
    }),
    response: z.union([
      response.success.post,
      response.failure.slugNotFound,
      userResponses.failure.usernameNotFound,
    ]),
  },

  /**
   * Search for posts by their title | body | summary.
   * * Pagination
   * * Sort by date/views
   *
   * `GET ../?search=__&nextID=__&limit=__&sort=__`
   */
  GetSearch: {
    request: z.object({
      query: z
        .object({ search, sort: sortByDateViews.optional() })
        .and(pagination),
    }),
    response: response.success.postArray,
  },

  /**
   * Get posts by their author's username.
   * * Searchable
   * * Pagination
   * * Sort by date/views
   *
   * `GET ../:username/post/?nextID=__&limit=__&sort=__`
   */
  GetByUsername: {
    request: z.object({
      params: z.object({
        username,
      }),
      query: pagination.and(
        z.object({
          search: search.optional(),
          sort: sortByDateViews.optional(),
        })
      ),
    }),
    response: z.union([
      userResponses.failure.usernameNotFound,
      response.success.postArray,
    ]),
  },

  /**
   * Get all posts by a logged in user. Similar to a dashboard.
   * * Requires authorization
   * * Can get hidden posts/drafts (defaults to visible posts)
   * * Searchable
   * * Supports pagination
   *
   * `GET ../me/?nextID=__&limit=__&search=__&drafts=__&sort=__` ⬅️ While logged in
   */
  GetByUserID: {
    request: z.object({
      query: z
        .object({
          search: search.optional(),
          drafts: z.boolean().optional(),
          sort: sortByDateViews.optional(),
        })
        .and(pagination),
    }),
    response: z.union([
      zFailureResponse(ErrorCode.Unauthorized),
      response.success.postArray,
    ]),
  },

  /**
   * Basic posts parent route middleware.
   *
   * Confirms whether the username/slug combination exists and goes to child
   * endpoints if they do or responds with a 404 if they don't.
   *
   * `users/:username/posts/:slug/(children)`
   */
  CheckSlug: {
    request: z.object({
      params: z.object({
        username,
        slug,
      }),
    }),
    response: response.failure.slugNotFound,
  },

  /**
   * Create a new post.
   * * Requires authorization.
   *
   * `POST ../`
   */
  Post: {
    request: z.object({
      body: z.object({
        title,
        body,
        summary: summary.optional(),
        slug,
        visible: visible.optional(),
      }),
    }),
    response: z.union([
      zFailureResponse(ErrorCode.Unauthorized),
      response.failure.slugUnavailable,
      zSuccessResponse(SuccessCode.Created, z.object({ id })),
    ]),
  },

  /**
   * Update a post's data
   * * Requires authorization
   * `PUT ../:id`
   */
  Put: {
    request: z.object({
      params: z.object({ id }),
      body: z.object({
        title: title.optional(),
        body: body.optional(),
        summary: summary.optional(),
        slug: slug.optional(),
        visible: visible.optional(),
      }),
    }),
    response: z.union([
      zFailureResponse(ErrorCode.Unauthorized),
      response.failure.slugUnavailable,
      response.failure.idNotFound,
      response.success.ok,
    ]),
  },

  /**
   * Increment a post's views.
   *
   * Better to do it through the client than by each GET call especially
   * since GET should have no side effects.
   *
   * `PUT ../:id/view`
   */
  PutView: {
    request: z.object({
      params: z.object({ id }),
    }),
    response: z.union([response.success.ok, response.failure.idNotFound]),
  },

  /**
   * Delete the post with the input ID
   * * Requires authorization
   * `DELETE ../:id`
   */
  Delete: {
    request: z.object({
      params: z.object({ id }),
    }),
    response: z.union([
      zFailureResponse(ErrorCode.Unauthorized),
      response.failure.idNotFound,
      response.success.ok,
    ]),
  },
} satisfies ControllerSchema<Controller>;
