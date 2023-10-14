import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../routes';
import { cx } from '../utils/classNames';
import { StopType, TimetableRow } from '../utils/fetch';
import { stopTypeToIcon } from '../utils/misc';
import styles from './Timetable.module.css';

type Props = {
  rows: TimetableRow[];
  stopType: StopType;
  withPlatform: boolean;
  hideShowMore: boolean;
  showMore(): void;
};

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

const parseTime = (refSecs: number) => {
  if (!refSecs) {
    return '';
  }
  // The night lines use the start of the previous day as a reference
  const secs =
    refSecs > ONE_DAY_IN_SECONDS ? refSecs - ONE_DAY_IN_SECONDS : refSecs;
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

  // The night lines use the start of the previous day as a reference
  // Special case: current time is before midnight, timetable time is after midnight
  const secs =
    refSecs > ONE_DAY_IN_SECONDS && nowSecs < ONE_DAY_IN_SECONDS / 2
      ? refSecs - ONE_DAY_IN_SECONDS
      : refSecs;

  const diff = Math.floor((secs - nowSecs) / 60);
  return diff;
};

const Timetable: FC<Props> = ({
  rows,
  stopType,
  withPlatform,
  hideShowMore,
  showMore,
}) => (
  <table className={styles.timetable}>
    <thead>
      <tr>
        <th className={styles.fit}>Lähtee</th>
        <th className={styles.fit}>Min</th>
        <th className={styles.fit} aria-label="Linja" title="Linja">
          <FontAwesomeIcon icon={stopTypeToIcon(stopType)} />
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
      {!!rows.length ? (
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
