import Cell from './cell';
import { integerSchema } from './schemas';
import { shuffleArray } from './utils/shuffleArray';

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
    mineGrid._grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, column) => Cell.createUnknownCell({ row, column }))
    );

    const allCoordinates: Array<Coordinate> = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        allCoordinates.push({ row, column });
      }
    }

    mineGrid.bombCoordinates = shuffleArray(allCoordinates).slice(0, numBombs);
    for (const { row, column } of mineGrid.bombCoordinates) {
      mineGrid._grid[row]![column] = Cell.createBombCell({ row, column });
    }

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (mineGrid.getCell({ row, column }).isBomb) {
          continue;
        }

        let numNeighboringBombs = 0;
        for (let r = row - 1; r <= row + 1; r++) {
          if (r < 0 || r >= mineGrid.rows) {
            continue;
          }

          for (let c = column - 1; c <= column + 1; c++) {
            if (c < 0 || c >= mineGrid.columns) {
              continue;
            }

            if (r === row && c === column) {
              continue;
            }

            if (mineGrid._grid[r]?.[c]?.isBomb) {
              numNeighboringBombs++;
            }
          }
        }

        mineGrid._grid[row]![column] = Cell.createNonBombCell(numNeighboringBombs, { row, column });
      }
    }

    return mineGrid;
  };

  get grid(): Array<Array<Cell>> {
    return this._grid;
  }

  getCell = (coordinate: Coordinate): Cell => {
    let { row, column } = coordinate;
    row = integerSchema.lt(this.rows).parse(row);
    column = integerSchema.lt(this.columns).parse(column);

    return this._grid[row]![column]!;
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

        cells.push(this.getCell({ row: r, column: c }));
      }
    }

    return cells;
  };
}
