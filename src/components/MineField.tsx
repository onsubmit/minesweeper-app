import { useState } from 'react';

import Cell from '../cell';
import MineGrid from '../mineGrid';
import MineCell from './MineCell';
import styles from './MineField.module.css';

type MineFieldProps = {
  mines: MineGrid;
};

export default function MineField({ mines }: MineFieldProps) {
  const [isGameOver, setIsGameOver] = useState(false);
  const [grid, setGrid] = useState(mines.grid);

  const onClick = (row: number, column: number) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      const cell = mines.getCell({ row, column });
      const isNumberCell = cell.isVisible && !cell.isFlagged && !cell.isBomb;

      // TODO: Disallow losing on first click.

      let removeClearedRows = true;
      if (!isGameOver && !isNumberCell) {
        if (e.type === 'contextmenu') {
          cell.toggleFlag();
        } else {
          reveal(cell, { revealFlaggedCells: true });

          if (cell.isBomb) {
            removeClearedRows = false;
            setIsGameOver(true);
            mines.bombs.forEach((c) => reveal(c, { revealFlaggedCells: true }));
          }
        }

        if (removeClearedRows) {
          const numClearedRows = mines.removeClearedRows();

          // In newly added rows, reveal the zeros that border already visible zeros.
          if (numClearedRows > 0) {
            for (let column = 0; column < mines.columns; column++) {
              const cell = mines.getCell({ row: numClearedRows - 1, column });
              if (
                cell.value === 0 &&
                mines.getCellBorder(cell).some((c) => c.isVisible && c.value === 0)
              ) {
                reveal(cell, { revealFlaggedCells: true });
              }
            }
          }
        }

        setGrid((_) => mines.grid.map((row) => row.map((cell) => cell)));
      }

      e.preventDefault();
      return false;
    };
  };

  const reveal = (cell: Cell, options: { revealFlaggedCells: boolean }) => {
    if (cell.isVisible) {
      return;
    }

    if (cell.isFlagged && !options.revealFlaggedCells) {
      return;
    }

    cell.reveal();

    if (cell.value === 0) {
      mines.getCellBorder(cell).forEach((c) => reveal(c, { revealFlaggedCells: false }));
    }
  };

  return (
    <table className={styles.mineField} cellSpacing="0" cellPadding="0">
      <tbody>
        {grid.map((row, r) => (
          <tr id={`row_${r}`} key={r}>
            {row.map((cell, c) => (
              <td
                id={`cell_${r}-${c}`}
                key={`(${r},${c})`}
                onClick={onClick(r, c)}
                onContextMenu={onClick(r, c)}
                className={cell.isVisible ? styles.visible : undefined}
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
