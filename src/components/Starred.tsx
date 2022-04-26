import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'styles/Starred.scss';
import { routes } from '../routes';
import { fetchDetails, StopsStations } from '../utils/fetch';
import { RawDetail } from '../utils/uiContext';

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
    <div className="starred">
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
          middleText = bikeDetails?.id || id;
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
          <div className="starred-item" key={id}>
            <Link className="name" to={linkTo}>
              <FontAwesomeIcon icon="star" />
              <span className="star-details">
                <span className="star-name">{title}</span>
                <span>{middleText}</span>
                {!bikeGuess && <span className="small">{id}</span>}
              </span>
            </Link>
            <div
              className="icon-button"
              aria-label={`Poista tähti ${id}`}
              title="Poista tähti"
              tabIndex={0}
              onClick={() => removeStar(detail.id)}
              onKeyPress={() => removeStar(detail.id)}
            >
              <FontAwesomeIcon icon="trash-alt" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Starred;
