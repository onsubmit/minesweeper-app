import styles from './App.module.css';
import MineField from './components/MineField';
import MineGrid from './mineGrid';
function App() {
  return (
    <div className={styles.app}>
      <MineField mines={MineGrid.build(9, 9, 10)}></MineField>
    </div>
  );
}

export default App;
