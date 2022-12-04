import { includes } from 'lodash';
import { cx } from 'utils/classNames';
import styles from './LineSelect.module.css';

interface Props {
  lines: string[];
  selectedLines: string[];
  allText?: string;
  toggleLine(line: string): void;
  toggleAllLines(): void;
}

const LineSelect = ({
  lines,
  selectedLines,
  allText,
  toggleLine,
  toggleAllLines,
}: Props) => (
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
        key={`${line}-${includes(selectedLines, line)}`}
        className={cx(
          styles['line-button'],
          includes(selectedLines, line) && styles.selected
        )}
        onClick={() => toggleLine(line)}
      >
        {line}
      </button>
    ))}
  </div>
);

export default LineSelect;
