import Cell from '../cell';

type MineCellProps = {
  cell: Cell;
};

export default function MineCell({ cell }: MineCellProps) {
  return <>{cell.toString()}</>;
}
