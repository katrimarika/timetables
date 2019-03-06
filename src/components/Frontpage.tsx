import React from 'react';
import { isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import Search from './Search';
import TimetableView from './TimetableView';
import Starred from './Starred';
import { RawDetail } from './App';
import 'styles/Frontpage.scss';

interface Props {
  pinned: RawDetail[];
  starred: RawDetail[];
  removePin(detail: RawDetail): void;
  removeStar(detail: RawDetail): void;
}

const Frontpage = ({ pinned, starred, removePin, removeStar }: Props) => (
  <div className="frontpage">
    <h1 className="title">
      Aikataulut <span className="title-addition">HSL</span>
    </h1>
    <Search />
    <div className="divider" />
    {!isEmpty(starred) && <Starred starred={starred} removeStar={removeStar} />}
    {!isEmpty(starred) && <div className="divider" />}
    <div className="timetables">
      {pinned.map(stop => (
        <TimetableView
          key={stop.id}
          detail={stop}
          withLink={true}
          buttons={(detail: RawDetail) => (
            <div
              className="icon-button close"
              aria-label={`Poista kiinnitys ${stop.id}`}
              title="Poista kiinnitys"
              tabIndex={0}
              onClick={() => removePin(stop)}
              onKeyPress={() => removePin(stop)}
            >
              <FontAwesomeIcon icon="times" />
            </div>
          )}
        />
      ))}
    </div>
    {isEmpty(pinned) && isEmpty(starred) && (
      <div className="loading">
        Ei tallennettuja pysäkkejä tai asemia.
        <div className="loading small">
          Suosikit <FontAwesomeIcon icon="star" /> näkyvät etusivulla linkkeinä
          aikataulusivuille. Kiinnitys <FontAwesomeIcon icon="thumbtack" /> tuo
          koko aikataulunäkymän etusivulle. Tiedot tallentuvat selaimeen (local
          storage).
        </div>
      </div>
    )}
    {(!isEmpty(pinned) || !isEmpty(starred)) && (
      <Link
        to={routes.shareUrl(starred.map(s => s.id), pinned.map(p => p.id))}
        className="small share-link"
      >
        <FontAwesomeIcon icon="external-link-alt" />
        <span>Jaettava osoite</span>
      </Link>
    )}
  </div>
);

export default Frontpage;
