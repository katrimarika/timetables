import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isEmpty } from 'lodash';
import React, { FC } from 'react';
import { useUiContext } from '../utils/uiContext';
import BikeStationView from './BikeStationView';
import Search from './Search';
import Starred from './Starred';
import TimetableView from './TimetableView';

const closeButton = (id: string, removePin: (id: string) => void) => (
  <div
    className="icon-button close"
    aria-label={`Poista kiinnitys ${id}`}
    title="Poista kiinnitys"
    tabIndex={0}
    onClick={() => removePin(id)}
    onKeyPress={() => removePin(id)}
  >
    <FontAwesomeIcon icon="times" />
  </div>
);

const Frontpage: FC = () => {
  const { pinned, starred, dispatch } = useUiContext();

  const removePin = (stopId: string) => dispatch({ type: 'removePin', stopId });
  const removeStar = (stopId: string) =>
    dispatch({ type: 'removeStar', stopId });

  return (
    <div className="frontpage">
      <h1 className="title">Aikataulut</h1>
      <Search />
      <div className="divider" />
      {!isEmpty(starred) && (
        <Starred starred={starred} removeStar={removeStar} />
      )}
      {!isEmpty(starred) && <div className="divider" />}
      <div className="timetables">
        {pinned.map((stop) =>
          stop.isBike ? (
            <BikeStationView
              key={stop.id}
              detail={stop}
              withLink
              buttons={() => closeButton(stop.id, removePin)}
            />
          ) : (
            <TimetableView
              key={stop.id}
              detail={stop}
              withLink={true}
              buttons={() => closeButton(stop.id, removePin)}
            />
          )
        )}
      </div>
      {isEmpty(pinned) && isEmpty(starred) && (
        <div className="loading">
          Ei tallennettuja pysäkkejä tai asemia.
          <div className="loading small">
            Suosikit <FontAwesomeIcon icon="star" /> näkyvät etusivulla
            linkkeinä aikataulusivuille. Kiinnitys{' '}
            <FontAwesomeIcon icon="thumbtack" /> tuo koko aikataulunäkymän
            etusivulle. Tiedot tallentuvat selaimeen (local storage).
          </div>
        </div>
      )}
    </div>
  );
};

export default Frontpage;
