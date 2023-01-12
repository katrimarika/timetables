import { FC, useEffect, useRef, useState } from 'react';
import { routes } from 'routes';
import { fetchTimetableView, StationData, StopData } from 'utils/fetch';
import { RawDetail } from 'utils/uiContext';
import DetailsView from './DetailsView';
import LineSelect from './LineSelect';
import Timetable from './Timetable';

const REFRESH_INTERVAL = 20000;
const ROW_LIMIT = 35;
const ROW_COUNT = 7;

type Props = {
  detail: RawDetail;
  buttons(detail: RawDetail): JSX.Element;
  withLink?: boolean;
};

const TimetableView: FC<Props> = ({ detail, withLink, buttons }) => {
  const [fetchedData, setFetchedData] = useState<
    | { status: 'success'; data: StopData | StationData }
    | { status: 'loading' }
    | { status: 'error' }
  >({ status: 'loading' });
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(ROW_COUNT);

  const { id, code, name, isStation, platformCount } = detail;
  const firstLoad = useRef(true);
  const refresher = useRef<NodeJS.Timeout | undefined>();
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      const performFetch = () =>
        fetchTimetableView(id, ROW_LIMIT, isStation)
          .then((result) => {
            if (result) {
              setFetchedData({ status: 'success', data: result });
              refresher.current = setTimeout(performFetch, REFRESH_INTERVAL);
            } else {
              setFetchedData({ status: 'error' });
            }
          })
          .catch(() => setFetchedData({ status: 'error' }));
      performFetch();
      return () => {
        if (refresher.current) {
          clearTimeout(refresher.current);
          refresher.current = undefined;
        }
      };
    }
  }, [id, isStation]);

  const data = fetchedData.status === 'success' ? fetchedData.data : undefined;
  const enhancedDetail = data
    ? 'station' in data
      ? {
          ...detail,
          id: data.station.id || id,
          name: data.station.name || name,
          stopType: data.station.stops.find((st) => !!st.stopType)?.stopType,
          isStation: true,
          lines: selectedLines,
          platformCount: data.station.stops.length || platformCount,
        }
      : {
          ...detail,
          id: data.stop.id || id,
          code: data.stop.code || code,
          name: data.stop.name || name,
          stopType: data.stop.stopType,
          isStation: false,
          lines: selectedLines,
        }
    : { ...detail, stopType: undefined };

  const lines = data?.lines || [];
  const timetable = data?.timetable || [];
  const rows = timetable.filter(
    (item) =>
      (!selectedLines.length || selectedLines.includes(item.line)) &&
      !item.arriving
  );
  const limit = Math.min(rowCount, ROW_LIMIT, rows.length);
  const visibleRows = rows.slice(0, limit);

  return (
    <DetailsView
      id={id}
      title={enhancedDetail.name}
      titleAddition={
        enhancedDetail.isStation
          ? `${enhancedDetail.platformCount}\u00a0laituria`
          : enhancedDetail.code
      }
      state={fetchedData.status}
      buttons={buttons(enhancedDetail)}
      linkTo={
        withLink
          ? data && 'station' in data
            ? routes.station(id, 'pin')
            : routes.stop(id, 'pin')
          : undefined
      }
    >
      <LineSelect
        lines={lines}
        selectedLines={selectedLines}
        toggleLine={(line) =>
          setSelectedLines((prevLines) =>
            prevLines.includes(line)
              ? prevLines.filter((l) => l !== line)
              : [...prevLines, line]
          )
        }
        toggleAllLines={() =>
          setSelectedLines((prevLines) => (prevLines.length === 0 ? lines : []))
        }
      />
      <Timetable
        rows={visibleRows}
        stopType={enhancedDetail?.stopType}
        withPlatform={isStation || (!!data && 'station' in data)}
        hideShowMore={visibleRows.length === rows.length}
        showMore={() => setRowCount(rowCount + ROW_COUNT)}
      />
    </DetailsView>
  );
};

export default TimetableView;
