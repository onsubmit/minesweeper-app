import Cell from './cell';
import { shuffleArray } from './utils/shuffleArray';
import { integerSchema, simpleParse } from './utils/zodUtils';

export type Coordinate = {
  row: number;
  column: number;
};

export default class MineGrid {
  private _grid: Array<Array<Cell>> = [];

  private readonly _rows: number;
  private readonly _columns: number;

  bombCoordinates: ReadonlyArray<Coordinate> = [];

  private constructor(rows: number, columns: number) {
    this._rows = rows;
    this._columns = columns;
  }

  static build = (rows: number, columns: number, numBombs: number): MineGrid => {
    const dimensionSchema = integerSchema.gte(0);
    const numBombsSchema = integerSchema.gte(0).lte(rows * columns);

    rows = simpleParse(dimensionSchema, rows);
    columns = simpleParse(dimensionSchema, columns);
    numBombs = simpleParse(numBombsSchema, numBombs);

    const mineGrid = new MineGrid(rows, columns);
    mineGrid._grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, column) => Cell.createUnknownCell({ row, column }))
    );

    mineGrid.bombCoordinates = MineGrid._getRandomBombCoordinates(rows, columns, numBombs);
    for (const { row, column } of mineGrid.bombCoordinates) {
      mineGrid._setCellOrThrow({ row, column }, Cell.createBombCell({ row, column }));
    }

    mineGrid._determineCellValues();

    return mineGrid;
  };

  private static _getRandomBombCoordinates(
    rows: number,
    columns: number,
    numBombs: number
  ): Array<Coordinate> {
    const allCoordinates: Array<Coordinate> = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        allCoordinates.push({ row, column });
      }
    }

    return shuffleArray(allCoordinates).slice(0, numBombs);
  }

  get grid(): Array<Array<Cell>> {
    return this._grid;
  }

  getCell = (coordinate: Coordinate): Cell => {
    let { row, column } = coordinate;

    row = simpleParse(integerSchema.gte(0).lt(this._rows), row);
    column = simpleParse(integerSchema.gte(0).lt(this._columns), column);

    return this._getCellOrThrow({ row, column });
  };

  getCellBorder = (cell: Cell): Array<Cell> => {
    const { row, column } = cell.coordinate;

    const cells: Array<Cell> = [];
    for (let r = row - 1; r <= row + 1; r++) {
      if (r < 0 || r >= this._rows) {
        continue;
      }

      for (let c = column - 1; c <= column + 1; c++) {
        if (c < 0 || c >= this._columns) {
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

  private _getCellOrThrow = (coordinate: Coordinate): Cell => {
    const { row, column } = coordinate;

    const gridRow = this._grid[row];
    if (!gridRow) {
      throw new Error(`Invalid row: ${row}`);
    }

    const cell = gridRow[column];
    if (!cell) {
      throw new Error(`Invalid coordinate: (${row}, ${column})`);
    }

    return cell;
  };

  private _setCellOrThrow = (coordinate: Coordinate, cell: Cell) => {
    const { row, column } = coordinate;

    const gridRow = this._grid[row];
    if (!gridRow) {
      throw new Error(`Invalid row: ${row}`);
    }

    gridRow[column] = cell;
  };

  private _determineCellValues = () => {
    for (let row = 0; row < this._rows; row++) {
      for (let column = 0; column < this._columns; column++) {
        if (this._getCellOrThrow({ row, column }).isBomb) {
          continue;
        }

        let numNeighboringBombs = 0;
        for (let r = row - 1; r <= row + 1; r++) {
          if (r < 0 || r >= this._rows) {
            continue;
          }

          for (let c = column - 1; c <= column + 1; c++) {
            if (c < 0 || c >= this._columns) {
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

        this._setCellOrThrow(
          { row, column },
          Cell.createNonBombCell(numNeighboringBombs, { row, column })
        );
      }
    }
  };
}
