import { z } from 'zod';
import { queryArray } from '../util/schema';
import type { InferZodRecord } from '../util/types';
import { zResponseError, errorIDs, stringifyErrorID } from '@/ResponseError';
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

/* ===================================================== */
/*                    COMPONENTS                         */
/* ===================================================== */

const __Id = z.object({
  /**
   * Internal primary key used in the database.
   * Shouldn't be returned by endpoints.
   */
  __id: z.string(),
});

const Id = z.object({
  /** Public UID */
  id: z.string(),
});

const Email = z.object({
  email: z
    .string({
      invalid_type_error: stringifyErrorID(errorIDs.User.WrongTypeEmail),
    })
    .email(stringifyErrorID(errorIDs.User.InvalidEmail)),
});

const Username = z.object({
  /**
   * Usernames rules:
   * - Alphanumeric\period only.
   * - No multiple adjacent periods.
   * - Doesn't start or end with a period.
   */
  username: z
    .string({
      invalid_type_error: stringifyErrorID(errorIDs.User.WrongTypeUsername),
    })
    .min(6, stringifyErrorID(errorIDs.User.ShortUsername))
    .max(30, stringifyErrorID(errorIDs.User.LongUsername))
    .regex(
      /^(?!\.)([a-zA-Z0-9]|(?<!\.)\.)+(?<!\.)$/,
      stringifyErrorID(errorIDs.User.InvalidUsername)
    ),
});

const Password = z.object({
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
  password: z
    .string({
      invalid_type_error: stringifyErrorID(errorIDs.User.WrongTypePassword),
    })
    .min(8, stringifyErrorID(errorIDs.User.ShortPassword))
    .max(50, stringifyErrorID(errorIDs.User.LongPassword))
    .regex(/[a-zA-Z0-9 -/]/, stringifyErrorID(errorIDs.User.InvalidPassword))
    .refine(
      (pass) =>
        Number(/[a-z]/.test(pass))
          + Number(/[A-Z]/.test(pass))
          + Number(/\d/.test(pass))
          + Number(/[ -/]+/.test(pass))
        >= 3,
      stringifyErrorID(errorIDs.User.WeakPassword)
    ),
});

const Misc = z.object({
  bio: z
    .string({
      invalid_type_error: stringifyErrorID(errorIDs.User.WrongTypeBio),
    })
    .min(1, stringifyErrorID(errorIDs.User.BlankBio))
    .max(300, stringifyErrorID(errorIDs.User.LongBio))
    .nullable(),
  firstName: z
    .string({
      invalid_type_error: stringifyErrorID(errorIDs.User.WrongTypeFirstName),
    })
    .min(1, stringifyErrorID(errorIDs.User.BlankFirstName))
    .max(30, stringifyErrorID(errorIDs.User.LongFirstName))
    .nullable(),
  lastName: z
    .string({
      invalid_type_error: stringifyErrorID(errorIDs.User.WrongTypeLastName),
    })
    .min(1, stringifyErrorID(errorIDs.User.BlankLastName))
    .max(30, stringifyErrorID(errorIDs.User.LongLastName))
    .nullable(),
  photoSmall: z.string().nullable(),
  photoFull: z.string().nullable(),
});

const FollowCounts = z.object({
  followerCount: z.number().int(),
  followingCount: z.number().int(),
});

export const components = {
  __Id,
  Id,
  Username,
  Email,
  Password,
  Misc,
  FollowCounts,
};

export type Components = InferZodRecord<typeof components>;

/* ===================================================== */
/*                     RESOURCES                         */
/* ===================================================== */

const User = Id.merge(Username).merge(Email).merge(Misc.partial());
const QueriedUser = User.omit({ email: true }).merge(FollowCounts.partial());
const NewUser = User.merge(Password);
const NewUserRequest = NewUser.omit({ id: true });
const __QueriedUser = QueriedUser.merge(__Id);

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

const resUtil = {
  invalidFieldObject: <T extends z.ZodObject<any>, K extends keyof T['shape']>(
    obj: T,
    key: K
  ) => z.object({ [key]: z.any() } as { [x in K]: z.ZodAny }),
};

