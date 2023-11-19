import classNames from 'classnames';

import Cell from '../cell';
import styles from './MineCell.module.css';

type MineCellProps = {
  cell: Cell;
};

export default function MineCell({ cell }: MineCellProps) {
  const getClass = () => {
    if (!cell.isVisible || cell.isFlagged || cell.isBomb) {
      return;
    }

    switch (cell.value) {
      case 1:
        return styles.value_1;
      case 2:
        return styles.value_2;
      case 3:
        return styles.value_3;
      case 4:
        return styles.value_4;
      case 5:
        return styles.value_5;
      case 6:
        return styles.value_6;
      case 7:
        return styles.value_7;
      case 8:
        return styles.value_8;
    }
  };

  return <span className={classNames(styles.mineCell, getClass())}>{cell.toString()}</span>;
}
