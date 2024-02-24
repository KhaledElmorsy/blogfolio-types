import { BaseErrorID } from '@/ResponseError';
import rules from './rules';

const ErrorIDs = {
  /* Title */
  BlankTitle: {
    code: 300,
    message: 'Post title cannot be blank',
  },
  LongTitle: {
    code: 301,
    message: `Post title cannot exceed ${rules.MAX_TITLE_LENGTH} characters`,
  },

  /* Summary */
  LongSummary: {
    code: 302,
    message: `Post summary cannot exceed ${rules.MAX_SUMMARY_LENGTH} characters`,
  },

  /* Body */
  LongBody: {
    code: 303,
    message: `Post body cannot exceed ${rules.MAX_BODY_LENGTH} characters`
  },

  /* Slug */
  InvalidSlug: {
    code: 304,
    message: 'Post slug can only contain alphanumeric characters and inner non-consecutive dashes'
  },
  LongSlug: {
    code: 305,
    message: `Post slug cannot exceed ${rules.MAX_SLUG_LENGTH} characters in total`
  },
  UnavailableSlug: {
    code: 306,
    message: 'Post slug already taken'
  },

  /* General */
  NotFound: {
    code: 307,
    message: 'Post not found'
  }

} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
