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

  static build = (options: { rows: number; columns: number; numBombs: number }): MineGrid => {
    let { rows, columns, numBombs } = options;

    const nonNegativeSchema = integerSchema.gte(0);
    rows = simpleParse(nonNegativeSchema, rows);
    columns = simpleParse(nonNegativeSchema, columns);
    const minBombRow = Math.ceil(rows / 2);

    const numBombsSchema = nonNegativeSchema.lte((rows - minBombRow) * columns);
    numBombs = simpleParse(numBombsSchema, numBombs);

    const mineGrid = new MineGrid(rows, columns, numBombs / (rows * columns));
    mineGrid._grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, column) => Cell.createUnknownCell({ row, column }))
    );

    const bombCoordinates = MineGrid._getRandomBombCoordinates(rows, columns, numBombs, minBombRow);
    for (const bombCoordinate of bombCoordinates) {
      const bombCell = Cell.createBombCell(bombCoordinate);
      mineGrid._setCellOrThrow(bombCell);
    }

    mineGrid._determineCellValues();
    mineGrid.reveal(mineGrid._getCellOrThrow({ row: 0, column: 0 }), { revealFlaggedCells: false });

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

  reveal = (cell: Cell, options: { revealFlaggedCells: boolean }) => {
    if (cell.isVisible) {
      return;
    }

    if (cell.isFlagged && !options.revealFlaggedCells) {
      return;
    }

    cell.reveal();

    if (cell.value === 0) {
      this.getCellBorder(cell).forEach((c) => this.reveal(c, { revealFlaggedCells: false }));
    }
  };

  tryAddNewRow = (): boolean => {
    const firstEmptyRowIndex = this._grid.findIndex((row) => row.every((cell) => cell.isVisible));

    if (firstEmptyRowIndex < 0) {
      return false;
    }

    const newRow = Array.from({ length: this.columns }, (_, column) =>
      Math.random() < this._bombChance
        ? Cell.createBombCell({ row: 0, column }, { isLocked: true })
        : Cell.createUnknownCell({ row: 0, column }, { isLocked: true })
    );

    this._grid.splice(firstEmptyRowIndex, 1);
    this._grid.unshift(newRow);
    this._determineCellValues();
    return true;
  };

  removeClearedRows = (): boolean => {
    // Determine which rows can be removed.
    const rowsToRemove: number[] = [];
    for (let row = 0; row < this.rows; row++) {
      const gridRow = this._getRowOrThrow(row);

      const isCellClearFn = (cell: Cell) => cell.isVisible || (cell.isFlagged && cell.isBomb);

      const isRowClear = gridRow.every(isCellClearFn);

      if (isRowClear) {
        rowsToRemove.push(row);
      }
    }

    if (rowsToRemove.length === 0) {
      return true;
    }

    // Leading empty rows are exempt.
    while (this._grid[rowsToRemove[0]!]?.every((cell) => cell.value === 0)) {
      rowsToRemove.splice(0, 1);
    }

    const numClearedRows = rowsToRemove.length;
    if (numClearedRows === 0) {
      return true;
    }

    // Remove those rows.
    for (let r = numClearedRows - 1; r >= 0; r--) {
      this._grid.splice(rowsToRemove[r]!, 1);
    }

    // Insert new, empty rows at the beginning.
    for (let row = 0; row < numClearedRows; row++) {
      const insertionRow = this._getRowForInsertion();
      if (insertionRow < 0) {
        return false;
      }

      const newRow = Array.from({ length: this.columns }, (_, column) =>
        Cell.createZeroCell({ row: insertionRow, column }, { isVisible: true })
      );

      this._grid.splice(insertionRow, 0, newRow);
    }

    this._determineCoordinates();
    this._determineCellValues();
    return true;
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
        const cell = this.getCell(coordinate);
        if (cell.isBomb) {
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

  tryDropLockedRow = (row: number): boolean => {
    const canRowDrop =
      row < this.rows - 1 && this._getRowOrThrow(row + 1).every((cell) => cell.isVisible);

    if (!canRowDrop) {
      return false;
    }

    this._grid.splice(row + 1, 1);

    const newRow = Array.from({ length: this.columns }, (_, column) =>
      Cell.createUnknownCell({ row, column }, { isVisible: true })
    );

    this._grid.splice(row, 0, newRow);

    this._determineCoordinates();

    const afterDropRowIndex = row + 1;
    const shouldUnlockRow =
      afterDropRowIndex === this.rows - 1 ||
      this._getRowOrThrow(afterDropRowIndex + 1).some(
        (cell) => !cell.isLocked && (cell.isFlagged || !cell.isVisible)
      );

    if (shouldUnlockRow) {
      this._getRowOrThrow(afterDropRowIndex).forEach((cell) => cell.unlock());
    }

    this._determineCellValues();

    return true;
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

  private _getRowForInsertion = (): number => {
    const clearRows = this._grid.reduce<number[]>(
      (acc, row, rowIndex) =>
        row.every((cell) => cell.isVisible && cell.value === 0) ? [...acc, rowIndex] : acc,
      []
    );

    if (clearRows.length === 0) {
      return -1;
    }

    return clearRows.at(-1)! + 1;
  };

  private _determineCoordinates = () => {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const cell = this.getCell({ row, column });
        cell.coordinate.row = row;
      }
    }
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

            const cell = this._getCellOrThrow({ row: r, column: c });
            if (cell.isLocked) {
              continue;
            }

            if (cell.isBomb) {
              numNeighboringBombs++;
            }
          }
        }

        cell.value = numNeighboringBombs;
      }
    }
  };
}
