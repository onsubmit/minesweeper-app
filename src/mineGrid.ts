import Cell from './cell';
import { integerSchema } from './schemas';

export type Coordinate = {
  row: number;
  column: number;
};

export default class MineGrid {
  private _grid: Array<Array<Cell>> = [];

  readonly rows: number;
  readonly columns: number;

  bombCoordinates: ReadonlyArray<Coordinate> = [];

  private constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
  }

  static build = (rows: number, columns: number, numBombs: number): MineGrid => {
    const dimensionSchema = integerSchema.gte(0);
    const numBombsSchema = integerSchema.gte(0).lte(rows * columns);

    rows = dimensionSchema.parse(rows);
    columns = dimensionSchema.parse(columns);
    numBombs = numBombsSchema.parse(numBombs);

    const mineGrid = new MineGrid(rows, columns);
    mineGrid._grid = Array.from(Array(rows), () =>
      Array.from(Array(columns), () => Cell.createUnknownCell())
    );

    const allCoordinates: Array<Coordinate> = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        allCoordinates.push({ row, column });
      }
    }

    mineGrid.bombCoordinates = allCoordinates.sort(() => Math.random() - 0.5).slice(0, numBombs);
    for (const { row, column } of mineGrid.bombCoordinates) {
      mineGrid._grid[row]![column] = Cell.createBombCell();
    }

    return mineGrid;
  };

  get grid(): Array<Array<Cell>> {
    return this._grid;
  }

  getCell = (row: number, column: number): Cell => {
    const cell = this._getCell(row, column);
    if (cell.hasValue) {
      return cell;
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

        if (this._grid[r]?.[c]?.isBomb) {
          numNeighboringBombs++;
        }
      }
    }

    const newCell = Cell.createNonBombCell(numNeighboringBombs);
    this._grid[row]![column] = newCell;
    return newCell;
  };

  private _getCell = (row: number, column: number): Cell => {
    row = integerSchema.lt(this.rows).parse(row);
    column = integerSchema.lt(this.columns).parse(column);
    return this._grid[row]![column]!;
  };
}
