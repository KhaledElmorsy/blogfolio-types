export function inSet<T>(set: Set<T>, element: unknown): element is T {
  return set.has(element as T);
}

export function inArray<T>(array: T[], element: unknown): element is T {
  return array.includes(element as T);
}
