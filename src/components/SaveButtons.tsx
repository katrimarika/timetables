import { FC } from 'react';
import { cx } from '../utils/classNames';
import { RawDetail, useUiContext } from '../utils/uiContext';
import IconButton from './IconButton';
import styles from './SaveButtons.module.css';

type Props = {
  detail: RawDetail;
};

const SaveButtons: FC<Props> = ({ detail }) => {
  const stopId = detail.id;
  const { starred, pinned, dispatch } = useUiContext();

  const isStarred = starred.some((s) => s.id === stopId);
  const isPinned = pinned.some((s) => s.id === stopId);

  return (
    <>
      <IconButton
        key={`star-${isStarred}`}
        icon="star"
        className={cx(styles.action, isStarred && styles.active)}
        onClick={
          isStarred
            ? () => dispatch({ type: 'removeStar', stopId })
            : () => dispatch({ type: 'saveStar', detail })
        }
        title={isStarred ? 'Poista tähti' : 'Lisää tähti'}
      />
      <IconButton
        key={`pin-${isPinned}`}
        icon="thumbtack"
        className={cx(styles.pin, styles.action, isPinned && styles.active)}
        onClick={
          isPinned
            ? () => dispatch({ type: 'removePin', stopId })
            : () => dispatch({ type: 'savePin', detail })
        }
        title={isPinned ? 'Poista etusivulta' : 'Lisää etusivulle'}
      />
    </>
  );
};

export default SaveButtons;
