import Cell from './cell';
import { getRandomArrayElement } from './utils/getRandomArrayElement';
import { shuffleArray } from './utils/shuffleArray';
import { integerSchema, simpleParse } from './utils/zodUtils';

export type Coordinate = {
  row: number;
  column: number;
};

export default class MineGrid {
  private _grid: Array<Array<Cell>> = [];
  private _bombs: Array<Cell> = [];
  private readonly _bombChance: number;

  readonly rows: number;
  readonly columns: number;

  private constructor(rows: number, columns: number, bombChance: number) {
    this.rows = rows;
    this.columns = columns;
    this._bombChance = bombChance;
  }

  static build = (options: {
    rows: number;
    columns: number;
    numBombs: number;
    minBombRow: number;
  }): MineGrid => {
    let { rows, columns, numBombs, minBombRow } = options;

    const nonNegativeSchema = integerSchema.gte(0);
    rows = simpleParse(nonNegativeSchema, rows);
    columns = simpleParse(nonNegativeSchema, columns);
    minBombRow = simpleParse(nonNegativeSchema.lt(rows), minBombRow);

    const numBombsSchema = nonNegativeSchema.lte((rows - minBombRow) * columns);
    numBombs = simpleParse(numBombsSchema, numBombs);

    const mineGrid = new MineGrid(rows, columns, numBombs / (rows * columns));
    mineGrid._grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, column) =>
        Cell.createUnknownCell({ row, column }, { isLocked: row < minBombRow - 1 })
      )
    );

    const bombCoordinates = MineGrid._getRandomBombCoordinates(rows, columns, numBombs, minBombRow);
    for (const bombCoordinate of bombCoordinates) {
      const bombCell = Cell.createBombCell(bombCoordinate);
      mineGrid._setCellOrThrow(bombCell);
    }

    mineGrid._determineCellValues();

    return mineGrid;
  };

  private static _getRandomBombCoordinates(
    rows: number,
    columns: number,
    numBombs: number,
    minBombRow: number
  ): Array<Coordinate> {
    const allCoordinates: Array<Coordinate> = [];
    for (let row = minBombRow; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        allCoordinates.push({ row, column });
      }
    }

    return shuffleArray(allCoordinates).slice(0, numBombs);
  }

  get grid(): Array<Array<Cell>> {
    return this._grid;
  }

  get bombs(): Array<Cell> {
    return this._bombs;
  }

  getCell = (coordinate: Coordinate): Cell => {
    let { row, column } = coordinate;

    row = simpleParse(integerSchema.gte(0).lt(this.rows), row);
    column = simpleParse(integerSchema.gte(0).lt(this.columns), column);

    return this._getCellOrThrow({ row, column });
  };

  getCellBorder = (cell: Cell): Array<Cell> => {
    const { row, column } = cell.coordinate;

    const cells: Array<Cell> = [];
    for (let r = row - 1; r <= row + 1; r++) {
      if (r < 0 || r >= this.rows) {
        continue;
      }

      for (let c = column - 1; c <= column + 1; c++) {
        if (c < 0 || c >= this.columns) {
          continue;
        }

        if (r === row && c === column) {
          continue;
        }

        cells.push(this._getCellOrThrow({ row: r, column: c }));
      }
    }

    return cells;
  };

  removeClearedRows = (): number => {
    const rowsToRemove: number[] = [];
    for (let row = 0; row < this.rows; row++) {
      const gridRow = this._getRowOrThrow(row);

      const isCellClearFn = (cell: Cell) =>
        !cell.isLocked && (cell.isVisible || (cell.isFlagged && cell.isBomb));

      const isRowClear = gridRow.every(isCellClearFn);

      if (isRowClear) {
        rowsToRemove.push(row);
      }
    }

    const numClearedRows = rowsToRemove.length;
    if (numClearedRows === 0) {
      return 0;
    }

    for (let r = numClearedRows - 1; r >= 0; r--) {
      this._grid.splice(rowsToRemove[r]!, 1);
    }

    for (let row = numClearedRows - 1; row >= 0; row--) {
      const newRow = Array.from({ length: this.columns }, (_, column) =>
        Cell.createUnknownCell({ row, column }, { isLocked: true })
      );

      this._grid.unshift(newRow);
    }

    for (let row = numClearedRows; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const cell = this.getCell({ row, column });
        cell.coordinate.row = row;
      }
    }

    this._determineCellValues();
    return numClearedRows;
  };

  tryMoveBombCellElsewhere = (cell: Cell): void => {
    if (!cell.isBomb) {
      throw new Error('You can only move a bomb cell.');
    }

    if (this._bombChance === 1) {
      // The entire grid is bombs; don't bother.
      return;
    }

    const nonBombCoordinates: Array<Coordinate> = [];
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const coordinate = { row, column };
        if (this.getCell(coordinate).isBomb) {
          continue;
        }

        nonBombCoordinates.push(coordinate);
      }
    }

    cell.value = 0;
    for (const oldBorderCell of this.getCellBorder(cell)) {
      if (oldBorderCell.isBomb) {
        cell.value++;
      } else {
        oldBorderCell.value--;
      }
    }

    const newCoordinate = getRandomArrayElement(nonBombCoordinates)!;
    const newCell = Cell.createBombCell(newCoordinate);
    this._setCellOrThrow(newCell);
    for (const newBorderCell of this.getCellBorder(newCell)) {
      if (!newBorderCell.isBomb) {
        newBorderCell.value++;
      }
    }
  };

  private _getCellOrThrow = (coordinate: Coordinate): Cell => {
    const { row, column } = coordinate;

    const cell = this._getRowOrThrow(row)[column];
    if (!cell) {
      throw new Error(`Invalid coordinate: (${row}, ${column})`);
    }

    return cell;
  };

  private _setCellOrThrow = (cell: Cell) => {
    const { row, column } = cell.coordinate;
    this._getRowOrThrow(row)[column] = cell;

    if (cell.isBomb) {
      this._bombs.push(cell);
    }
  };

  private _getRowOrThrow = (row: number): Array<Cell> => {
    const gridRow = this._grid[row];
    if (!gridRow) {
      throw new Error(`Invalid row: ${row}`);
    }

    return gridRow;
  };

  private _determineCellValues = () => {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const cell = this._getCellOrThrow({ row, column });
        if (cell.isBomb) {
          continue;
        }

        let numNeighboringBombs = 0;
        for (let r = row - 1; r <= row + 1; r++) {
          if (r < 0 || r >= this.rows) {
            continue;
          }

          for (let c = column - 1; c <= column + 1; c++) {
            if (c < 0 || c >= this.columns) {
              continue;
            }

            if (r === row && c === column) {
              continue;
            }

            if (this._getCellOrThrow({ row: r, column: c }).isBomb) {
              numNeighboringBombs++;
            }
          }
        }

        cell.value = numNeighboringBombs;
      }
    }
  };
}
