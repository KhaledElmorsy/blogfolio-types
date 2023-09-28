import type { BaseErrorID } from '@/ResponseError';

const ErrorIDs = {
  InvalidFormat: { code: 900, message: 'Invalid request query array format' },
  Duplicate: {
    code: 901,
    message: 'Query array duplicates not allowed for this request parameter',
  },
  InvalidValue: {
    code: 902,
    message: 'Request query array value is not valid',
  },
} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
