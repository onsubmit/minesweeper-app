import './MineField.css';

import { MineField as MineFieldClass } from '../mineField';

type MineFieldProps = {
  mineField: MineFieldClass;
};

export default function MineField({ mineField }: MineFieldProps) {
  const onClick = (r: number, c: number) => {
    return (e: React.MouseEvent<HTMLTableCellElement>) => {
      const cell = mineField.getCell(r, c);
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
        {mineField.grid.map((row, r) => (
          <tr id={`row_${r}`} key={r}>
            {row.map((cell, c) => (
              <td
                id={`cell_${r}-${c}`}
                key={`(${r},${c})`}
                onClick={onClick(r, c)}
                onContextMenu={onClick(r, c)}
              >
                {cell.toString()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
