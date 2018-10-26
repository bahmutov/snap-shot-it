declare namespace snapshot {
  // This is necessary, or TS will consider this to be a "non-module entity"
}
// basic case
declare function snapshot(value: {}): void;
// named case
declare function snapshot(name: string, value: {}): void;
// unary function multiple scenarios
declare function snapshot<T>(fn: (arg: T) => any, ...fnArgs: T[]): void;
// multi-arg function multiple scenarios
declare function snapshot<T extends any[]>(
  fn: (...args: T) => any,
  ...fnArgs: T[]
): void;
export = snapshot;
