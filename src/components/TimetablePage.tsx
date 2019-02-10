import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import Timetable from './Timetable';

interface Props {
  stopId: string;
  isPinned: boolean;
  isStarred: boolean;
  togglePin(): void;
  toggleStar(): void;
}

const TimetablePage = ({
  stopId,
  isPinned,
  isStarred,
  togglePin,
  toggleStar,
}: Props) => {
  const starLabel = isStarred ? 'Poista tähti' : 'Aseta tähti';
  const pinLabel = isPinned ? 'Poista nostoista' : 'Lisää etusivulle';

  const actionClass = (isActive: boolean) =>
    `action${isActive ? ' active' : ''}`;

  return (
    <div className="timetable-page timetable-container">
      <NavLink
        to={routes.frontpage}
        className="close-button"
        aria-label="Sulje pysäkin aikataulu"
      >
        <FontAwesomeIcon icon="times" />
      </NavLink>
      <div className="actions">
        <div
          tabIndex={0}
          className={actionClass(isStarred)}
          onClick={toggleStar}
          aria-label={starLabel}
        >
          <FontAwesomeIcon icon="star" />
          <span>{starLabel}</span>
        </div>
        <div
          tabIndex={0}
          className={actionClass(isPinned)}
          onClick={togglePin}
          aria-label={pinLabel}
        >
          <FontAwesomeIcon icon="thumbtack" />
          <span>{pinLabel}</span>
        </div>
      </div>
      <Timetable stopId={stopId} />
    </div>
  );
};

export default TimetablePage;
