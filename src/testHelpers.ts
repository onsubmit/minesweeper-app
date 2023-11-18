import { expect } from 'vitest';

export function assertDefined<T>(value: T | undefined): asserts value is T {
  expect(value).toBeDefined();
}
