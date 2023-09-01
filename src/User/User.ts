import { z } from 'zod';
import { queryArray } from '../util/schema';
import type {
  InferEndpointRecord,
  InferZodRecord,
  EndpointRecord,
} from '../util/types';
import {
  ErrorCode,
  SuccessCode,
  zError,
  zErrorResponse,
  zSuccessResponse,
} from '@/Response';
import Error from '@/Error';

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
    .string({ invalid_type_error: Error.User.WrongTypeEmail })
    .email(Error.User.InvalidEmail),
});

const Username = z.object({
  /**
   * Usernames rules:
   * - Alphanumeric\period only.
   * - No multiple adjacent periods.
   * - Doesn't start or end with a period.
   */
  username: z
    .string({ invalid_type_error: Error.User.WrongTypeUsername })
    .min(6, Error.User.ShortUsername)
    .max(30, Error.User.LongUsername)
    .regex(
      /^(?!\.)([a-zA-Z0-9]|(?<!\.)\.)+(?<!\.)$/,
      Error.User.InvalidUsername
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
    .string({ invalid_type_error: Error.User.WrongTypePassword })
    .min(8, Error.User.ShortPassword)
    .max(50, Error.User.LongPassword)
    .regex(/[a-zA-Z0-9 -/]/, Error.User.InvalidPassword)
    .refine(
      (pass) =>
        Number(/[a-z]/.test(pass))
          + Number(/[A-Z]/.test(pass))
          + Number(/\d/.test(pass))
          + Number(/[ -/]+/.test(pass))
        >= 3,
      Error.User.WeakPassword
    ),
});

const Misc = z.object({
  bio: z
    .string({ invalid_type_error: Error.User.WrongTypeBio })
    .min(1, Error.User.BlankBio)
    .max(300, Error.User.LongBio)
    .nullable(),
  firstName: z
    .string({ invalid_type_error: Error.User.WrongTypeFirstName })
    .min(1, Error.User.BlankFirstName)
    .max(30, Error.User.LongFirstName)
    .nullable(),
  lastName: z
    .string({ invalid_type_error: Error.User.WrongTypeLastName })
    .min(1, Error.User.BlankLastName)
    .max(30, Error.User.LongLastName)
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
  invField: <T extends z.ZodObject<any>, K extends keyof T['shape']>(
    obj: T,
    key: K
  ) => z.object({ [key]: z.any() } as { [x in K]: z.ZodAny }),
};

const response = {
  success: {
    foundUser: zSuccessResponse(SuccessCode.Ok, z.array(QueriedUser).length(1)),
    foundUsers: zSuccessResponse(SuccessCode.Ok, z.array(QueriedUser)),
    boolean: zSuccessResponse(SuccessCode.Ok, z.boolean()),
    userDataUpdated: zSuccessResponse(SuccessCode.Ok, Id),
    userCreated: zSuccessResponse(SuccessCode.Created, Id),
    followerAdded: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        target: Id.shape.id,
        follower: Id.shape.id,
      })
    ),
    userActivated: zSuccessResponse(SuccessCode.Ok, Id),
    userDeleted: zSuccessResponse(SuccessCode.Ok, Id),
    followerRemoved: zSuccessResponse(
      SuccessCode.Ok,
      z.object({
        target: Id.shape.id,
        follower: Id.shape.id,
      })
    ),
  },

  error: {
    userIdNotFound: zErrorResponse(
      ErrorCode.NotFound,
      [zError(Error.User.UserNotFound, Id)],
      { errorRequired: true }
    ),
    generalInvalidRequest: zErrorResponse(ErrorCode.BadRequest, [
      zError(Error.General.InvalidRequest, z.any()),
    ]),
    invalidUserData: zErrorResponse(ErrorCode.BadRequest, [
      zError(Error.User.BlankBio, resUtil.invField(Misc, 'bio')),
      zError(Error.User.LongBio, resUtil.invField(Misc, 'bio')),
      zError(Error.User.WrongTypeBio, resUtil.invField(Misc, 'bio')),

      zError(Error.User.BlankFirstName, resUtil.invField(Misc, 'firstName')),
      zError(Error.User.LongFirstName, resUtil.invField(Misc, 'firstName')),
      zError(
        Error.User.WrongTypeFirstName,
        resUtil.invField(Misc, 'firstName')
      ),

      zError(Error.User.BlankLastName, resUtil.invField(Misc, 'lastName')),
      zError(Error.User.LongLastName, resUtil.invField(Misc, 'lastName')),
      zError(Error.User.WrongTypeLastName, resUtil.invField(Misc, 'lastName')),

      zError(Error.User.ShortUsername, resUtil.invField(Username, 'username')),
      zError(Error.User.LongUsername, resUtil.invField(Username, 'username')),
      zError(
        Error.User.InvalidUsername,
        resUtil.invField(Username, 'username')
      ),

      zError(
        Error.User.WrongTypeUsername,
        resUtil.invField(Username, 'username')
      ),
      zError(Error.User.InvalidEmail, resUtil.invField(Email, 'email')),
      zError(Error.User.WrongTypeEmail, resUtil.invField(Email, 'email')),

      zError(Error.User.ShortPassword, resUtil.invField(Password, 'password')),
      zError(Error.User.LongPassword, resUtil.invField(Password, 'password')),
      zError(Error.User.WeakPassword, resUtil.invField(Password, 'password')),
      zError(
        Error.User.InvalidPassword,
        resUtil.invField(Password, 'password')
      ),
      zError(
        Error.User.WrongTypePassword,
        resUtil.invField(Password, 'password')
      ),
    ]),
    userAlreadyFollows: zErrorResponse(ErrorCode.Conflict, [
      zError(
        Error.User.AlreadyFollowing,
        z.object({
          target: Id.shape.id,
          follower: Id.shape.id,
        })
      ),
    ]),
    userArealdyActivated: zErrorResponse(ErrorCode.Conflict, [
      zError(Error.User.AlreadyActivated, Id),
    ]),
    userFieldConflict: zErrorResponse(ErrorCode.Conflict, [
      zError(Error.User.EmailExists, Email),
      zError(Error.User.UsernameExists, Username),
    ]),
    userNotFollowing: zErrorResponse(ErrorCode.Conflict, [
      zError(
        Error.User.NotFollowing,
        z.object({
          target: Id.shape.id,
          follower: Id.shape.id,
        })
      ),
    ]),
  },
};

const responseGroup = {
  userList: z.union([
    response.success.foundUsers,
    response.error.userIdNotFound,
    response.error.generalInvalidRequest,

  ]),
  updateUserData: z.union([
    response.success.userDataUpdated,
    response.error.invalidUserData,
    response.error.userIdNotFound,
    response.error.userFieldConflict,
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
      response.error.userIdNotFound,
      response.error.generalInvalidRequest,
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
      response.error.userIdNotFound,
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
      body: Misc,
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
    response: responseGroup.updateUserData,
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
      response.error.userIdNotFound,
      response.error.userAlreadyFollows,
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
      response.error.userArealdyActivated,
      response.error.userIdNotFound,
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
      response.error.invalidUserData,
      response.error.generalInvalidRequest,
      response.error.userFieldConflict,
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
      response.error.userIdNotFound,
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
      response.error.userNotFollowing,
      response.error.userIdNotFound,
    ]),
  },
} satisfies EndpointRecord;

export type Endpoints = InferEndpointRecord<typeof endPoints>;
