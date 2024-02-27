import { z } from 'zod';
import { queryArray } from '../util/schema';
import type { InferZodRecord } from '../util/types';
import { zResponseError, errorIDs } from '@/ResponseError';
import {
  ErrorCode,
  SuccessCode,
  zFailureResponse,
  zSuccessResponse,
} from '@/Response';
import type {
  Controller,
  ControllerSchema,
  InferController,
} from '@/Controller';
import { zWithErrors } from '@/util';

/* ===================================================== */
/*                    COMPONENTS                         */
/* ===================================================== */

export const __id = z.object({
  /**
   * Internal primary key used in the database.
   * Shouldn't be returned by endpoints.
   */
  __id: z.string(),
});

export const id = z.object({
  /** Public UID */
  id: z.string(),
});

export const email = zWithErrors(
  { type: errorIDs.User.WrongTypeEmail, invalid: errorIDs.User.InvalidEmail },
  ({ type, invalid }) =>
    z
      .string({
        invalid_type_error: type,
      })
      .email(invalid)
);

/**
 * Usernames rules:
 * - Alphanumeric\period only.
 * - No multiple adjacent periods.
 * - Doesn't start or end with a period.
 */
export const username = zWithErrors(
  {
    type: errorIDs.User.WrongTypeUsername,
    short: errorIDs.User.ShortUsername,
    long: errorIDs.User.LongUsername,
    invalid: errorIDs.User.InvalidUsername,
  },
  ({ type, short, long, invalid }) =>
    z
      .string({
        invalid_type_error: type,
      })
      .min(6, short)
      .max(30, long)
      .regex(/^(?!\.)([a-zA-Z0-9]|(?<!\.)\.)+(?<!\.)$/, invalid)
);

/**
 * Passwords should:
 *  - Be 8 characters or more
 *  - Be at most 50 characters
 *  - Contain (>= 3/4) of:
 *    - Lowercase letters
 *    - Uppercase letters
 *    - Numbers
 *    - Special Chars from ' ' - '/' (Ascii 32-47)
 */
export const password = zWithErrors(
  {
    type: errorIDs.User.WrongTypePassword,
    short: errorIDs.User.ShortPassword,
    long: errorIDs.User.LongPassword,
    invalid: errorIDs.User.InvalidPassword,
    weak: errorIDs.User.WeakPassword,
  },
  ({ type, short, long, invalid, weak }) =>
    z
      .string({
        invalid_type_error: type,
      })
      .min(8, short)
      .max(50, long)
      .regex(/[a-zA-Z0-9 -/]/, invalid)
      .refine(
        (pass) =>
          Number(/[a-z]/.test(pass))
            + Number(/[A-Z]/.test(pass))
            + Number(/\d/.test(pass))
            + Number(/[ -/]+/.test(pass))
          >= 3,
        weak
      )
);

export const Misc = z.object({
  bio: zWithErrors(
    {
      type: errorIDs.User.WrongTypeBio,
      blank: errorIDs.User.BlankBio,
      long: errorIDs.User.LongBio,
    },
    ({ type, blank, long }) =>
      z
        .string({ invalid_type_error: type })
        .min(1, blank)
        .max(300, long)
        .nullable()
  ),

  firstName: zWithErrors(
    {
      type: errorIDs.User.WrongTypeFirstName,
      blank: errorIDs.User.BlankFirstName,
      long: errorIDs.User.LongFirstName,
    },
    ({ type, blank, long }) =>
      z
        .string({ invalid_type_error: type })
        .min(1, blank)
        .max(30, long)
        .nullable()
  ),
  lastName: zWithErrors(
    {
      type: errorIDs.User.WrongTypeLastName,
      blank: errorIDs.User.BlankLastName,
      long: errorIDs.User.LongLastName,
    },
    ({ type, blank, long }) =>
      z
        .string({ invalid_type_error: type })
        .min(1, blank)
        .max(30, long)
        .nullable()
  ),
  photoSmall: z.string().nullable(),
  photoFull: z.string().nullable(),
});

export const FollowCounts = z.object({
  followerCount: z.number().int(),
  followingCount: z.number().int(),
});

export const components = {
  __Id: __id,
  Id: id,
  Username: username,
  Email: email,
  Password: password,
  Misc,
  FollowCounts,
};

export type Components = InferZodRecord<typeof components>;

/* ===================================================== */
/*                     RESOURCES                         */
/* ===================================================== */

