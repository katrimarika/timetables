import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import { fetchStops, Stops } from '../utils/fetch';
import 'styles/StarredStops.scss';

interface Props {
  starredStops: string[];
  removeStar(stopId: string): void;
}

const StarredStops = ({ starredStops, removeStar }: Props) => {
  const [stopsDetails, setStopsDetails] = useState({} as Stops);

  useEffect(() => {
    fetchStops(starredStops).then(stops => setStopsDetails(stops));
  }, [starredStops]); // Only re-run the effect if starredStops changes

  return (
    <div className="starred-stops">
      {starredStops.map(stopId => {
        const stopDetails = stopsDetails[stopId];
        return (
          <div className="starred-stop" key={stopId}>
            <Link className="name" to={routes.stop(stopId)}>
              <FontAwesomeIcon icon="star" />
              {stopDetails ? (
                <span className="stop-details">
                  <span className="stop-name">{stopDetails.name}</span>
                  <span>{stopDetails.code}</span>
                  <span className="small">{stopDetails.id || stopId}</span>
                </span>
              ) : (
                <span>{stopId}</span>
              )}
            </Link>
            <div
              className="icon-button"
              aria-label={`Poista pysäkki ${stopId}`}
              title="Poista pysäkki"
              tabIndex={0}
              onClick={() => removeStar(stopId)}
              onKeyPress={() => removeStar(stopId)}
            >
              <FontAwesomeIcon icon="trash-alt" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarredStops;
