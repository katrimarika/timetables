import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { routes } from 'routes';
import { cx } from 'utils/classNames';
import { RawDetail, useUiContext } from 'utils/uiContext';
import BikeStationView from './BikeStationView';
import IconButton from './IconButton';
import styles from './TimetablePage.module.css';
import TimetableView from './TimetableView';

interface Props {
  stopId: string;
  isStation?: boolean;
  isBike?: boolean;
  saveType?: string;
}

const TimetablePage = ({ stopId, isStation, isBike, saveType }: Props) => {
  const { starred, pinned, dispatch } = useUiContext();

  const starDetail = starred.find((s) => s.id === stopId);
  const pinDetail = pinned.find((s) => s.id === stopId);

  const savedDetail =
    saveType === 'star'
      ? starDetail
      : saveType === 'pin'
      ? pinDetail
      : undefined;

  const isStarred = !!starDetail;
  const isPinned = !!pinDetail;

  const buttons = (detail: RawDetail) => (
    <Fragment>
      <IconButton
        key={`star-${isStarred}`}
        icon="star"
        className={cx(styles.action, isStarred && styles.active)}
        onClick={
          isStarred
            ? () => dispatch({ type: 'removeStar', stopId })
            : () => dispatch({ type: 'saveStar', detail })
        }
        title={isStarred ? 'Poista tähti' : 'Lisää tähti'}
      />
      <IconButton
        key={`pin-${isPinned}`}
        icon="thumbtack"
        className={cx(styles.pin, styles.action, isPinned && styles.active)}
        onClick={
          isPinned
            ? () => dispatch({ type: 'removePin', stopId })
            : () => dispatch({ type: 'savePin', detail })
        }
        title={isPinned ? 'Poista etusivulta' : 'Lisää etusivulle'}
      />
    </Fragment>
  );

  return (
    <div className={styles['timetable-page']}>
      <Link to={routes.frontpage} className={styles['back-button']}>
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      {isBike ? (
        <BikeStationView
          detail={{ ...(savedDetail || { id: stopId }), isBike: true }}
          buttons={buttons}
        />
      ) : (
        <TimetableView
          detail={{ ...(savedDetail || { id: stopId }), isStation }}
          buttons={buttons}
        />
      )}
    </div>
  );
};

export default TimetablePage;
