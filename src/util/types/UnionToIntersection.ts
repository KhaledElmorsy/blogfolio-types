/** Source: https://stackoverflow.com/a/50375286/17804016 */
export type UnionToIntersection<T> = (
  T extends any ? (k: T) => void : never
) extends (k: infer I) => void
  ? I
  : never;
