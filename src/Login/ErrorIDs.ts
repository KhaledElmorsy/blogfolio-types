import { BaseErrorID } from '@/ResponseError/misc/BaseErrorID';

const ErrorIDs = {
  IncorrectPassword: {
    code: 10,
    message: 'Incorrect login password'
  }
} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
