import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { find } from 'lodash';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import 'styles/TimetablePage.scss';
import { RawDetail, useUiContext } from 'utils/uiContext';
import { routes } from '../routes';
import TimetableView from './TimetableView';

interface Props {
  stopId: string;
  isStation?: boolean;
  saveType?: 'star' | 'pin';
}

const TimetablePage = ({ stopId, isStation, saveType }: Props) => {
  const { starred, pinned, dispatch } = useUiContext();

  const starDetail = find(starred, (s) => s.id === stopId);
  const pinDetail = find(pinned, (s) => s.id === stopId);

  const savedDetail =
    saveType === 'star'
      ? starDetail
      : saveType === 'pin'
      ? pinDetail
      : undefined;

  const isStarred = !!starDetail;
  const isPinned = !!pinDetail;

  const actionClass = (isActive: boolean) =>
    `icon-button action${isActive ? ' active' : ''}`;

  const buttons = (detail: RawDetail) => (
    <Fragment>
      <div
        key={`star-${isStarred}`}
        tabIndex={0}
        className={actionClass(isStarred)}
        onClick={
          isStarred
            ? () => dispatch({ type: 'removeStar', stopId })
            : () => dispatch({ type: 'saveStar', detail })
        }
        title={isStarred ? 'Poista tähti' : 'Lisää tähti'}
      >
        <FontAwesomeIcon icon="star" />
      </div>
      <div
        key={`pin-${isPinned}`}
        tabIndex={0}
        className={`pin ${actionClass(isPinned)}`}
        onClick={
          isPinned
            ? () => dispatch({ type: 'removePin', stopId })
            : () => dispatch({ type: 'savePin', detail })
        }
        title={isPinned ? 'Poista etusivulta' : 'Lisää etusivulle'}
      >
        <FontAwesomeIcon icon="thumbtack" />
      </div>
    </Fragment>
  );

  return (
    <div className="timetable-page">
      <Link to={routes.frontpage} className="back-button">
        <FontAwesomeIcon icon="arrow-left" />
        <span>Etusivulle</span>
      </Link>
      <TimetableView
        detail={{ ...(savedDetail || { id: stopId }), isStation }}
        buttons={buttons}
      />
    </div>
  );
};

export default TimetablePage;
