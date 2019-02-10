import React from 'react';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import StopSearch from './StopSearch';
import StopView from './StopView';
import 'styles/Frontpage.scss';

interface Props {
  pinnedStops: string[];
  starredStops: string[];
  removePin(stopId: string): void;
  removeStar(stopId: string): void;
}

const Frontpage = ({
  pinnedStops,
  starredStops,
  removePin,
  removeStar,
}: Props) => (
  <div className="frontpage">
    <h1 className="title">
      Pysäkkiaikataulut <span className="title-addition">HSL</span>
    </h1>
    <StopSearch />
    <div className="divider" />
    {!isEmpty(starredStops) && (
      <div className="starred-stops">
        {starredStops.map(stopId => (
          <div className="starred-stop" key={stopId}>
            <Link
              className="name"
              to={routes.stop(stopId)}
              aria-label={`Suosikki ${stopId}`}
            >
              <FontAwesomeIcon icon="star" />
              <span>{stopId}</span>
            </Link>
            <div
              className="close-button"
              aria-label={`Poista suosikki ${stopId}`}
              tabIndex={0}
              onClick={() => removeStar(stopId)}
              onKeyPress={() => removeStar(stopId)}
            >
              <FontAwesomeIcon icon="trash-alt" />
            </div>
          </div>
        ))}
      </div>
    )}
    {!isEmpty(starredStops) && <div className="divider" />}
    <div className="timetables">
      {pinnedStops.map(stopId => (
        <div key={stopId} className="timetable-container">
          <div
            className="close-button"
            aria-label={`Poista pysäkki ${stopId}`}
            tabIndex={0}
            onClick={() => removePin(stopId)}
            onKeyPress={() => removePin(stopId)}
          >
            <FontAwesomeIcon icon="times" />
          </div>
          <StopView stopId={stopId} />
        </div>
      ))}
    </div>
    {isEmpty(pinnedStops) && isEmpty(starredStops) && (
      <div className="loading">
        Ei pysäkkejä. Voit lisätä aikataulun aikataulusivulta.
      </div>
    )}
  </div>
);

export default Frontpage;
