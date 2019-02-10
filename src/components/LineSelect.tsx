import React from 'react';
import { includes } from 'lodash';
import 'styles/LineSelect.scss';

interface Props {
  lines: string[];
  selectedLines: string[];
  toggleLine(
    line: string,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ): void;
  toggleAllLines(
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ): void;
}

const LineSelect = ({
  lines,
  selectedLines,
  toggleLine,
  toggleAllLines,
}: Props) => (
  <div className="line-buttons">
    <div
      key="all-lines"
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
        key={line}
        tabIndex={0}
        className={`button line-button${
          includes(selectedLines, line) ? ' selected' : ''
        }`}
        onClick={e => toggleLine(line, e)}
        onKeyPress={e => toggleLine(line, e)}
      >
        {line}
      </div>
    ))}
  </div>
);

export default LineSelect;
