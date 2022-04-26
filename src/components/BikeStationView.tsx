import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { FC, useEffect, useRef, useState } from 'react';
import { routes } from 'routes';
import { BikeStationData, fetchBikeStationData } from 'utils/fetch';
import { RawDetail } from '../utils/uiContext';
import DetailsView from './DetailsView';
import 'styles/BikeStationView.scss';

// const REFRESH_INTERVAL = 60000;

type Props = {
  detail: RawDetail;
  buttons: (detail: RawDetail) => JSX.Element;
  withLink?: boolean;
};

const BikeDetail: FC<{
  icon: FontAwesomeIconProps['icon'];
  label: string;
  noData: boolean;
  count: number;
}> = ({ icon, label, noData, count }) => (
  <>
    <FontAwesomeIcon icon={icon} />
    <span className="bike-detail-label">{label} </span>
    <span
      className={`bike-detail-count ${
        count < 3 ? 'count-few' : count === 0 ? 'count-zero' : ''
      }`}
    >
      {noData ? '-' : count}
    </span>
  </>
);

const BikeStationView: FC<Props> = ({ detail, buttons, withLink }) => {
  const { id, name } = detail;
  const [bikeStationData, setBikeStationData] = useState<BikeStationData>();
  const [loading, setLoading] = useState(false);
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      setLoading(true);
      fetchBikeStationData(id)
        .then((d) => {
          setBikeStationData(d);
          setLoading(false);
          // TODO: start refresher
        })
        .catch();
    }
  }, [id]);

  return (
    <DetailsView
      id={detail.id}
      title={bikeStationData?.bikeStation.name || name}
      titleAddition={bikeStationData?.bikeStation.id || id}
      state={loading ? 'loading' : !bikeStationData ? 'error' : 'success'}
      buttons={buttons({
        ...detail,
        name: bikeStationData?.bikeStation.name || name,
      })}
      linkTo={withLink ? routes.bikeStation(id, 'pin') : undefined}
    >
      <div className="bike-details">
        <BikeDetail
          icon="bicycle"
          label="Pyöriä asemalla"
          noData={bikeStationData?.bikesAvailable === undefined}
          count={bikeStationData?.bikesAvailable || 0}
        />
        <BikeDetail
          icon="parking"
          label="Vapaita paikkoja"
          noData={bikeStationData?.spacesAvailable === undefined}
          count={bikeStationData?.spacesAvailable || 0}
        />
      </div>
    </DetailsView>
  );
};

export default BikeStationView;
