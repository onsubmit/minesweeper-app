import { describe, expect, it } from 'vitest';

import MineGrid from './mineGrid';
import { assertDefined } from './testHelpers';

describe('MineGrid', () => {
  it('should create a minimal MineGrid with no bomb', () => {
    const field = MineGrid.build(1, 1, 0);
    expect(field.rows).toBe(1);
    expect(field.columns).toBe(1);
    expect(field.bombCoordinates).toHaveLength(0);

    const cell = field.getCell(0, 0);
    expect(cell.value).toBe(0);
    expect(cell.isVisible).toBe(false);
    expect(cell.isFlagged).toBe(false);
    expect(cell.isBomb).toBe(false);
  });

  it('should create a minimal MineGrid with a bomb', () => {
    const field = MineGrid.build(1, 1, 1);
    expect(field.rows).toBe(1);
    expect(field.columns).toBe(1);
    expect(field.bombCoordinates).toHaveLength(1);
    expect(field.bombCoordinates[0]).toEqual({ row: 0, column: 0 });

    const cell = field.getCell(0, 0);
    expect(cell.value).toBe(-1);
    expect(cell.isVisible).toBe(false);
    expect(cell.isFlagged).toBe(false);
    expect(cell.isBomb).toBe(true);
  });

  it('should create a basic MineGrid', () => {
    const field = MineGrid.build(2, 2, 1);
    expect(field.rows).toBe(2);
    expect(field.columns).toBe(2);
    expect(field.bombCoordinates).toHaveLength(1);
    assertDefined(field.bombCoordinates[0]);
    const { row, column } = field.bombCoordinates[0];

    for (let r = 0; r < field.rows; r++) {
      for (let c = 0; field.columns < 2; c++) {
        const cell = field.getCell(r, c);
        expect(cell.isVisible).toBe(false);
        expect(cell.isFlagged).toBe(false);

        if (r === row && c === column) {
          expect(cell.isBomb).toBe(true);
        } else {
          expect(cell.value).toBe(1);
          expect(cell.isBomb).toBe(false);
        }
      }
    }
  });
});
