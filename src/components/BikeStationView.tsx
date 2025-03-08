import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { FC, useEffect, useRef, useState } from 'react';
import { routes } from '../routes';
import { cx } from '../utils/classNames';
import { BikeStationData, fetchBikeStationData } from '../utils/fetch';
import { RawDetail } from '../utils/uiContext';
import styles from './BikeStationView.module.css';
import DetailsView from './DetailsView';

const REFRESH_INTERVAL = 60000;

type Props = {
  detail: RawDetail;
  withLink?: boolean;
};

const BikeDetail: FC<{
  icon: FontAwesomeIconProps['icon'];
  label: string;
  noData: boolean;
  count: number;
  allowed?: boolean;
}> = ({ icon, label, noData, count, allowed }) => (
  <>
    <FontAwesomeIcon
      icon={icon}
      className={cx(!allowed && styles['not-allowed'])}
    />
    <span
      className={cx(
        styles['bike-detail-label'],
        !allowed && styles['not-allowed']
      )}
    >
      {label}{' '}
    </span>
    <span
      className={cx(
        styles['bike-detail-count'],
        !allowed ? styles['not-allowed'] : count < 3 && styles['count-few']
      )}
    >
      {noData ? '-' : count}
    </span>
  </>
);

const BikeStationView: FC<Props> = ({ detail, withLink }) => {
  const { id, name } = detail;
  const [bikeStationData, setBikeStationData] = useState<BikeStationData>();
  const [loading, setLoading] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      setLoading(true);
      let timeout: NodeJS.Timeout;
      fetchBikeStationData(id)
        .then((d) => {
          setBikeStationData(d);
          setLoading(false);
          timeout = setTimeout(
            () => fetchBikeStationData(id).then(setBikeStationData).catch(),
            REFRESH_INTERVAL
          );
        })
        .catch();
      return () => clearInterval(timeout);
    }
  }, [id]);

  return (
    <DetailsView
      id={detail.id}
      title={bikeStationData?.bikeStation.name || name}
      titleAddition={bikeStationData?.bikeStation.id || id}
      state={loading ? 'loading' : !bikeStationData ? 'error' : 'success'}
      detailForSaving={{
        ...detail,
        name: bikeStationData?.bikeStation.name || name,
      }}
      linkTo={withLink ? routes.bikeStation(id, 'pin') : undefined}
    >
      {bikeStationData && !bikeStationData?.operative && (
        <div className={styles['closed']}>Ei käytössä</div>
      )}
      <div className={styles['bike-details']}>
        <BikeDetail
          icon="bicycle"
          label="Pyöriä asemalla"
          noData={bikeStationData?.bikesAvailable === undefined}
          count={bikeStationData?.bikesAvailable || 0}
          allowed={bikeStationData?.allowPickup}
        />
        <BikeDetail
          icon="parking"
          label="Vapaita paikkoja"
          noData={bikeStationData?.spacesAvailable === undefined}
          count={bikeStationData?.spacesAvailable || 0}
          allowed={bikeStationData?.allowDropoff}
        />
      </div>
    </DetailsView>
  );
};

export default BikeStationView;
