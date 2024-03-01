import { BaseErrorID } from '@/ResponseError';

const ErrorIDs = {
  /* General */
  NotFound: {
    code: 400,
    message: 'Comment not found'
  },

  /* Body */
  BodyBlank: {
    code: 401,
    message: 'Comment body cannot be blank',
  },

  /* ID */
  IDBlank: {
    code: 402,
    message: 'Comment ID cannot be blank'
  }

} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
