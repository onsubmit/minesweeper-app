import './App.css';

import MineField from './components/MineField';
import { MineField as MineFieldClass } from './mineField';
function App() {
  return (
    <>
      <MineField mineField={MineFieldClass.build(9, 9, 10)}></MineField>
    </>
  );
}

export default App;
