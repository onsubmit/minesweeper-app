import styles from './App.module.css';
import MineField from './components/MineField';
import MineGrid from './mineGrid';
function App() {
  return (
    <div className={styles.app}>
      <MineField
        mines={MineGrid.build({ rows: 20, columns: 10, numBombs: 10, minBombRow: 10 })}
      ></MineField>
    </div>
  );
}

export default App;
