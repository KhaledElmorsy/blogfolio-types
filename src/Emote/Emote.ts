import { z } from 'zod';
import { zWithErrors } from '@/util';
import { errorIDs, zResponseError } from '@/ResponseError';
import { id as postID, response as postResponses } from '@/Post';
import { id as userIDObject, response as userResponses } from '@/User';
import { id as commentID, response as commentResponses } from '@/Comment';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';
import { ControllerSchema, Controller } from '@/Controller';

/* ===================================================== */
/*                     COMPONENTS                        */
/* ===================================================== */

export const id = zWithErrors(
  { invalid: errorIDs.Emote.IDInvalid },
  ({ invalid }) => z.number().positive(invalid).int(invalid)
);

export const body = z.string();

/* ===================================================== */
/*                  RESOURCES/HELPERS                    */
/* ===================================================== */

const userID = userIDObject.shape.id;

const baseKey = z.object({ userID, emoteID: id });

const postEmoteCounts = z.record(
  postID,
  z.array(z.object({ emoteID: id, count: z.number() }))
);

const commentEmoteCounts = z.record(
  commentID,
  z.array(z.object({ emoteID: id, count: z.number() }))
);

/* ===================================================== */
/*                   COMMON RESPONSES                    */
/* ===================================================== */

const response = {
  success: {
    ok: zSuccessResponse(SuccessCode.Ok),
    created: zSuccessResponse(SuccessCode.Created),
    postEmote: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        postID,
        id,
      })
    ),
    commentEmote: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        commentID,
        id,
      })
    ),
    postListEmotes: zSuccessResponse(
      SuccessCode.Ok,
      z.array(baseKey.and(z.object({ postID })))
    ),
    commentListEmotes: zSuccessResponse(
      SuccessCode.Ok,
      z.array(baseKey.and(z.object({ commentID })))
    ),
    postEmoteCounts: zSuccessResponse(SuccessCode.Ok, postEmoteCounts),
    commentEmoteCounts: zSuccessResponse(SuccessCode.Ok, commentEmoteCounts),
  },
  failure: {
    IDNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Emote.NotFound, z.object({ id })),
    ]),
    NoEmotePost: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.Emote.NoEmotePost, z.object({ postID, userID })),
    ]),
    NoEmoteComment: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(
        errorIDs.Emote.NoEmoteComment,
        z.object({ commentID, userID })
      ),
    ]),
  },
};

/* ===================================================== */
/*                      ENDPOINTS                        */
/* ===================================================== */

export const endpoints = {
  /**
   * Get the current emote list as a `{id: number, body: string}` array.
   *
   * i.e. `[{id: 1, body: '👍'},{id: 2, body: '😊'}]`
   *
   * `GET ../`
   */
  Get: {
    request: z.object({}),
    response: zSuccessResponse(
      SuccessCode.Ok,
      z.array(
        z.object({
          id,
          body,
        })
      )
    ),
  },

  /**
   * Get user emotes for an array of post IDs.
   *
   * Optionally filter the emotes for a specific user.
   *
   * Using POST to send a JSON with a potentially large ID array.
   *
   * `POST ../post/get`
   */
  PostGetPostEmotes: {
    request: z.object({
      body: z.object({
        ids: z.array(postID),
        userID: userID.optional(),
      }),
    }),
    response: z.union([
      postResponses.failure.multipleIDsNotFound,
      userResponses.failure.userIdNotFound,
      response.success.postListEmotes,
    ]),
  },

  /**
   * Get user emotes for an array of comment IDs.
   *
   * Optionally filter the emotes for a specific user.
   *
   * Using POST to send a JSON with a potentially large ID array.
   *
   *`POST ../comment/get`
   */
  PostGetCommentEmotes: {
    request: z.object({
      body: z.object({
        ids: z.array(commentID),
        userID: userID.optional(),
      }),
    }),
    response: z.union([
      commentResponses.failure.multipleIDsNotFound,
      userResponses.failure.userIdNotFound,
      response.success.commentListEmotes,
    ]),
  },

  /**
   * Get the aggregate count of each emote on the passed post IDs
   *
   * `POST ../post/get/counts`
   */
  PostGetPostEmoteCounts: {
    request: z.object({
      body: z.object({
        postIDs: z.array(postID),
      }),
    }),
    response: z.union([
      response.success.postEmoteCounts,
      postResponses.failure.multipleIDsNotFound,
    ]),
  },

  /**
   * Get the aggregate count of each emote on the passed comment IDs
   *
   * `POST ../comment/get/counts`
   */
  PostGetCommentEmoteCounts: {
    request: z.object({
      body: z.object({
        commentIDs: z.array(commentID),
      }),
    }),
    response: z.union([
      response.success.commentEmoteCounts,
      commentResponses.failure.multipleIDsNotFound,
    ]),
  },

  /**
   * Add an emote on the post with the sent ID.
   * - Requires authorization
   *
   * `POST ../post/`
   */
  PostNewPostEmote: {
    request: z.object({
      body: z.object({
        emoteID: id,
        postID,
      }),
    }),
    response: z.union([
      postResponses.failure.idNotFound,
      response.failure.IDNotFound,
      response.success.created,
    ]),
  },

  /**
   * Add an emote on the comment with the sent ID.
   * - Requires authorization
   *
   * `POST ../comment/`
   */
  PostNewCommentEmote: {
    request: z.object({
      body: z.object({
        emoteID: id,
        commentID,
      }),
    }),
    response: z.union([
      commentResponses.failure.IdNotFound,
      response.failure.IDNotFound,
      response.success.created,
    ]),
  },

  /**
   * Update an emote on the post with the sent ID.
   * - Requires authorization
   *
   * `PUT ../post/`
   */
  PutPostEmote: {
    request: z.object({
      body: z.object({
        emoteID: id,
        postID,
      }),
    }),
    response: z.union([
      postResponses.failure.idNotFound,
      response.failure.IDNotFound,
      response.failure.NoEmotePost,
      response.success.ok,
    ]),
  },

  /**
   * Update an emote on the comment with the sent ID.
   * - Requires authorization
   *
   * `PUT ../comment/`
   */
  PutCommentEmote: {
    request: z.object({
      body: z.object({
        emoteID: id,
        commentID,
      }),
    }),
    response: z.union([
      commentResponses.failure.IdNotFound,
      response.failure.IDNotFound,
      response.failure.NoEmoteComment,
      response.success.ok,
    ]),
  },

  /**
   * Delete an emote on the post with the sent ID.
   * - Requires authorization
   *
   * `DELETE ../post/:postID`
   */
  DeletePostEmote: {
    request: z.object({
      params: z.object({ postID }),
    }),
    response: z.union([
      postResponses.failure.idNotFound,
      response.failure.NoEmotePost,
      response.success.ok,
    ]),
  },

  /**
   * Delete an emote on the comment with the sent ID.
   * - Requires authorization
   *
   * `DELETE ../comment/:commentID`
   */
  DeleteCommentEmote: {
    request: z.object({
      params: z.object({ commentID }),
    }),
    response: z.union([
      commentResponses.failure.IdNotFound,
      response.failure.NoEmoteComment,
      response.success.ok,
    ]),
  },
} satisfies ControllerSchema<Controller>;