const response = {
  success: {
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
    userDataUpdated: zSuccessResponse(SuccessCode.Ok, Id),
    userCreated: zSuccessResponse(SuccessCode.Created, Id),
    followerAdded: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        target: Id,
        follower: Id,
      })
    ),
    userActivated: zSuccessResponse(SuccessCode.Ok, Id),
    userDeleted: zSuccessResponse(SuccessCode.Ok, Id),
    followerRemoved: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        target: Id,
        follower: Id,
      })
    ),
  },

  failure: {
    userIdNotFound: zFailureResponse(
      ErrorCode.NotFound,
      [zResponseError(errorIDs.User.UserNotFound, Id)],
      { errorRequired: true }
    ),
    invalidUserData: zFailureResponse(ErrorCode.BadRequest, [
      zResponseError(
        errorIDs.User.BlankBio,
        resUtil.invalidFieldObject(Misc, 'bio')
      ),
      zResponseError(
        errorIDs.User.LongBio,
        resUtil.invalidFieldObject(Misc, 'bio')
      ),
      zResponseError(
        errorIDs.User.WrongTypeBio,
        resUtil.invalidFieldObject(Misc, 'bio')
      ),

      zResponseError(
        errorIDs.User.BlankFirstName,
        resUtil.invalidFieldObject(Misc, 'firstName')
      ),
      zResponseError(
        errorIDs.User.LongFirstName,
        resUtil.invalidFieldObject(Misc, 'firstName')
      ),
      zResponseError(
        errorIDs.User.WrongTypeFirstName,
        resUtil.invalidFieldObject(Misc, 'firstName')
      ),

      zResponseError(
        errorIDs.User.BlankLastName,
        resUtil.invalidFieldObject(Misc, 'lastName')
      ),
      zResponseError(
        errorIDs.User.LongLastName,
        resUtil.invalidFieldObject(Misc, 'lastName')
      ),
      zResponseError(
        errorIDs.User.WrongTypeLastName,
        resUtil.invalidFieldObject(Misc, 'lastName')
      ),

      zResponseError(
        errorIDs.User.ShortUsername,
        resUtil.invalidFieldObject(Username, 'username')
      ),
      zResponseError(
        errorIDs.User.LongUsername,
        resUtil.invalidFieldObject(Username, 'username')
      ),
      zResponseError(
        errorIDs.User.InvalidUsername,
        resUtil.invalidFieldObject(Username, 'username')
      ),

      zResponseError(
        errorIDs.User.WrongTypeUsername,
        resUtil.invalidFieldObject(Username, 'username')
      ),
      zResponseError(
        errorIDs.User.InvalidEmail,
        resUtil.invalidFieldObject(Email, 'email')
      ),
      zResponseError(
        errorIDs.User.WrongTypeEmail,
        resUtil.invalidFieldObject(Email, 'email')
      ),

      zResponseError(
        errorIDs.User.ShortPassword,
        resUtil.invalidFieldObject(Password, 'password')
      ),
      zResponseError(
        errorIDs.User.LongPassword,
        resUtil.invalidFieldObject(Password, 'password')
      ),
      zResponseError(
        errorIDs.User.WeakPassword,
        resUtil.invalidFieldObject(Password, 'password')
      ),
      zResponseError(
        errorIDs.User.InvalidPassword,
        resUtil.invalidFieldObject(Password, 'password')
      ),
      zResponseError(
        errorIDs.User.WrongTypePassword,
        resUtil.invalidFieldObject(Password, 'password')
      ),
    ]),
    userAlreadyFollows: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(
        errorIDs.User.AlreadyFollowing,
        z.object({
          target: Id,
          follower: Id,
        })
      ),
    ]),
    userArealdyActivated: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.User.AlreadyActivated, Id),
    ]),
    userFieldConflict: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.User.EmailExists, Email),
      zResponseError(errorIDs.User.UsernameExists, Username),
    ]),
    userNotFollowing: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(
        errorIDs.User.NotFollowing,
        z.object({
          target: Id,
          follower: Id,
        })
      ),
    ]),
    newPasswordNotDifferent: zFailureResponse(ErrorCode.Conflict, [
      zResponseError(errorIDs.User.SamePassword),
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
    response.failure.invalidUserData,
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
  next: Id.shape.id,
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
      params: Id.strict(),
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
      params: Id,
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
      params: Id,
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
        id: Id.shape.id,
        followerId: Id.shape.id,
      }),
    }),
    response: z.union([
      response.success.boolean,
      response.failure.userIdNotFound,
    ]),
  },

  /**
   * Check if a user with the passed email/username exists
   *
   * `GET ../exists/:field/:value`
   *
   * Field: `"email"|"username"`
   */
  GetExistsEmail: {
    request: z.object({
      params: Email,
    }),
    response: response.success.boolean,
  },

  GetExistsUsername: {
    request: z.object({
      params: Username,
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
   * Edit a user's data
   *
   * `PUT ../:id`
   */
  Put: {
    request: z.object({
      params: Id,
      body: Misc.partial(),
    }),
    response: responseGroup.updateUserData,
  },

  /**
   * Change a users's password
   *
   * `PUT ../:id/password`
   */
  PutPassword: {
    request: z.object({
      params: Id,
      body: Password,
    }),
    response: z.union([
      response.success.userDataUpdated,
      response.failure.newPasswordNotDifferent,
      response.failure.userIdNotFound,
      response.failure.invalidUserData,
    ]),
  },

  /**
   * Change a users's email
   *
   * `PUT ../:id/email`
   */
  PutEmail: {
    request: z.object({
      params: Id,
      body: Email,
    }),
    response: responseGroup.updateUserData,
  },

  /**
   * Change a users's username
   *
   * `PUT ../:id/username`
   */
  PutUsername: {
    request: z.object({
      params: Id,
      body: Username,
    }),
    response: responseGroup.updateUserData,
  },

  /**
   * Make a user follow another.
   *
   * `PUT ../:id/followers/:followerId`
   */
  PutFollower: {
    request: z.object({
      params: z.object({
        id: Id.shape.id,
        followerId: Id.shape.id,
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
        id: Id.shape.id,
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
      response.failure.invalidUserData,
      response.failure.userFieldConflict,
    ]),
  },

  /**
   * Delete a user
   *
   * `DELETE ../:id`
   */
  Delete: {
    request: z.object({
      params: Id,
    }),
    response: z.union([
      response.success.userDeleted,
      response.failure.userIdNotFound,
    ]),
  },

  /**
   * Remove a user from the target's followers.
   *
   * `DELETE ../:id/followers/:followerId
   */
  DeleteFollow: {
    request: z.object({
      params: z.object({
        id: Id.shape.id,
        followerId: Id.shape.id,
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
