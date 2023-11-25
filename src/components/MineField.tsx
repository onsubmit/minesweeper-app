import classNames from 'classnames';
import { useEffect, useState } from 'react';

import MineGrid from '../mineGrid';
import MineCell from './MineCell';
import styles from './MineField.module.css';

export type GravityState = {
  newRowCount: number;
  rowDropCount: number;
  newRowEvery: number;
  rowDropEvery: number;
};

type MineFieldProps = {
  mines: MineGrid;
  gravityState: GravityState;
  onGameStart: () => void;
  onGameEnd: () => void;
};

type GameState = 'not-started' | 'started' | 'ended';

export default function MineField({ mines, gravityState, onGameStart, onGameEnd }: MineFieldProps) {
  const [gameState, setGameState] = useState<GameState>('not-started');
  const [grid, setGrid] = useState(mines.grid);

  useEffect(() => {
    if (
      gravityState.rowDropCount > 0 &&
      gravityState.rowDropCount % gravityState.rowDropEvery === 0
    ) {
      const lockedRows = mines.grid.reduce<number[]>(
        (acc, row, rowIndex) => (row.every((cell) => cell.isLocked) ? [...acc, rowIndex] : acc),
        []
      );

      for (const lockedRow of lockedRows) {
        mines.tryDropLockedRow(lockedRow);
      }
    }

    if (
      gravityState.newRowCount > 0 &&
      gravityState.newRowCount % gravityState.newRowEvery === 0 &&
      !mines.tryAddNewRow()
    ) {
      endGame();
    }

    setGrid((_) => mines.grid.map((row) => row.map((cell) => cell)));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only react when newRowCount updates
  }, [gravityState]);

  const onClick = (row: number, column: number) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      const cell = mines.getCell({ row, column });

      if (cell.isLocked) {
        e.preventDefault();
        return false;
      }

      const isFirstClick = gameState === 'not-started';
      if (isFirstClick) {
        onGameStart();
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

          mines.reveal(cell, { revealFlaggedCells: true });

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

  const endGame = () => {
    setGameState('ended');
    onGameEnd();
    mines.bombs.forEach((c) => mines.reveal(c, { revealFlaggedCells: true }));
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
                className={classNames({
                  [styles.visible!]: cell.isVisible,
                  [styles.locked!]: cell.isLocked,
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
