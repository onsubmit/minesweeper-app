import Cell from './cell';
import { integerSchema } from './schemas';

export type Coordinate = {
  row: number;
  column: number;
};

export default class MineField {
  private _grid: Array<Array<Cell | undefined>> = [];

  readonly rows: number;
  readonly columns: number;

  bombCoordinates: ReadonlyArray<Coordinate> = [];

  private constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
  }

  static build = (rows: number, columns: number, numBombs: number): MineField => {
    const dimensionSchema = integerSchema.gte(0);
    const numBombsSchema = integerSchema.gte(0).lte(rows * columns);

    rows = dimensionSchema.parse(rows);
    columns = dimensionSchema.parse(columns);
    numBombs = numBombsSchema.parse(numBombs);

    const field = new MineField(rows, columns);
    field._grid = Array.from(Array(rows), () => new Array(columns));

    const allCoordinates: Array<Coordinate> = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        allCoordinates.push({ row, column });
      }
    }

    field.bombCoordinates = allCoordinates.sort(() => Math.random() - 0.5).slice(0, numBombs);
    for (const { row, column } of field.bombCoordinates) {
      field._grid[row]![column] = Cell.createBombCell();
    }

    return field;
  };

  getCell = (row: number, column: number): Cell => {
    const existingCell = this._getCell(row, column);
    if (existingCell) {
      return existingCell;
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

        if (this._grid[r]?.[c]?.isBomb) {
          numNeighboringBombs++;
        }
      }
    }

    const newCell = Cell.createNonBombCell(numNeighboringBombs);
    this._grid[row]![column] = newCell;
    return newCell;
  };

  private _getCell = (row: number, column: number): Cell | undefined => {
    row = integerSchema.lt(this.rows).parse(row);
    column = integerSchema.lt(this.columns).parse(column);
    return this._grid[row]![column];
  };
}
