import { BaseErrorID } from '@/ResponseError/misc/BaseErrorID';

const ErrorIDs = {
  /* General */
  NoLogin: { code: 200, message: "Username or email doesn't exist" },
  UserExists: {
    code: 201,
    message: 'A user with these login credentials already exists',
  },
  UserNotFound: { code: 202, message: "User doesn't exist" },

  /* Password */
  SamePassword: { code: 203, message: 'New password same as original' },
  WeakPassword: { code: 204, message: 'Password not strong enough' },
  ShortPassword: {
    code: 205,
    message: 'Password should be 8 characters or longer',
  },
  LongPassword: {
    code: 206,
    message: "Password can't be longer than 50 characters",
  },
  InvalidPassword: {
    code: 207,
    message: 'Password can only have letters, numbers and symbols',
  },
  WrongTypePassword: { code: 208, message: 'Password should be a string' },

  /* Username */
  UsernameExists: { code: 209, message: 'Username already taken' },
  ShortUsername: {
    code: 210,
    message: "Username can't be shorter than 6 characters",
  },
  LongUsername: {
    code: 211,
    message: "Username can't be longer than 30 characters",
  },
  InvalidUsername: {
    code: 212,
    message:
      'Username can only contain letters, numbers, and non-sequential periods',
  },
  WrongTypeUsername: { code: 213, message: 'Username should be a string' },

  /* Email */
  EmailExists: { code: 214, message: 'Email already taken' },
  InvalidEmail: { code: 215, message: 'Email format invalid' },
  WrongTypeEmail: { code: 216, message: 'Email should be a string' },

  /* Bio */
  BlankBio: { code: 217, message: "Bio can't be a blank string" },
  LongBio: { code: 218, message: "Bio can't be longer than 300 characters" },
  WrongTypeBio: { code: 219, message: 'Bio should be a string' },

  /* First Name */
  BlankFirstName: { code: 220, message: "First name can't be a blank string" },
  LongFirstName: {
    code: 221,
    message: "First name can't be longer than 50 characters",
  },
  WrongTypeFirstName: { code: 222, message: 'First name should be a string' },

  /* Last Name */
  BlankLastName: { code: 223, message: "Last name can't be a blank string" },
  LongLastName: {
    code: 224,
    message: "Last name can't be longer than 50 characters",
  },
  WrongTypeLastName: { code: 225, message: 'Last name should be a string' },

  /* Following */
  AlreadyFollowing: {
    code: 226,
    message: 'Target is already followed by the input user',
  },
  NotFollowing: {
    code: 227,
    message: 'Target not followed by the input user',
  },

  /* Activation */
  AlreadyActivated: {
    code: 228,
    message: 'User account is already activated',
  },
} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
