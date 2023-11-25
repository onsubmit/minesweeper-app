import { useEffect, useMemo, useState } from 'react';

import styles from './App.module.css';
import MineField from './components/MineField';
import MineGrid from './mineGrid';
import useLoopingTimer from './useLoopingTimer';

const TIMER_START_SECONDS = 3;

function App() {
  const { timer, stopTimer } = useLoopingTimer({ seconds: TIMER_START_SECONDS });
  const [newRowCount, setNewRowCount] = useState(0);
  const mines = useMemo(() => {
    const mineFieldInput = {
      rows: 20,
      columns: 10,
      numBombs: 20,
    };

    return MineGrid.build(mineFieldInput);
  }, []);

  useEffect(() => {
    if (timer.restarted) {
      setNewRowCount((v) => v + 1);
    }
  }, [timer, stopTimer]);

  return (
    <div className={styles.app}>
      <div className={styles.timer}>
        <span>New row in:</span>
        <span>{timer?.seconds}</span>
      </div>
      <MineField mines={mines} newRowCount={newRowCount}></MineField>
    </div>
  );
}

export default App;
