import './App.css';

import MineField from './components/MineField';
import MineGrid from './mineGrid';
function App() {
  return (
    <>
      <MineField mines={MineGrid.build(9, 9, 10)}></MineField>
    </>
  );
}

export default App;
