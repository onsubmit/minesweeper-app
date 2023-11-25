import { describe, expect, it } from 'vitest';

import Cell from './cell';
import MineGrid, { Coordinate } from './mineGrid';

describe('MineGrid', () => {
  describe('build', () => {
    it('should create a minimal MineGrid with no bomb', () => {
      const field = MineGrid.build({ rows: 1, columns: 1, numBombs: 0 });
      expect(field.bombs).toHaveLength(0);

      const cell = field.getCell({ row: 0, column: 0 });
      expect(cell.value).toBe(0);
      expect(cell.isVisible).toBe(true);
      expect(cell.isFlagged).toBe(false);
      expect(cell.isBomb).toBe(false);
    });

    it('should create a minimal MineGrid with a bomb', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 1 });
      expect(field.bombs).toHaveLength(1);
      expect(field.bombs[0]?.isBomb).toBe(true);

      const cell = field.getCell({ row: 0, column: 0 });
      expect(cell.value).toBe(0);
      expect(cell.isVisible).toBe(true);
      expect(cell.isFlagged).toBe(false);
      expect(cell.isBomb).toBe(false);
    });

    it('should create a basic MineGrid', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 3 });
      expect(field.bombs).toHaveLength(3);

      for (let r = 0; r < field.rows; r++) {
        for (let c = 0; c < field.columns; c++) {
          const cell = field.getCell({ row: r, column: c });
          expect(cell.isFlagged).toBe(false);

          if (r === 0) {
            expect(cell.value).toBe(0);
            expect(cell.isVisible).toBe(true);
          } else if (r === 1) {
            expect(cell.value).toBe(c === 1 ? 3 : 2);
            expect(cell.isVisible).toBe(true);
          } else {
            expect(cell.isBomb).toBe(true);
          }
        }
      }
    });
  });

  describe('getCellBorder', () => {
    function expectBorderHasCellAt(border: Array<Cell>, expected: Coordinate) {
      expect(
        border.filter(
          ({ coordinate: { row, column } }) => row === expected.row && column === expected.column
        )
      ).toHaveLength(1);
    }

    it('should get a the cell border for a cell in the top-left corner', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 0, column: 0 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(3);
      expectBorderHasCellAt(border, { row: 0, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 0 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
    });

    it('should get a the cell border for a cell in the top-right corner', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 0, column: 2 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(3);
      expectBorderHasCellAt(border, { row: 0, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 2 });
    });

    it('should get a the cell border for a cell in the bottom-left corner', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 2, column: 0 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(3);
      expectBorderHasCellAt(border, { row: 1, column: 0 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 2, column: 1 });
    });

    it('should get a the cell border for a cell in the bottom-right corner', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 2, column: 2 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(3);
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 2 });
      expectBorderHasCellAt(border, { row: 2, column: 1 });
    });

    it('should get a the cell border for a cell on the top edge', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 0, column: 1 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(5);
      expectBorderHasCellAt(border, { row: 0, column: 0 });
      expectBorderHasCellAt(border, { row: 0, column: 2 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 2 });
    });

    it('should get a the cell border for a cell on the left edge', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 1, column: 0 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(5);
      expectBorderHasCellAt(border, { row: 0, column: 0 });
      expectBorderHasCellAt(border, { row: 0, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 2, column: 1 });
      expectBorderHasCellAt(border, { row: 2, column: 0 });
    });

    it('should get a the cell border for a cell on the bottom edge', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 2, column: 1 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(5);
      expectBorderHasCellAt(border, { row: 1, column: 0 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 1, column: 2 });
      expectBorderHasCellAt(border, { row: 2, column: 0 });
      expectBorderHasCellAt(border, { row: 2, column: 2 });
    });

    it('should get a the cell border for a cell on the right edge', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 1, column: 2 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(5);
      expectBorderHasCellAt(border, { row: 0, column: 1 });
      expectBorderHasCellAt(border, { row: 0, column: 2 });
      expectBorderHasCellAt(border, { row: 1, column: 1 });
      expectBorderHasCellAt(border, { row: 2, column: 1 });
      expectBorderHasCellAt(border, { row: 2, column: 2 });
    });

    it('should get a the cell border for an interior cell', () => {
      const field = MineGrid.build({ rows: 3, columns: 3, numBombs: 0 });
      const cell = field.getCell({ row: 1, column: 1 });
      const border = field.getCellBorder(cell);
      expect(border).toHaveLength(8);
      expectBorderHasCellAt(border, { row: 0, column: 0 });
      expectBorderHasCellAt(border, { row: 0, column: 1 });
      expectBorderHasCellAt(border, { row: 0, column: 2 });
      expectBorderHasCellAt(border, { row: 1, column: 0 });
      expectBorderHasCellAt(border, { row: 1, column: 2 });
      expectBorderHasCellAt(border, { row: 2, column: 0 });
      expectBorderHasCellAt(border, { row: 2, column: 1 });
      expectBorderHasCellAt(border, { row: 2, column: 2 });
    });
  });

  describe('errors', () => {
    it('should throw when creating a MineGrid with invalid number of rows', () => {
      expect(() => MineGrid.build({ rows: -2, columns: 1, numBombs: 1 })).toThrowError(
        'Number must be greater than or equal to 0. Received: -2'
      );
    });

    it('should throw when creating a MineGrid with invalid number of columns', () => {
      expect(() => MineGrid.build({ rows: 1, columns: -2, numBombs: 1 })).toThrowError(
        'Number must be greater than or equal to 0. Received: -2'
      );
    });

    it('should throw when creating a MineGrid with invalid number of bombs', () => {
      expect(() => MineGrid.build({ rows: 10, columns: 5, numBombs: -1 })).toThrowError(
        'Number must be greater than or equal to 0. Received: -1'
      );
    });

    it('should throw when creating a MineGrid with too many bombs', () => {
      expect(() => MineGrid.build({ rows: 10, columns: 5, numBombs: 26 })).toThrowError(
        'Number must be less than or equal to 25. Received: 26'
      );
    });

    it('should throw when accessing a coordinate with invalid row', () => {
      const field = MineGrid.build({ rows: 5, columns: 5, numBombs: 0 });
      expect(() => field.getCell({ row: 10, column: 2 })).toThrowError(
        'Number must be less than 5. Received: 10'
      );
      expect(() => field.getCell({ row: -3, column: 2 })).toThrowError(
        'Number must be greater than or equal to 0. Received: -3'
      );
    });

    it('should throw when accessing a coordinate with invalid column', () => {
      const field = MineGrid.build({ rows: 10, columns: 5, numBombs: 0 });
      expect(() => field.getCell({ row: 0, column: 10 })).toThrowError(
        'Number must be less than 5. Received: 10'
      );
      expect(() => field.getCell({ row: 0, column: -3 })).toThrowError(
        'Number must be greater than or equal to 0. Received: -3'
      );
    });
  });
});
