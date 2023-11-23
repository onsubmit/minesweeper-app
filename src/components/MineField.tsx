import classNames from 'classnames';
import { useEffect, useState } from 'react';

import Cell from '../cell';
import MineGrid from '../mineGrid';
import MineCell from './MineCell';
import styles from './MineField.module.css';

type MineFieldProps = {
  mines: MineGrid;
  newRowCount: number;
};

type GameState = 'not-started' | 'started' | 'ended';

export default function MineField({ mines, newRowCount }: MineFieldProps) {
  const [gameState, setGameState] = useState<GameState>('not-started');
  const [grid, setGrid] = useState(mines.grid);

  useEffect(() => {
    if (!newRowCount) {
      return;
    }

    if (!mines.tryAddNewRow()) {
      endGame();
    }

    setGrid((_) => mines.grid.map((row) => row.map((cell) => cell)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only react when newRowCount updates
  }, [newRowCount]);

  const onClick = (row: number, column: number) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      const cell = mines.getCell({ row, column });

      if (cell.isReserved && cell.value === 0) {
        e.preventDefault();
        return false;
      }

      if (cell.isLocked) {
        e.preventDefault();
        return false;
      }

      const isFirstClick = gameState === 'not-started';
      if (isFirstClick) {
        setGameState('started');
      }

      const isNumberCell = cell.isVisible && !cell.isFlagged && !cell.isBomb;

      let removeClearedRows = true;
      if (gameState !== 'ended' && !isNumberCell) {
        if (e.type === 'contextmenu') {
          cell.toggleFlag();
        } else {
          if (gameState === 'not-started') {
            setGameState('started');
            if (isFirstClick && cell.isBomb) {
              mines.tryMoveBombCellElsewhere(cell);
            }
          }

          reveal(cell, { revealFlaggedCells: true });

          if (cell.isBomb) {
            removeClearedRows = false;
            endGame();
          }
        }

        if (removeClearedRows) {
          if (!mines.removeClearedRows()) {
            alert('game over');
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

  const endGame = () => {
    setGameState('ended');
    mines.bombs.forEach((c) => reveal(c, { revealFlaggedCells: true }));
  };

  return (
    <table className={styles.mineField} cellSpacing="0" cellPadding="0">
      <tbody>
        {grid.map((row, r) => (
          <tr
            id={`row_${r}`}
            key={r}
            className={classNames({ [styles.maxReservedRow]: r === mines.maxReservedRow - 1 })}
          >
            {row.map((cell, c) => (
              <td
                id={`cell_${r}-${c}`}
                key={`(${r},${c})`}
                onClick={onClick(r, c)}
                onContextMenu={onClick(r, c)}
                className={classNames({
                  [styles.visible!]: cell.isVisible,
                  [styles.locked!]: cell.isLocked,
                  [styles.reserved!]: cell.isReserved && (cell.value === 0 || cell.isVisible),
                })}
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
