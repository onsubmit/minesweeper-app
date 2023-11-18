import { Coordinate } from './mineGrid';

const BOMB_VALUE = -1;

export default class Cell {
  private readonly _value: number | null;

  private _isVisible: boolean;
  private _isFlagged: boolean;

  readonly coordinate: Coordinate;

  private constructor(value: number | null, coordinate: Coordinate) {
    this._value = value;
    this._isVisible = false;
    this._isFlagged = false;

    this.coordinate = coordinate;
  }

  static createNonBombCell = (value: number, coordinate: Coordinate) => new this(value, coordinate);
  static createBombCell = (coordinate: Coordinate) => new this(BOMB_VALUE, coordinate);
  static createUnknownCell = (coordinate: Coordinate) => new this(null, coordinate);

  get value(): number {
    if (this._value === null) {
      throw new Error('Value not calculated yet');
    }

    return this._value;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get isFlagged(): boolean {
    return this._isFlagged;
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

    if (!this.isVisible) {
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
