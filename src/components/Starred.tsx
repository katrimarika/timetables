import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from 'routes';
import { fetchDetails, StopsStations } from 'utils/fetch';
import { RawDetail } from 'utils/uiContext';
import IconButton from './IconButton';
import styles from './Starred.module.css';

interface Props {
  starred: RawDetail[];
  removeStar(id: string): void;
}

const Starred = ({ starred, removeStar }: Props) => {
  const starredIds = starred.filter((s) => !s.name).map((s) => s.id);
  const [details, setDetails] = useState<StopsStations>({
    stops: {},
    stations: {},
    bikeStations: {},
  });

  useEffect(() => {
    fetchDetails(starredIds).then((result) => setDetails(result));
  }, [starredIds]); // Only re-run the effect if starred changes

  return (
    <div className={styles.starred}>
      {starred.map((detail) => {
        const {
          id,
          isBike: bikeGuess,
          isStation: stationGuess,
          name,
          code,
          platformCount,
        } = detail;
        const stopDetails = details.stops[id];
        const stationDetails = details.stations[id];
        const bikeDetails = details.bikeStations[id];
        let title, middleText, linkTo;
        if (bikeGuess || bikeDetails) {
          title = bikeDetails?.name || name;
          middleText = <FontAwesomeIcon icon="bicycle" />;
          linkTo = routes.bikeStation(id, 'star');
        } else if (stationGuess || stationDetails) {
          title = (stationDetails && stationDetails.name) || name;
          middleText = `${
            (stationDetails && stationDetails.stops.length) || platformCount
          }\u00a0laituria`;
          linkTo = routes.station(id, 'star');
        } else {
          title = (stopDetails && stopDetails.name) || name;
          middleText = (stopDetails && stopDetails.code) || code;
          linkTo = routes.stop(id, 'star');
        }
        return (
          <div className={styles['starred-item']} key={id}>
            <Link className={styles.name} to={linkTo}>
              <FontAwesomeIcon icon="star" />
              <span className={styles['star-details']}>
                <span className={styles['star-name']}>{title}</span>
                <span>{middleText}</span>
                <small>{id}</small>
              </span>
            </Link>
            <IconButton
              icon="trash-alt"
              aria-label={`Poista tähti ${id}`}
              title="Poista tähti"
              onClick={() => removeStar(detail.id)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Starred;
