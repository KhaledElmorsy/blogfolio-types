enum ErrorMessage {
  /* General */
  NoLogin = "Username or email doesn't exist",
  UserExists = 'A user with these login credentials already exists',
  UserNotFound = "User doesn't exist",

  /* Password */
  SamePassword = 'New password same as original',
  WeakPassword = 'Password not strong enough',
  ShortPassword = 'Password should be 8 characters or longer',
  LongPassword = "Password can't be longer than 50 characters",
  InvalidPassword = 'Password can only have letters, numbers and symbols',
  WrongTypePassword = 'Password should be a string',

  /* Username */
  UsernameExists = 'Username already taken',
  ShortUsername = "Username can't be shorter than 6 characters",
  LongUsername = "Username can't be longer than 30 characters",
  InvalidUsername = 'Username can only contain letters, numbers, and non-sequential periods',
  WrongTypeUsername = 'Username should be a string',

  /* Email */
  EmailExists = 'Email already taken',
  InvalidEmail = 'Email format invalid',
  WrongTypeEmail = 'Email should be a string',

  /* Bio */
  BlankBio = "Bio can't be a blank string",
  LongBio = "Bio can't be longer than 300 characters",
  WrongTypeBio = 'Bio should be a string',

  /* First Name */
  BlankFirstName = "First name can't be a blank string",
  LongFirstName = "First name can't be longer than 50 characters",
  WrongTypeFirstName = 'First name should be a string',

  /* Last Name */
  BlankLastName = "Last name can't be a blank string",
  LongLastName = "Last name can't be longer than 50 characters",
  WrongTypeLastName = 'Last name should be a string',

  /* Following */
  AlreadyFollowing = 'Target is already followed by the input user',
  NotFollowing = 'Target not followed by the input user',

  /* Activation */
  AlreadyActivated = 'User account is already activated',
}

export default ErrorMessage;
