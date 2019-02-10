import React from 'react';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'styles/Timetable.scss';

export interface TimetableRow {
  line: string;
  min: number;
  hasRealtime: boolean;
  realTime: string;
  time: string;
  dest: string;
}

interface Props {
  rows: TimetableRow[];
  hideShowMore: boolean;
  showMore(): void;
}

const Timetable = ({ rows, hideShowMore, showMore }: Props) => (
  <table className="timetable">
    <thead className="small">
      <tr>
        <th className="fit">Lähtee</th>
        <th className="fit">Min</th>
        <th className="fit">
          <FontAwesomeIcon icon="bus" />
        </th>
        <th>Määränpää</th>
      </tr>
    </thead>
    <tbody>
      {!isEmpty(rows) ? (
        rows.map(row => {
          const mins = row.min;
          const gone = mins < 0;
          const realTime = row.hasRealtime ? ' (' + row.realTime + ')' : null;
          const minSpan = <span className="small">{' min'}</span>;
          const rowClass = 'data-row ' + (gone ? 'gone' : '');
          return (
            <tr key={row.line + '-' + row.time} className={rowClass}>
              <td className="time">
                <span>{row.time}</span>
                <span className="realtime small">{realTime}</span>
              </td>
              <td className="min">
                {gone ? '-' : mins}
                {gone ? null : minSpan}
              </td>
              <td className="line">{row.line}</td>
              <td className="dest small">{row.dest || ''}</td>
            </tr>
          );
        })
      ) : (
        <tr className="no-rows small">
          <td colSpan={4}>
            Ei näytettäviä aikoja seuraavaan tuntiin. Valitse jokin toinen linja
            tai pysäkki.
          </td>
        </tr>
      )}
      {!hideShowMore && (
        <tr
          className="show-more small"
          onClick={showMore}
          onKeyPress={showMore}
          tabIndex={0}
        >
          <td colSpan={4}>
            <FontAwesomeIcon icon="chevron-down" />
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default Timetable;
