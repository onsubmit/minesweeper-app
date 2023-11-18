const BOMB_VALUE = -1;

export default class Cell {
  private readonly _value: number | null;

  private _isVisible: boolean;
  private _isFlagged: boolean;

  private constructor(value: number | null) {
    this._value = value;
    this._isVisible = false;
    this._isFlagged = false;
  }

  static createNonBombCell = (value: number) => new this(value);
  static createBombCell = () => new this(BOMB_VALUE);
  static createUnknownCell = () => new this(null);

  get hasValue(): boolean {
    return this._value !== null;
  }

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
      return '⬜';
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
