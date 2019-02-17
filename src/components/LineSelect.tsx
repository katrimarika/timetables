import React from 'react';
import { includes } from 'lodash';
import 'styles/LineSelect.scss';

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
  <div className="line-buttons">
    <div
      key={`all-lines-${selectedLines.length}`}
      tabIndex={0}
      className={`button line-button${
        selectedLines.length === 0 ? ' selected' : ''
      }`}
      onClick={toggleAllLines}
      onKeyPress={toggleAllLines}
    >
      {allText || 'Kaikki linjat'}
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
