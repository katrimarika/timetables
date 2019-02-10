import React from 'react';
import { includes } from 'lodash';
import 'styles/LineSelect.scss';

interface Props {
  lines: string[];
  selectedLines: string[];
  toggleLine(line: string): void;
  toggleAllLines(): void;
}

const LineSelect = ({
  lines,
  selectedLines,
  toggleLine,
  toggleAllLines,
}: Props) => (
  <div className="line-buttons">
    <div
      key={`all-lines-${selectedLines.length === lines.length}`}
      tabIndex={0}
      className={`button line-button${
        selectedLines.length === lines.length ? ' selected' : ''
      }`}
      onClick={toggleAllLines}
      onKeyPress={toggleAllLines}
    >
      Kaikki linjat
    </div>
    {lines.map(line => (
      <div
        key={`${line}-${includes(selectedLines, line)}`}
        tabIndex={0}
        className={`button line-button${
          includes(selectedLines, line) ? ' selected' : ''
        }`}
        onClick={() => toggleLine(line)}
        onKeyPress={() => toggleLine(line)}
      >
        {line}
      </div>
    ))}
  </div>
);

export default LineSelect;
