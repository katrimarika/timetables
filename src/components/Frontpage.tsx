import React from 'react';
import { isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
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
      Aikataulut <span className="title-addition">HSL</span>
    </h1>
    <StopSearch />
    <div className="divider" />
    {!isEmpty(starredStops) && (
      <StarredStops starredStops={starredStops} removeStar={removeStar} />
    )}
    {!isEmpty(starredStops) && <div className="divider" />}
    <div className="timetables">
      {pinnedStops.map(stopId => (
        <StopView
          key={stopId}
          stopId={stopId}
          withLink={true}
          buttons={
            <div
              className="icon-button close"
              aria-label={`Poista pysäkki ${stopId}`}
              title="Poista pysäkki"
              tabIndex={0}
              onClick={() => removePin(stopId)}
              onKeyPress={() => removePin(stopId)}
            >
              <FontAwesomeIcon icon="times" />
            </div>
          }
        />
      ))}
    </div>
    {isEmpty(pinnedStops) && isEmpty(starredStops) && (
      <div className="loading">
        Ei tallennettuja pysäkkejä.
        <div className="loading small">
          Voit tallentaa pysäkin aikataulusivulta. Tähti näkyy tällä sivulla
          linkkinä aikataulusivulle. Voit myös kiinnittää koko aikataulun tälle
          sivulle.
        </div>
      </div>
    )}
    {(!isEmpty(pinnedStops) || !isEmpty(starredStops)) && (
      <Link
        to={routes.shareUrl(starredStops, pinnedStops)}
        className="small share-link"
      >
        <FontAwesomeIcon icon="external-link-alt" />
        <span>Jaettava osoite</span>
      </Link>
    )}
  </div>
);

export default Frontpage;
