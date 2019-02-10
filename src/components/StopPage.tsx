import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import StopView from './StopView';
import 'styles/StopPage.scss';

interface Props {
  stopId: string;
  isPinned: boolean;
  isStarred: boolean;
  togglePin(): void;
  toggleStar(): void;
}

const StopPage = ({
  stopId,
  isPinned,
  isStarred,
  togglePin,
  toggleStar,
}: Props) => {
  const starLabel = isStarred ? 'Poista tähti' : 'Lisää tähti';
  const pinLabel = isPinned ? 'Poista etusivulta' : 'Lisää etusivulle';

  const actionClass = (isActive: boolean) =>
    `action${isActive ? ' active' : ''}`;

  return (
    <div className="stop-page timetable-container">
      <Link
        to={routes.frontpage}
        className="back-button"
        aria-label="Sulje pysäkin aikataulu"
      >
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      <div>Pysäkki {stopId}</div>
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
      <StopView stopId={stopId} />
    </div>
  );
};

export default StopPage;
