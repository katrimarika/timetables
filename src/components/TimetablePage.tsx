import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import TimetableView from './TimetableView';
import { RawDetail } from './App';
import 'styles/TimetablePage.scss';

interface Props {
  detail: RawDetail;
  isPinned: boolean;
  isStarred: boolean;
  togglePin(detail: RawDetail): void;
  toggleStar(detail: RawDetail): void;
}

const TimetablePage = ({
  detail,
  isPinned,
  isStarred,
  togglePin,
  toggleStar,
}: Props) => {
  const starLabel = isStarred ? 'Poista tähti' : 'Lisää tähti';
  const pinLabel = isPinned ? 'Poista etusivulta' : 'Lisää etusivulle';

  const actionClass = (isActive: boolean) =>
    `icon-button action${isActive ? ' active' : ''}`;

  const buttons = (detail: RawDetail) => (
    <>
      <div
        key={`star-${isStarred}`}
        tabIndex={0}
        className={actionClass(isStarred)}
        onClick={() => toggleStar(detail)}
        aria-label={starLabel}
        title={starLabel}
      >
        <FontAwesomeIcon icon="star" />
      </div>
      <div
        key={`pin-${isPinned}`}
        tabIndex={0}
        className={`pin ${actionClass(isPinned)}`}
        onClick={() => togglePin(detail)}
        aria-label={pinLabel}
        title={pinLabel}
      >
        <FontAwesomeIcon icon="thumbtack" />
      </div>
    </>
  );

  return (
    <div className="timetable-page">
      <Link to={routes.frontpage} className="back-button">
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      <TimetableView detail={detail} buttons={buttons} />
    </div>
  );
};

export default TimetablePage;
