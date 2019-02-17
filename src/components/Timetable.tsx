import React from 'react';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TimetableRow } from '../utils/fetch';
import 'styles/Timetable.scss';
import { routes } from '../routes';

interface Props {
  rows: TimetableRow[];
  withPlatform: boolean;
  hideShowMore: boolean;
  showMore(): void;
}

const refSecsToSecs = (refSecs: number) => {
  // The night buses use the start of the previous day as a reference
  const oneDay = 60 * 60 * 24;
  const secs = refSecs > oneDay ? refSecs - oneDay : refSecs;
  return secs;
};

const parseTime = (refSecs: number) => {
  if (!refSecs) {
    return '';
  }
  const secs = refSecsToSecs(refSecs);
  let hours = Math.floor(secs / (60 * 60));
  let minutes = Math.floor((secs - hours * 60 * 60) / 60);
  const twoDigit = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${twoDigit(hours)}:${twoDigit(minutes)}`;
};

const timeDiff = (refSecs: number) => {
  if (!refSecs) {
    return 0;
  }
  const dt = new Date();
  const nowSecs =
    dt.getSeconds() + 60 * dt.getMinutes() + 60 * 60 * dt.getHours();
  const secs = refSecsToSecs(refSecs);
  const diff = Math.floor((secs - nowSecs) / 60);
  return diff;
};

const Timetable = ({ rows, withPlatform, hideShowMore, showMore }: Props) => (
  <table className="timetable">
    <thead className="small">
      <tr>
        <th className="fit">Lähtee</th>
        <th className="fit">Min</th>
        <th className="fit" aria-label="Linja" title="Linja">
          <FontAwesomeIcon icon="bus" />
        </th>
        {withPlatform && (
          <th className="fit" aria-label="Laituri" title="Laituri">
            <FontAwesomeIcon icon="sign" />
          </th>
        )}
        <th>Määränpää</th>
      </tr>
    </thead>
    <tbody>
      {!isEmpty(rows) ? (
        rows.map(row => {
          const mins = timeDiff(row.realtimeDeparture);
          const gone = mins < 0;
          return (
            <tr
              key={row.line + '-' + row.scheduledDeparture}
              className={`data-row${gone ? ' gone' : ''}`}
            >
              <td className="time">
                <span>{parseTime(row.scheduledDeparture)}</span>
                <span className="realtime small">
                  {row.realtime &&
                    ' (' + parseTime(row.realtimeDeparture) + ')'}
                </span>
              </td>
              <td className="min">
                {gone ? '-' : mins}
                {!gone && <span className="small">{' min'}</span>}
              </td>
              <td className="line">{row.line}</td>
              {withPlatform && (
                <td className="platform">
                  {row.stop && (
                    <Link to={routes.stop(row.stop.id)}>
                      {row.stop.platform}
                    </Link>
                  )}
                </td>
              )}
              <td className="dest small">{row.destination}</td>
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
          <td colSpan={5}>
            <FontAwesomeIcon icon="chevron-down" />
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default Timetable;
