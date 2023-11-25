import { integerSchema, simpleParse } from './utils/zodUtils';

export type LoopingTimerState = { value: number; restarted: boolean };

export default class LoopingTimer {
  private readonly _seconds: number;
  private readonly _onTick: (state: LoopingTimerState) => void;
  private _state: LoopingTimerState;
  private _intervalId: ReturnType<typeof globalThis.setTimeout> | undefined;

  constructor(seconds: number, onTick: (state: LoopingTimerState) => void) {
    this._seconds = simpleParse(integerSchema.gt(0), seconds);
    this._onTick = onTick;
    this._state = { value: this._seconds, restarted: false };
  }

  start = () => {
    this._intervalId = setInterval(() => {
      const newValue = this._state.value === 1 ? this._seconds : this._state.value - 1;
      this._state.value = newValue;
      this._state.restarted = newValue === this._seconds;
      this._onTick(this._state);
    }, 1000);
  };

  stop = () => {
    clearTimeout(this._intervalId);
  };
}
