import { describe, expect, it } from 'vitest';

import { shuffleArray } from './shuffleArray';

describe('shuffleArray', () => {
  it('should shuffle an empty array', () => {
    const shuffled = shuffleArray<number>([]);
    expect(shuffled).toHaveLength(0);
  });

  it('should shuffle an array of length 1', () => {
    const shuffled = shuffleArray([1]);
    expect(shuffled).toHaveLength(1);
    expect(shuffled[0]).toBe(1);
  });

  it('should shuffle an array of notable length', () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const shuffled = shuffleArray(input);
    expect(shuffled).toHaveLength(10);
    expect(input).toEqual(expect.arrayContaining(shuffled));
  });
});
