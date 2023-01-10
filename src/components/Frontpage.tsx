import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import isEmpty from 'lodash/isEmpty';
import { FC } from 'react';
import { useUiContext } from 'utils/uiContext';
import BikeStationView from './BikeStationView';
import { Divider } from './Divider';
import styles from './Frontpage.module.css';
import { IconButton } from './IconButton';
import Search from './Search';
import Starred from './Starred';
import TimetableView from './TimetableView';

const closeButton = (id: string, removePin: (id: string) => void) => (
  <IconButton
    icon="times"
    aria-label={`Poista kiinnitys ${id}`}
    title="Poista kiinnitys"
    onClick={() => removePin(id)}
  />
);

const Frontpage: FC = () => {
  const { pinned, starred, dispatch } = useUiContext();

  const removePin = (stopId: string) => dispatch({ type: 'removePin', stopId });
  const removeStar = (stopId: string) =>
    dispatch({ type: 'removeStar', stopId });

  return (
    <div className={styles.frontpage}>
      <h1 className={styles.title}>Aikataulut</h1>
      <Search />
      <Divider />
      {!isEmpty(starred) && (
        <Starred starred={starred} removeStar={removeStar} />
      )}
      {!isEmpty(starred) && <Divider />}
      <div className={styles.timetables}>
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
        <div className={styles.loading}>
          Ei tallennettuja pysäkkejä tai asemia.
          <small className={styles.loading}>
            Suosikit <FontAwesomeIcon icon="star" /> näkyvät etusivulla
            linkkeinä aikataulusivuille. Kiinnitys{' '}
            <FontAwesomeIcon icon="thumbtack" /> tuo koko aikataulunäkymän
            etusivulle. Tiedot tallentuvat selaimeen (local storage).
          </small>
        </div>
      )}
    </div>
  );
};

export default Frontpage;
