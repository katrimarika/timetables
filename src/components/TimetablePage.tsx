import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { routes } from '../routes';
import { cx } from '../utils/classNames';
import { RawDetail, useUiContext } from '../utils/uiContext';
import BikeStationView from './BikeStationView';
import IconButton from './IconButton';
import styles from './TimetablePage.module.css';
import TimetableView from './TimetableView';

type Props = {
  stopType: 'stop' | 'station' | 'bike';
};

const TimetablePage: FC<Props> = ({ stopType }) => {
  const { stopId, saveType } = useParams();
  const { starred, pinned, dispatch } = useUiContext();

  // This should not happen due to routing rules
  if (!stopId) {
    return null;
  }

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
    <>
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
    </>
  );

  return (
    <div className={styles['timetable-page']}>
      <Link to={routes.frontpage} className={styles['back-button']}>
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      {stopType === 'bike' ? (
        <BikeStationView
          detail={{ ...(savedDetail || { id: stopId }), isBike: true }}
          buttons={buttons}
        />
      ) : (
        <TimetableView
          detail={{
            ...(savedDetail || { id: stopId }),
            isStation: stopType === 'station',
          }}
          buttons={buttons}
        />
      )}
    </div>
  );
};

export default TimetablePage;
