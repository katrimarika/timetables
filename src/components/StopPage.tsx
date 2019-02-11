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
    `icon-button action${isActive ? ' active' : ''}`;

  return (
    <div className="stop-page">
      <Link to={routes.frontpage} className="back-button">
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      <StopView
        stopId={stopId}
        buttons={
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
        }
      />
    </div>
  );
};

export default StopPage;
