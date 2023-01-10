import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { routes } from 'routes';
import { cx } from 'utils/classNames';
import { TimetableRow } from 'utils/fetch';
import styles from './Timetable.module.css';

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
  <table className={styles.timetable}>
    <thead>
      <tr>
        <th className={styles.fit}>Lähtee</th>
        <th className={styles.fit}>Min</th>
        <th className={styles.fit} aria-label="Linja" title="Linja">
          <FontAwesomeIcon icon="bus" />
        </th>
        {withPlatform && (
          <th className={styles.fit} aria-label="Laituri" title="Laituri">
            <FontAwesomeIcon icon="sign" />
          </th>
        )}
        <th>Määränpää</th>
      </tr>
    </thead>
    <tbody>
      {!isEmpty(rows) ? (
        rows.map((row) => {
          const mins = timeDiff(row.realtimeDeparture);
          const gone = mins < 0;
          return (
            <tr
              key={`${row.line}-${row.scheduledDeparture}-${row.destination}`}
              className={cx(styles['data-row'], gone && styles.gone)}
            >
              <td className={styles.time}>
                <span>{parseTime(row.scheduledDeparture)}</span>
                <small className={styles.realtime}>
                  {row.realtime &&
                    ' (' + parseTime(row.realtimeDeparture) + ')'}
                </small>
              </td>
              <td className={styles.min}>
                {gone ? '-' : mins}
                {!gone && <small>{' min'}</small>}
              </td>
              <td className={styles.line}>{row.line}</td>
              {withPlatform && (
                <td className={styles.platform}>
                  {row.stop && (
                    <Link to={routes.stop(row.stop.id)}>
                      {row.stop.platform}
                    </Link>
                  )}
                </td>
              )}
              <td className={styles.dest}>
                <small>{row.destination}</small>
              </td>
            </tr>
          );
        })
      ) : (
        <tr className={styles['no-rows']}>
          <td colSpan={5}>
            <small>
              Ei näytettäviä aikoja seuraavaan tuntiin. Valitse jokin toinen
              linja tai pysäkki.
            </small>
          </td>
        </tr>
      )}
      {!hideShowMore && (
        <tr className={styles['show-more']}>
          <td colSpan={5}>
            <button className={styles['show-more-button']} onClick={showMore}>
              <small>
                <FontAwesomeIcon icon="chevron-down" />
              </small>
            </button>
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default Timetable;
