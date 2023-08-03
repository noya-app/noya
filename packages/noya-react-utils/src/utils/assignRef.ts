export function assignRef<T>(
  ref: React.ForwardedRef<T> | undefined,
  value: T | null,
): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
