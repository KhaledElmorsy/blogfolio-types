import { BaseErrorID } from '@/ResponseError';

const ErrorIDs = {
  /* ID */
  IDInvalid: {
    code: 500,
    message: 'Emote IDs can only be positive integers',
  },

  /* General */
  NotFound: {
    code: 501,
    message: 'Emote not found',
  },

  NoEmotePost: {
    code: 502,
    message: "This user hasn't emoted on this post",
  },

  NoEmoteComment: {
    code: 503,
    message: "This user hasn't emoted on this comment",
  },
} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