const User = id.merge(z.object({ username, email })).merge(Misc.partial());
const QueriedUser = User.omit({ email: true }).merge(FollowCounts.partial());
const NewUser = User.merge(z.object({ password }));
const NewUserRequest = NewUser.omit({ id: true });
const __QueriedUser = QueriedUser.merge(__id);

export const resources = {
  NewUser,
  NewUserRequest,
  QueriedUser,
  User,
  __QueriedUser,
};

export type Resources = InferZodRecord<typeof resources>;

/* ===================================================== */
/*                  COMMON RESPONSES                     */
/* ===================================================== */

export const response = {
  success: {
    ok: zSuccessResponse(SuccessCode.Ok),
    foundUser: zSuccessResponse(
      SuccessCode.Ok,
      z.object({ user: QueriedUser })
    ),
    foundUsers: zSuccessResponse(
      SuccessCode.Ok,
      z.object({ users: z.array(QueriedUser) })
    ),
    boolean: zSuccessResponse(
      SuccessCode.Ok,
      z.object({ result: z.boolean() })
    ),
    userDataUpdated: zSuccessResponse(SuccessCode.Ok, id),
    userCreated: zSuccessResponse(SuccessCode.Created, id),
    followerAdded: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        target: id,
        follower: id,
      })
    ),
    userActivated: zSuccessResponse(SuccessCode.Ok, id),
    userDeleted: zSuccessResponse(SuccessCode.Ok, id),
    followerRemoved: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        target: id,
        follower: id,
      })
    ),
  },

  failure: {
    userIdNotFound: zFailureResponse(
      ErrorCode.NotFound,
      [zResponseError(errorIDs.User.UserNotFound, id)],
      { errorRequired: true }
    ),

    userAlreadyFollows: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(
        errorIDs.User.AlreadyFollowing,
        z.object({
          target: id,
          follower: id,
        })
      ),
    ]),

    userArealdyActivated: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.User.AlreadyActivated, id),
    ]),
    userFieldConflict: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.User.EmailExists, z.object({ email })),
      zResponseError(errorIDs.User.UsernameExists, z.object({ username })),
    ]),
    userNotFollowing: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(
        errorIDs.User.NotFollowing,
        z.object({
          target: id,
          follower: id,
        })
      ),
    ]),
    newPasswordNotDifferent: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.User.SamePassword),
    ]),
    usernameNotFound: zFailureResponse(ErrorCode.NotFound, [
      zResponseError(errorIDs.User.UserNotFound, z.object({ username })),
    ]),
  },
};

const responseGroup = {
  userList: z.union([
    response.success.foundUsers,
    response.failure.userIdNotFound,
  ]),
  updateUserData: z.union([
    response.success.userDataUpdated,
    response.failure.userIdNotFound,
    response.failure.userFieldConflict,
  ]),
};

/* ===================================================== */
/*                     ENDPOINTS                         */
/* ===================================================== */

const userFields = z.object({
  /** Array of fields to include with each result. */
  fields: queryArray([
    'followerCount',
    'followingCount',
    'bio',
    'firstName',
    'lastName',
    'photoSmall',
    'photoFull',
  ]),
});

const sortFields = z.object({
  /** Array of sortable fields including the sort direction. */
  sort: queryArray(
    ['followerCount', 'followingCount', 'username', 'firstName', 'lastName'],
    { unique: true, withSubValues: true, allowedSubValues: ['asc', 'desc'] }
  ),
});

const pagination = z.object({
  /** Public ID of the next user in the query. */
  next: id.shape.id,
  /** Number of results to return. */
  limit: z.coerce.number().min(0),
});

/** Request URI query parameters for customizing user list responses. */
const userListQuery = pagination.merge(sortFields).merge(userFields).partial();

export const endpointHelpers = {
  userFields,
  userListQuery,
  pagination,
  sortFields,
};

export type EndpointHelpers = InferZodRecord<typeof endpointHelpers>;

