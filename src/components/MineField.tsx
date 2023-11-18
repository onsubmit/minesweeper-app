import './MineField.css';

import { useState } from 'react';

//import { useImmer } from 'use-immer';
import Cell from '../cell';
import MineGrid from '../mineGrid';
import MineCell from './MineCell';

type MineFieldProps = {
  mines: MineGrid;
};

export default function MineField({ mines }: MineFieldProps) {
  const [grid, setGrid] = useState(mines.grid);

  const onClick = (row: number, column: number) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      const cell = mines.getCell({ row, column });

      if (cell.isVisible && !cell.isFlagged && !cell.isBomb) {
        // Clicking a revealed number does nothing.
        e.preventDefault();
        return false;
      }

      if (e.type === 'contextmenu') {
        cell.toggleFlag();
      } else {
        reveal(cell);
      }

      setGrid((v) => v.map((row) => row.map((cell) => cell)));
      e.preventDefault();
      return false;
    };
  };

  const reveal = (cell: Cell) => {
    if (cell.isVisible) {
      return;
    }

    cell.reveal();

    if (cell.value === 0) {
      mines.getCellBorder(cell).forEach(reveal);
    }
  };

  return (
    <table cellSpacing="0" cellPadding="0">
      <tbody>
        {grid.map((row, r) => (
          <tr id={`row_${r}`} key={r}>
            {row.map((cell, c) => (
              <td
                id={`cell_${r}-${c}`}
                key={`(${r},${c})`}
                onClick={onClick(r, c)}
                onContextMenu={onClick(r, c)}
              >
                <MineCell cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
