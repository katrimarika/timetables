import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import TimetableView from './TimetableView';
import 'styles/TimetablePage.scss';

interface Props {
  id: string;
  isStation?: boolean;
  isPinned: boolean;
  isStarred: boolean;
  togglePin(): void;
  toggleStar(): void;
}

const TimetablePage = ({
  id,
  isStation,
  isPinned,
  isStarred,
  togglePin,
  toggleStar,
}: Props) => {
  const starLabel = isStarred ? 'Poista tähti' : 'Lisää tähti';
  const pinLabel = isPinned ? 'Poista etusivulta' : 'Lisää etusivulle';

  const actionClass = (isActive: boolean) =>
    `icon-button action${isActive ? ' active' : ''}`;

  const buttons = (
    <>
      <div
        key={`star-${isStarred}`}
        tabIndex={0}
        className={actionClass(isStarred)}
        onClick={toggleStar}
        aria-label={starLabel}
        title={starLabel}
      >
        <FontAwesomeIcon icon="star" />
      </div>
      <div
        key={`pin-${isPinned}`}
        tabIndex={0}
        className={`pin ${actionClass(isPinned)}`}
        onClick={togglePin}
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
      <TimetableView id={id} isStation={isStation} buttons={buttons} />
    </div>
  );
};

export default TimetablePage;
