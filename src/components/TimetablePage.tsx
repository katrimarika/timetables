import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { routes } from '../routes';
import { useUiContext } from '../utils/uiContext';
import BikeStationView from './BikeStationView';
import styles from './TimetablePage.module.css';
import TimetableView from './TimetableView';

type Props = {
  stopType: 'stop' | 'station' | 'bike';
};

const TimetablePage: FC<Props> = ({ stopType }) => {
  const { stopId, saveType } = useParams();
  const { starred, pinned } = useUiContext();

  // This should not happen due to routing rules
  if (!stopId) {
    return null;
  }

  const savedDetail =
    saveType === 'star'
      ? starred.find((s) => s.id === stopId)
      : saveType === 'pin'
        ? pinned.find((s) => s.id === stopId)
        : undefined;

  return (
    <div className={styles['timetable-page']}>
      <Link to={routes.frontpage} className={styles['back-button']}>
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      {stopType === 'bike' ? (
        <BikeStationView
          detail={{ ...(savedDetail || { id: stopId }), isBike: true }}
        />
      ) : (
        <TimetableView
          detail={{
            ...(savedDetail || { id: stopId }),
            isStation: stopType === 'station',
          }}
        />
      )}
    </div>
  );
};

export default TimetablePage;
