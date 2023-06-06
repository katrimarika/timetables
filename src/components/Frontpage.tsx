import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { useUiContext } from '../utils/uiContext';
import BikeStationView from './BikeStationView';
import Divider from './Divider';
import styles from './Frontpage.module.css';
import Search from './Search';
import Starred from './Starred';
import TimetableView from './TimetableView';

const Frontpage: FC = () => {
  const { pinned, starred, dispatch } = useUiContext();

  const removeStar = (stopId: string) =>
    dispatch({ type: 'removeStar', stopId });

  return (
    <div>
      <h1 className={styles.title}>Aikataulut</h1>
      <Search />
      <Divider />
      {!!starred.length && (
        <Starred starred={starred} removeStar={removeStar} />
      )}
      {!!starred.length && <Divider />}
      <div>
        {pinned.map((stop) =>
          stop.isBike ? (
            <BikeStationView key={stop.id} detail={stop} withLink />
          ) : (
            <TimetableView key={stop.id} detail={stop} withLink={true} />
          )
        )}
      </div>
      {!pinned.length && !starred.length && (
        <div className={styles.padding}>
          Ei tallennettuja pysäkkejä tai asemia.
          <small className={styles.padding}>
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
