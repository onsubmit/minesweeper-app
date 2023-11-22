import { describe, expect, it } from 'vitest';

import { assertDefined } from '../testHelpers';
import { getRandomArrayElement } from './getRandomArrayElement';

describe('getRandomArrayElement', () => {
  it('should return undefined for an empty array', () => {
    const element = getRandomArrayElement<number>([]);
    expect(element).toBeUndefined();
  });

  it('should return only item for an array with a single item', () => {
    const element = getRandomArrayElement<number>([3]);
    expect(element).toBe(3);
  });

  it('should return an item for an array of notable length', () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const element = getRandomArrayElement<number>(input);
    assertDefined(element);
    expect(input).toContain(element);
  });
});
