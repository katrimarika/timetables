import React from 'react';
import { isEmpty } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StopSearch from './StopSearch';
import StopView from './StopView';
import StarredStops from './StarredStops';
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
      <StarredStops starredStops={starredStops} removeStar={removeStar} />
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
