import './MineField.css';

import MineGrid from '../mineGrid';
import MineCell from './MineCell';

type MineFieldProps = {
  mines: MineGrid;
};

export default function MineField({ mines }: MineFieldProps) {
  const onClick = (r: number, c: number) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      const cell = mines.getCell(r, c);

      if (cell.isVisible && !cell.isBomb) {
        // Clicking a revealed non-bomb does nothing.
        e.preventDefault();
        return false;
      }

      if (e.type === 'contextmenu') {
        cell.toggleFlag();
      } else {
        cell.reveal();
      }

      e.currentTarget.innerText = cell.toString();
      e.preventDefault();
      return false;
    };
  };

  return (
    <table cellSpacing="0" cellPadding="0">
      <tbody>
        {mines.grid.map((row, r) => (
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
