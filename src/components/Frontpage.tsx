import React from 'react';
import { NavLink } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import StopSearch from './StopSearch';
import Timetable from './Timetable';
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
    <h1 className="title">Pysäkkiaikataulut HSL</h1>
    <StopSearch />
    <h3 className="title">Suosikit</h3>
    <div className="starred-stops">
      {starredStops.map(stopId => (
        <div className="starred-stop" key={stopId}>
          <div
            className="close-button"
            aria-label={`Poista suosikki ${stopId}`}
            tabIndex={0}
            onClick={() => removeStar(stopId)}
            onKeyPress={() => removeStar(stopId)}
          >
            <FontAwesomeIcon icon="times" />
          </div>
          <NavLink className="name" to={routes.stop(stopId)}>
            {stopId}
          </NavLink>
        </div>
      ))}
    </div>
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
          <Timetable stopId={stopId} />
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
