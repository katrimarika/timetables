import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import { fetchDetails, StopsStations } from '../utils/fetch';
import 'styles/Starred.scss';

interface Props {
  starred: string[];
  removeStar(id: string): void;
}

const Starred = ({ starred, removeStar }: Props) => {
  const [details, setDetails] = useState({
    stops: {},
    stations: {},
  } as StopsStations);

  useEffect(() => {
    fetchDetails(starred).then(result => setDetails(result));
  }, [starred]); // Only re-run the effect if starred changes

  return (
    <div className="starred">
      {starred.map(id => {
        const stopDetails = details.stops[id];
        const stationDetails = details.stations[id];
        const linkTo = stationDetails ? routes.station(id) : routes.stop(id);
        return (
          <div className="starred-item" key={id}>
            {stopDetails || stationDetails ? (
              <Link className="name" to={linkTo}>
                <FontAwesomeIcon icon="star" />
                {stationDetails ? (
                  <span className="star-details">
                    <span className="star-name">{stationDetails.name}</span>
                    <span>{stationDetails.stops.length}&nbsp;laituria</span>
                    <span className="small">{stationDetails.id || id}</span>
                  </span>
                ) : (
                  <span className="star-details">
                    <span className="star-name">{stopDetails.name}</span>
                    <span>{stopDetails.code}</span>
                    <span className="small">{stopDetails.id || id}</span>
                  </span>
                )}
              </Link>
            ) : (
              <div className="name">
                <FontAwesomeIcon icon="star" />
                <span>{id}</span>
              </div>
            )}
            <div
              className="icon-button"
              aria-label={`Poista tähti ${id}`}
              title="Poista tähti"
              tabIndex={0}
              onClick={() => removeStar(id)}
              onKeyPress={() => removeStar(id)}
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
