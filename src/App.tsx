import { useMemo, useState } from 'react';

import styles from './App.module.css';
import MineField, { GravityState } from './components/MineField';
import LoopingTimer, { LoopingTimerState } from './loopingTimer';
import MineGrid from './mineGrid';

const TIMER_START_SECONDS = 10;

function App() {
  const timer = useMemo(() => new LoopingTimer(TIMER_START_SECONDS, onTimerTick), []);
  const [timerValue, setTimerValue] = useState(TIMER_START_SECONDS);
  const [gravityState, setGravityState] = useState<GravityState>({
    newRowCount: 0,
    rowDropCount: 0,
    newRowEvery: TIMER_START_SECONDS,
    rowDropEvery: 1,
  });

  const mines = useMemo(() => {
    const mineFieldInput = {
      rows: 20,
      columns: 10,
      numBombs: 20,
    };

    return MineGrid.build(mineFieldInput);
  }, []);

  function onTimerTick(state: LoopingTimerState): void {
    setTimerValue(state.value);

    setGravityState((s) => ({
      ...s,
      newRowCount: s.newRowCount + 1,
      rowDropCount: s.rowDropCount + 1,
    }));
  }

  return (
    <div className={styles.app}>
      <div className={styles.timer}>
        <span>New row in:</span>
        <span>{timerValue}</span>
      </div>
      <MineField
        mines={mines}
        gravityState={gravityState}
        onGameStart={() => timer.start()}
        onGameEnd={() => timer.stop()}
      ></MineField>
    </div>
  );
}

export default App;