export const endPoints = {
  /**
   * Get the users data.
   *
   * `/:id`
   */
  Get: {
    request: z.object({
      params: id.strict(),
      query: userFields.partial().strict(),
    }),
    response: z.union([
      response.success.foundUser,
      response.failure.userIdNotFound,
    ]),
  },

  /**
   * Get an array of the user's followers
   *
   * `GET ../:id/followers`
   */
  GetFollowers: {
    request: z.object({
      params: id,
      query: userListQuery,
    }),
    response: responseGroup.userList,
  },

  /**
   * Get an array of who the user follows
   *
   * `GET ../:id/follows`
   */
  GetFollows: {
    request: z.object({
      params: id,
      query: userListQuery,
    }),
    response: responseGroup.userList,
  },

  /**
   * Check if a user follows a specific user.
   *
   * `GET ../:followerId/follows/:id`
   */
  GetCheckFollow: {
    request: z.object({
      params: z.object({
        id: id.shape.id,
        followerId: id.shape.id,
      }),
    }),
    response: z.union([
      response.success.boolean,
      response.failure.userIdNotFound,
    ]),
  },
  // TODO Update doc. for the following two endpoints
  /**
   * Check if a user with the passed email/username exists
   *
   * `GET ../exists/:field/:value`
   *
   * Field: `"email"|"username"`
   */
  GetExistsEmail: {
    request: z.object({
      params: z.object({ email }),
    }),
    response: response.success.boolean,
  },

  GetExistsUsername: {
    request: z.object({
      params: z.object({ username }),
    }),
    response: response.success.boolean,
  },

  /**
   * Search for users either by matching against their usernames.
   *
   * `../s/username/:username`
   */
  GetSearchUsername: {
    request: z.object({
      params: z.object({
        username: z.string().min(1),
      }),
      query: userListQuery,
    }),
    response: responseGroup.userList,
  },

  /**
   * Search for users based on their username, first name, or last name.
   */
  GetSearchAny: {
    request: z.object({
      params: z.object({
        text: z.string().min(1),
      }),
      query: userListQuery,
    }),
    response: responseGroup.userList,
  },

  /**
   * Basic username parent route
   * `GET../users/:username/(posts|comments|etc)`
   */
  GetUsername: {
    request: z.object({
      params: z.object({ username }),
    }),
    response: z.union([response.failure.usernameNotFound, response.success.ok]),
  },

  /**
   * Edit a user's data
   *
   * `PUT ../`
   */
  Put: {
    request: z.object({
      body: Misc.partial(),
    }),
    response: responseGroup.updateUserData,
  },

  /**
   * Change a users's password
   *
   * `PUT ../password`
   */
  PutPassword: {
    request: z.object({
      body: z.object({ password }),
    }),
    response: z.union([
      response.success.userDataUpdated,
      response.failure.newPasswordNotDifferent,
      response.failure.userIdNotFound,
    ]),
  },

  /**
   * Change a users's email
   *
   * `PUT ../email`
   */
  PutEmail: {
    request: z.object({
      body: z.object({ email }),
    }),
    response: responseGroup.updateUserData,
  },

  /**
   * Change a users's username
   *
   * `PUT ../username`
   */
  PutUsername: {
    request: z.object({
      body: z.object({ username }),
    }),
    response: responseGroup.updateUserData,
  },

  /**
   * Make the user follow a target user.
   *
   * `PUT ../followers/:targetId`
   */
  PutFollower: {
    request: z.object({
      params: z.object({
        targetId: id.shape.id,
      }),
    }),
    response: z.union([
      response.success.followerAdded,
      response.failure.userIdNotFound,
      response.failure.userAlreadyFollows,
    ]),
  },

  PutActivate: {
    request: z.object({
      params: z.object({
        id: id.shape.id,
      }),
    }),
    response: z.union([
      response.success.userActivated,
      response.failure.userArealdyActivated,
      response.failure.userIdNotFound,
    ]),
  },

  /**
   * Create a new user
   *
   * `POST ../`
   */
  Post: {
    request: z.object({
      body: NewUserRequest,
    }),
    response: z.union([
      response.success.userCreated,
      response.failure.userFieldConflict,
    ]),
  },

  /**
   * Delete a user
   *
   * `DELETE ../`
   */
  Delete: {
    request: z.object({}),
    response: z.union([
      response.success.userDeleted,
      response.failure.userIdNotFound,
    ]),
  },

  /**
   * Remove a target user from the users's follow list.
   *
   * `DELETE ../follows/:targetId
   */
  DeleteFollow: {
    request: z.object({
      params: z.object({
        targetId: id.shape.id,
      }),
    }),
    response: z.union([
      response.success.followerRemoved,
      response.failure.userNotFollowing,
      response.failure.userIdNotFound,
    ]),
  },
} satisfies ControllerSchema<Controller>;

export type Endpoints = InferController<typeof endPoints>;
