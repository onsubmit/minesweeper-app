import { describe, expect, it } from 'vitest';

import Cell from './cell';

describe('Cell', () => {
  it('should create a non-bomb Cell', () => {
    const cell = Cell.createNonBombCell(3);
    expect(cell.value).toBe(3);
    expect(cell.isVisible).toBe(false);
    expect(cell.isFlagged).toBe(false);
    expect(cell.isBomb).toBe(false);
  });

  it('should create a bomb Cell', () => {
    const cell = Cell.createBombCell();
    expect(cell.value).toBe(-1);
    expect(cell.isVisible).toBe(false);
    expect(cell.isFlagged).toBe(false);
    expect(cell.isBomb).toBe(true);
  });

  it('should reveal a Cell', () => {
    const cell = Cell.createNonBombCell(0);
    expect(cell.isVisible).toBe(false);

    cell.reveal();
    expect(cell.isVisible).toBe(true);
  });

  it('should flag and unflag a Cell', () => {
    const cell = Cell.createNonBombCell(0);
    expect(cell.isFlagged).toBe(false);

    cell.toggleFlag();
    expect(cell.isFlagged).toBe(true);

    cell.toggleFlag();
    expect(cell.isFlagged).toBe(false);
  });
});
