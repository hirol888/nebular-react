interface Input<T extends Record<string, string>> {
  cx(...classNames: any): string;
  classes: T;
  classNames: Partial<T>;
  name: string | string[];
}

export function mergeClassNames<T extends Record<string, string>>({
  cx,
  classes,
  classNames,
  name
}: Input<T>) {
  return Object.keys(classes).reduce((acc, className) => {
    acc[className] = cx(
      classes[className],
      classNames != null && classNames[className],
      Array.isArray(name)
        ? name
            .filter(Boolean)
            .map((part) => `nebular-${part}-${className}`)
            .join(' ')
        : name
        ? `nebular-${name}-${className}`
        : null
    );
    return acc;
  }, {}) as T;
}
