import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { without, includes, isEmpty } from 'lodash';
import {
  fetchTimetableView,
  Stop,
  Station,
  TimetableRow,
} from '../utils/fetch';
import { routes } from '../routes';
import LineSelect from './LineSelect';
import Timetable from './Timetable';
import 'styles/TimetableView.scss';

const REFRESH_INTERVAL = 20000;
const ROW_LIMIT = 35;
const ROW_COUNT = 7;

interface Props {
  id: string;
  isStation?: boolean;
  buttons?: JSX.Element;
  withLink?: boolean;
}

interface State {
  stop?: Stop;
  station?: Station;
  timetable: TimetableRow[];
  limit: number;
  visibleRows: TimetableRow[];
  hideShowMore: boolean;
  lines: string[];
  selectedLines: string[];
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
      selectedLines: [],
      loading: true,
    };
    this.toggleLine = this.toggleLine.bind(this);
    this.toggleAllLines = this.toggleAllLines.bind(this);
    this.showMore = this.showMore.bind(this);
  }

  refresher?: NodeJS.Timeout;

  componentDidMount() {
    const { id } = this.props;
    this.queryStop(id);
    this.startRefresher(id);
  }

  componentWillUnmount() {
    this.stopRefresher();
  }

  setVisibleRows(addCount = 0, newSelectedLines?: string[]) {
    const { timetable, selectedLines: oldSelected, lines } = this.state;
    const selectedLines = newSelectedLines || oldSelected;
    const filteredRows = timetable.filter(
      item => isEmpty(selectedLines) || includes(selectedLines, item.line)
    );
    const showAll =
      isEmpty(selectedLines) || selectedLines.length === lines.length;
    const rows = showAll ? timetable : filteredRows;
    const limit = Math.min(this.state.limit + addCount, ROW_LIMIT, rows.length);
    const visibleRows = rows.slice(0, limit);
    const hideShowMore = limit >= rows.length;
    this.setState({
      visibleRows,
      limit: Math.max(limit, ROW_COUNT),
      hideShowMore,
      selectedLines,
    });
  }

  startRefresher(id: string) {
    this.refresher = setInterval(
      this.queryStop.bind(this, id),
      REFRESH_INTERVAL
    );
  }

  stopRefresher() {
    if (this.refresher) {
      clearInterval(this.refresher);
      this.refresher = undefined;
    }
  }

  queryStop(id: string) {
    const { isStation } = this.props;
    if (id) {
      fetchTimetableView(id, ROW_LIMIT, isStation)
        .then(result => {
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
        .catch(err => this.setState({ loading: false }));
    }
  }

  toggleLine(line: string) {
    const { selectedLines } = this.state;
    const newSelection = includes(selectedLines, line)
      ? without(selectedLines, line)
      : [...selectedLines, line];
    this.setVisibleRows(0, newSelection);
  }

  toggleAllLines() {
    const { lines, selectedLines } = this.state;
    const newSelection = selectedLines.length === lines.length ? [] : lines;
    this.setVisibleRows(0, newSelection);
  }

  showMore() {
    this.setVisibleRows(ROW_COUNT);
  }

  render() {
    const { id, withLink, buttons, isStation } = this.props;
    const {
      stop,
      station,
      timetable,
      visibleRows,
      hideShowMore,
      lines,
      selectedLines,
      loading,
    } = this.state;

    if (loading) {
      return (
        <div className="timetable-view loading">
          Ladataan tietoja, id: {id}...
        </div>
      );
    } else if (!timetable) {
      return (
        <div className="timetable-view error-message">
          Virheellinen id: {id}
        </div>
      );
    }

    let headerDetails, linkTo;
    if (stop) {
      headerDetails = (
        <div className="timetable-details">
          <h2>{stop.name} </h2>
          <span className="small">{stop.code || stop.id}</span>
        </div>
      );
      linkTo = routes.stop(id);
    } else if (station) {
      headerDetails = (
        <div className="timetable-details">
          <h2>{station.name} </h2>
          <span className="small">{station.stops.length} laituria</span>
        </div>
      );
      linkTo = routes.station(id);
    }

    return (
      <div className="timetable-view">
        <div className="timetable-header">
          {withLink && linkTo ? (
            <Link to={linkTo}>{headerDetails}</Link>
          ) : (
            headerDetails
          )}
          <div className="buttons">{buttons}</div>
        </div>
        <LineSelect
          lines={lines}
          selectedLines={selectedLines}
          toggleLine={this.toggleLine}
          toggleAllLines={this.toggleAllLines}
        />
        <Timetable
          rows={visibleRows}
          withPlatform={isStation || !!station}
          hideShowMore={hideShowMore}
          showMore={this.showMore}
        />
        <div className="divider" />
      </div>
    );
  }
}

export default TimetableView;
