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
   * Get a user's emote for a specific post.
   *
   * `GET ../post/:postID/user/:userID
   */
  GetUserPostEmote: {
    request: z.object({
      params: z.object({
        postID,
        userID,
      }),
    }),
    response: z.union([
      postResponses.failure.idNotFound,
      userResponses.failure.userIdNotFound,
      response.success.postEmote,
    ]),
  },

  /**
   * Get a user's emote for a specific comment.
   *
   * `GET ../comment/:commentID/user/:userID
   */
  GetUserCommentEmote: {
    request: z.object({
      params: z.object({
        commentID,
        userID,
      }),
    }),
    response: z.union([
      commentResponses.failure.IdNotFound,
      userResponses.failure.userIdNotFound,
      response.success.postEmote,
    ]),
  },

  /**
   * Get user emotes for an array of post IDs.
   *
   * Using POST to send a JSON with a potentially large ID array.
   *
   * `POST ../post/get`
   */
  PostGetPostEmotes: {
    request: z.object({
      body: z.object({
        ids: z.array(postID),
      }),
    }),
    response: z.union([
      postResponses.failure.multipleIDsNotFound,
      response.success.postListEmotes,
    ]),
  },

  /**
   * Get user emotes for an array of comment IDs.
   *
   * Using POST to send a JSON with a potentially large ID array.
   *
   *`POST ../comment/get`
   */
  PostGetCommentEmotes: {
    request: z.object({
      body: z.object({
        ids: z.array(commentID),
      }),
    }),
    response: z.union([
      commentResponses.failure.multipleIDsNotFound,
      response.success.commentListEmotes,
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
