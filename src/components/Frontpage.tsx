import React from 'react';
import { isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import Search from './Search';
import TimetableView from './TimetableView';
import Starred from './Starred';
import 'styles/Frontpage.scss';

interface Props {
  pinned: string[];
  starred: string[];
  removePin(id: string): void;
  removeStar(id: string): void;
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
      {pinned.map(id => (
        <TimetableView
          key={id}
          id={id}
          withLink={true}
          buttons={
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
          }
        />
      ))}
    </div>
    {isEmpty(pinned) && isEmpty(starred) && (
      <div className="loading">
        Ei tallennettuja pysäkkejä tai asemia.
        <div className="loading small">
          Voit tallentaa pysäkin tai aseman aikataulusivulta. Tähti näkyy tällä
          sivulla linkkinä aikataulusivulle. Voit myös kiinnittää koko
          aikataulun tälle sivulle.
        </div>
      </div>
    )}
    {(!isEmpty(pinned) || !isEmpty(starred)) && (
      <Link to={routes.shareUrl(starred, pinned)} className="small share-link">
        <FontAwesomeIcon icon="external-link-alt" />
        <span>Jaettava osoite</span>
      </Link>
    )}
  </div>
);

export default Frontpage;
