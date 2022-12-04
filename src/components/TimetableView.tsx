import isEmpty from 'lodash/isEmpty';
import without from 'lodash/without';
import { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { routes } from 'routes';
import { fetchTimetableView, Station, Stop, TimetableRow } from 'utils/fetch';
import { RawDetail } from 'utils/uiContext';
import DetailsView from './DetailsView';
import LineSelect from './LineSelect';
import Timetable from './Timetable';

const REFRESH_INTERVAL = 20000;
const ROW_LIMIT = 35;
const ROW_COUNT = 7;

interface IncomingProps {
  detail: RawDetail;
  buttons(detail: RawDetail): JSX.Element;
  withLink?: boolean;
}

type Props = IncomingProps & RouteComponentProps<void>;

interface State {
  stop?: Stop;
  station?: Station;
  timetable: TimetableRow[];
  limit: number;
  visibleRows: TimetableRow[];
  hideShowMore: boolean;
  lines: string[];
  selectedLines: string[];
  directions?: string[];
  selectedDirections: string[];
  loading: boolean;
}

class TimetableView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      timetable: [],
      limit: ROW_COUNT,
      visibleRows: [],
      hideShowMore: true,
      lines: [],
      selectedLines: props.detail.lines || [],
      selectedDirections: props.detail.directions || [],
      loading: true,
    };
    this.toggleLine = this.toggleLine.bind(this);
    this.toggleAllLines = this.toggleAllLines.bind(this);
    this.toggleDirection = this.toggleDirection.bind(this);
    this.toggleAllDirections = this.toggleAllDirections.bind(this);
    this.showMore = this.showMore.bind(this);
  }

  refresher?: NodeJS.Timeout;

  componentDidMount() {
    const { detail } = this.props;
    this.queryTimetable(detail.id);
    this.startRefresher(detail.id);
  }

  componentWillUnmount() {
    this.stopRefresher();
  }

  setVisibleRows(addCount = 0, newLines?: string[], newDirections?: string[]) {
    const {
      timetable,
      selectedLines: oldLines,
      selectedDirections: oldDirections,
    } = this.state;
    const selectedLines = newLines || oldLines;
    const selectedDirections = newDirections || oldDirections;
    const rows = timetable.filter(
      (item) =>
        (isEmpty(selectedLines) || selectedLines.includes(item.line)) &&
        (isEmpty(selectedDirections) ||
          (item.direction && selectedDirections.includes(item.direction)))
    );
    const limit = Math.min(this.state.limit + addCount, ROW_LIMIT, rows.length);
    const visibleRows = rows.slice(0, limit);
    const hideShowMore = limit >= rows.length;
    this.setState({
      visibleRows,
      limit: Math.max(limit, ROW_COUNT),
      hideShowMore,
      selectedLines,
      selectedDirections,
    });
  }

  startRefresher(id: string) {
    this.refresher = setInterval(
      this.queryTimetable.bind(this, id),
      REFRESH_INTERVAL
    );
  }

  stopRefresher() {
    if (this.refresher) {
      clearInterval(this.refresher);
      this.refresher = undefined;
    }
  }

  queryTimetable(id: string) {
    const {
      detail: { isStation },
    } = this.props;
    if (id) {
      fetchTimetableView(id, ROW_LIMIT, isStation)
        .then((result) => {
          if (result) {
            this.setState({
              ...result,
              loading: false,
            });
            this.setVisibleRows();
          } else {
            this.setState({ loading: false });
          }
        })
        .catch((err) => this.setState({ loading: false }));
    }
  }

  toggleLine(line: string) {
    const { selectedLines } = this.state;
    const newSelection = selectedLines.includes(line)
      ? without(selectedLines, line)
      : [...selectedLines, line];
    this.setVisibleRows(0, newSelection);
  }

  toggleAllLines() {
    const { lines, selectedLines } = this.state;
    const newSelection = selectedLines.length === 0 ? lines : [];
    this.setVisibleRows(0, newSelection);
  }

  toggleDirection(direction: string) {
    const { selectedDirections } = this.state;
    const newSelection = selectedDirections.includes(direction)
      ? without(selectedDirections, direction)
      : [...selectedDirections, direction];
    this.setVisibleRows(0, undefined, newSelection);
  }

  toggleAllDirections() {
    const { directions, selectedDirections } = this.state;
    if (!directions) {
      return;
    }
    const newSelection = selectedDirections.length === 0 ? directions : [];
    this.setVisibleRows(0, undefined, newSelection);
  }

  showMore() {
    this.setVisibleRows(ROW_COUNT);
  }

  render() {
    const { detail, withLink, buttons } = this.props;
    const {
      stop,
      station,
      timetable,
      visibleRows,
      hideShowMore,
      lines,
      selectedLines,
      directions,
      selectedDirections,
      loading,
    } = this.state;
    const { id, name, code, isStation, platformCount } = detail;

    let linkTo, enhancedDetail;
    if (stop) {
      linkTo = routes.stop(id, 'pin');
      enhancedDetail = {
        id: stop.id || id,
        code: stop.code || code,
        name: stop.name || name,
        isStation: false,
        lines: selectedLines,
      };
    } else if (station) {
      linkTo = routes.station(id, 'pin');
      enhancedDetail = {
        id: station.id || id,
        name: station.name || name,
        isStation: true,
        lines: selectedLines,
        platformCount: station.stops.length || platformCount,
        directions: selectedDirections,
      };
    } else {
      enhancedDetail = detail;
    }

    return (
      <DetailsView
        id={id}
        title={enhancedDetail.name}
        titleAddition={
          enhancedDetail.isStation
            ? `${enhancedDetail.platformCount}\u00a0laituria`
            : enhancedDetail.code
        }
        state={loading ? 'loading' : !timetable ? 'error' : 'success'}
        buttons={buttons(enhancedDetail)}
        linkTo={withLink ? linkTo : undefined}
      >
        <LineSelect
          lines={lines}
          selectedLines={selectedLines}
          toggleLine={this.toggleLine}
          toggleAllLines={this.toggleAllLines}
        />
        {directions && (
          <LineSelect
            lines={directions}
            selectedLines={selectedDirections}
            allText="Kaikki suunnat"
            toggleLine={this.toggleDirection}
            toggleAllLines={this.toggleAllDirections}
          />
        )}
        <Timetable
          rows={visibleRows}
          withPlatform={isStation || !!station}
          hideShowMore={hideShowMore}
          showMore={this.showMore}
        />
      </DetailsView>
    );
  }
}

export default withRouter(TimetableView);
