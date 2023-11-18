const BOMB_VALUE = -1;

export default class Cell {
  private _value: number;
  private _isVisible: boolean;
  private _isFlagged: boolean;

  private constructor(value: number) {
    this._value = value;
    this._isVisible = false;
    this._isFlagged = false;
  }

  static createNonBombCell = (value: number) => new this(value);
  static createBombCell = () => new this(BOMB_VALUE);

  get value(): number {
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
    this._isVisible = true;
  };

  toggleFlag = () => {
    this._isFlagged = !this._isFlagged;
  };
}
