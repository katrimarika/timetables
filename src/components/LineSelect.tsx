import { FC } from 'react';
import { cx } from '../utils/classNames';
import styles from './LineSelect.module.css';

type Props = {
  lines: string[];
  selectedLines: string[];
  allText?: string;
  toggleLine(line: string): void;
  toggleAllLines(): void;
};

const LineSelect: FC<Props> = ({
  lines,
  selectedLines,
  allText,
  toggleLine,
  toggleAllLines,
}) => (
  <div className={styles['line-buttons']}>
    <button
      key={`all-lines-${selectedLines.length}`}
      className={cx(
        styles['line-button'],
        selectedLines.length === 0 && styles.selected
      )}
      onClick={toggleAllLines}
    >
      {allText || 'Kaikki linjat'}
    </button>
    {lines.map((line) => (
      <button
        key={`${line}-${selectedLines.includes(line)}`}
        className={cx(
          styles['line-button'],
          selectedLines.includes(line) && styles.selected
        )}
        onClick={() => toggleLine(line)}
      >
        {line}
      </button>
    ))}
  </div>
);

export default LineSelect;
