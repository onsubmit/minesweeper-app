import { Coordinate } from './mineGrid';

const BOMB_VALUE = -1;

type CellCreationOptions = Partial<{
  isReserved: boolean;
  isLocked: boolean;
}>;

export default class Cell {
  private _value: number | null;

  private _isVisible: boolean;
  private _isFlagged: boolean;
  private _isReserved: boolean;
  private _isLocked: boolean;

  readonly coordinate: Coordinate;

  private constructor(
    value: number | null,
    coordinate: Coordinate,
    options: CellCreationOptions = { isReserved: false, isLocked: false }
  ) {
    this._value = value;
    this._isVisible = false;
    this._isFlagged = false;
    this._isReserved = options.isReserved ?? false;
    this._isLocked = options.isLocked ?? false;

    this.coordinate = coordinate;
  }

  static createNonBombCell = (value: number, coordinate: Coordinate) => new Cell(value, coordinate);
  static createBombCell = (coordinate: Coordinate, options: CellCreationOptions) =>
    new Cell(BOMB_VALUE, coordinate, options);
  static createUnknownCell = (coordinate: Coordinate, options: CellCreationOptions) =>
    new Cell(null, coordinate, options);

  get value(): number {
    if (this._value === null) {
      throw new Error('Value not calculated yet');
    }

    return this._value;
  }

  set value(v: number) {
    this._value = v;
  }

  get hasValue(): boolean {
    return this._value !== null;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get isFlagged(): boolean {
    return this._isFlagged;
  }

  get isReserved(): boolean {
    return this._isReserved;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  get isBomb(): boolean {
    return this._value === BOMB_VALUE;
  }

  reveal = () => {
    this._isFlagged = false;
    this._isVisible = true;
  };

  toggleFlag = () => {
    this._isFlagged = !this._isFlagged;
  };

  toString = () => {
    if (this.isFlagged) {
      return '🚩';
    }

    // if (!this.isVisible) {
    //   return '';
    // }

    // if (this.isLocked) {
    //   return '🔒';
    // }

    if (this.isReserved) {
      return '';
    }

    if (this.isBomb) {
      return '💥';
    }

    if (this.value === 0) {
      return '';
    }

    return `${this.value}`;
  };
}
