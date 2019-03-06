import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import { fetchDetails, StopsStations } from '../utils/fetch';
import { RawDetail } from './App';
import 'styles/Starred.scss';

interface Props {
  starred: RawDetail[];
  removeStar(detail: RawDetail): void;
}

const Starred = ({ starred, removeStar }: Props) => {
  const starredIds = starred.filter(s => !s.name).map(s => s.id);
  const [details, setDetails] = useState({
    stops: {},
    stations: {},
  } as StopsStations);

  useEffect(() => {
    fetchDetails(starredIds).then(result => setDetails(result));
  }, [starredIds]); // Only re-run the effect if starred changes

  return (
    <div className="starred">
      {starred.map(detail => {
        const {
          id,
          isStation: stationGuess,
          name,
          code,
          platformCount,
        } = detail;
        const stopDetails = details.stops[id];
        const stationDetails = details.stations[id];
        let title, middleText, linkTo;
        if (stationGuess || stationDetails) {
          title = (stationDetails && stationDetails.name) || name;
          middleText = `${(stationDetails && stationDetails.stops.length) ||
            platformCount}\u00a0laituria`;
          linkTo = routes.station(id);
        } else {
          title = (stopDetails && stopDetails.name) || name;
          middleText = (stopDetails && stopDetails.code) || code;
          linkTo = routes.stop(id);
        }
        return (
          <div className="starred-item" key={id}>
            <Link
              className="name"
              to={{ pathname: linkTo, state: { fromType: 'star' } }}
            >
              <FontAwesomeIcon icon="star" />
              <span className="star-details">
                <span className="star-name">{title}</span>
                <span>{middleText}</span>
                <span className="small">{id}</span>
              </span>
            </Link>
            <div
              className="icon-button"
              aria-label={`Poista tähti ${id}`}
              title="Poista tähti"
              tabIndex={0}
              onClick={() => removeStar(detail)}
              onKeyPress={() => removeStar(detail)}
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
