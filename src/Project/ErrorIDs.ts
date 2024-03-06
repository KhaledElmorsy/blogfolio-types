import { BaseErrorID } from '..';
import rules from './rules';

const ErrorIDs = {
  /* General */
  notFound: {
    code: 600,
    message: 'Project not found',
  },

  /* Name */
  nameBlank: {
    code: 601,
    message: 'Project name cannot be blank',
  },
  nameTooLong: {
    code: 602,
    message: `Project name cannot exceed ${rules.MAX_PROJECT_NAME} characters`,
  },

  /* Description */
  descriptionBlank: {
    code: 603,
    message: 'Project description cannot be blank',
  },

  /* Skills */
  skillBlank: {
    code: 604,
    message: 'A skill cannot be blank',
  },

  /* Priority */
  priorityInvalid: {
    code: 606,
    message: 'Project priority can only be positive integers'
  }
} as const satisfies Record<string, BaseErrorID>;

export default ErrorIDs;
