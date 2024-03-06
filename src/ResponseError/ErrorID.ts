import UserErrorIDs from '@/User/ErrorIDs';
import QueryArrayErrorIDs from '@/util/schema/queryArray/ErrorIDs';
import uniqueIDTree from './misc/uniqueIDTree';
import AuthErrorIDs from '@/Authentication/ErrorIDs';
import PostErrorIDs from '@/Post/ErrorIDs';
import CommentErrorIDs from '@/Comment/ErrorIDs';
import EmoteErrorIDs from '@/Emote/ErrorIDs';
import ProjectErrorIDs from '@/Project/ErrorIDs';
import { BaseErrorID } from './misc';

/**
 * Separate module error IDs into their own files and import from those files
 * directly to avoid circular refernces.
 *
 * i.e.
 * Good: import UserErrorIDs from '@/User/ErrorIDs';
 * Bad:  import { UserErrorIDs } from '@/User';
 *
 * The flow should always be:
 * - Domain/ErrorIDs --> ErrorID (here) --{@link errorIDs}--> Domain/whatever
 * - Domain/ErrorIDs --> ErrorID (here) -- @/ResponseError.{@link errorIDs}--> Domain/whatever
 *
 */

const GeneralErrorIDs = {
  ServerError: { code: 1, message: 'Server error' },
  InvalidRequest: { code: 2, message: 'Invalid request' },
  NotFound: { code: 3, message: 'Resource not found' },
} as const satisfies Record<string, BaseErrorID>;

/**
 * Consolidated tree of all Error IDs. Validates ID code and message uniqueness.
 * Defines the {@link ErrorID} type.
 *
 * **Always** use when defining responses or errors. Never directly use external
 * error IDs since they may not be registered and validated by this tree.
 */
const errorIDs = uniqueIDTree({
  User: UserErrorIDs,
  Post: PostErrorIDs,
  Comment: CommentErrorIDs,
  Authentication: AuthErrorIDs,
  Emote: EmoteErrorIDs,
  General: GeneralErrorIDs,
  Project: ProjectErrorIDs,
  Request: {
    QueryArray: QueryArrayErrorIDs,
  },
});

type Leaves<T> = {
  [f in keyof T]: T[f] extends BaseErrorID ? T[f] : Leaves<T[f]>;
} extends infer G
  ? G[keyof G]
  : never;

/** All registered error IDs */
export type ErrorID = Leaves<typeof errorIDs>;
export default errorIDs;
