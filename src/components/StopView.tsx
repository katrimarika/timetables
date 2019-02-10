import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { uniq, sortBy, without, includes, isEmpty } from 'lodash';
import { fetchTimetable } from '../utils/fetch';
import { routes } from '../routes';
import LineSelect from './LineSelect';
import Timetable, { TimetableRow } from './Timetable';
import 'styles/StopView.scss';

const REFRESH_INTERVAL = 20000;
const ROW_LIMIT = 35;
const ROW_COUNT = 7;

interface Stop {
  id?: string;
  name?: string;
  code?: string;
}

interface Props {
  stopId: string;
}

interface State {
  stop: Stop;
  timetable: TimetableRow[];
  limit: number;
  visibleRows: TimetableRow[];
  hideShowMore: boolean;
  lines: string[];
  selectedLines: string[];
  loading: boolean;
}

class StopView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { stopId } = props;
    this.state = {
      stop: stopId ? { id: stopId } : {},
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
    const { stopId } = this.props;
    this.queryStop(stopId);
    this.startRefresher(stopId);
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

  startRefresher(stopId: string) {
    this.refresher = setInterval(
      this.queryStop.bind(this, stopId),
      REFRESH_INTERVAL
    );
  }

  stopRefresher() {
    if (this.refresher) {
      clearInterval(this.refresher);
      this.refresher = undefined;
    }
  }

  queryStop(stopId: string) {
    if (stopId) {
      fetchTimetable(stopId, ROW_LIMIT)
        .then(json => {
          const result = json && json.data.stop;
          if (result) {
            this.setState({
              stop: { id: stopId, code: result.code, name: result.name },
              timetable: this.processTimeTable(
                result._stoptimesWithoutPatterns3xYh4D
              ),
              lines: this.processLines(result._stoptimesForServiceDateyplyP),
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

  processLines(data: any[]) {
    const lines = data.map(item => {
      return item.pattern.route.shortName;
    });
    const uniqueLines = uniq(lines);
    const sortedLines = sortBy(uniqueLines, [
      (line: string) => parseInt(line),
      (line: string) => line,
    ]);
    return sortedLines;
  }

  refSecsToSecs(refSecs: number) {
    // The night buses use the start of the previous day as a reference
    const oneDay = 60 * 60 * 24;
    const secs = refSecs > oneDay ? refSecs - oneDay : refSecs;
    return secs;
  }

  parseTime(refSecs: number) {
    const secs = this.refSecsToSecs(refSecs);
    let hours = Math.floor(secs / (60 * 60));
    let minutes = Math.floor((secs - hours * 60 * 60) / 60);
    const twoDigit = (n: number) => `${n < 10 ? '0' : ''}${n}`;
    return `${twoDigit(hours)}:${twoDigit(minutes)}`;
  }

  timeDiff(refSecs: number) {
    const dt = new Date();
    const nowSecs =
      dt.getSeconds() + 60 * dt.getMinutes() + 60 * 60 * dt.getHours();
    const secs = this.refSecsToSecs(refSecs);
    const diff = Math.floor((secs - nowSecs) / 60);
    return diff;
  }

  processTimeTable(data: any[]) {
    return data.map(item => {
      const time = this.parseTime(item.scheduledDeparture);
      const realTime = this.parseTime(item.realtimeDeparture);
      const min = this.timeDiff(item.realtimeDeparture);
      return {
        time: time,
        min: min,
        hasRealtime: item.realtime,
        realTime: realTime,
        line: item.trip.pattern.route.shortName,
        dest: item.stopHeadsign,
      };
    });
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
    const { stopId } = this.props;
    const {
      stop,
      timetable,
      visibleRows,
      hideShowMore,
      lines,
      selectedLines,
      loading,
    } = this.state;

    if (loading) {
      return (
        <div className="stop-view loading">
          Ladataan pysäkin {stopId} tietoja...
        </div>
      );
    } else if (!timetable) {
      return (
        <div className="stop-view error-message">
          Virheellinen pysäkki-id: {stopId}
        </div>
      );
    }

    return (
      <div className="stop-view">
        <Link to={routes.stop(stopId)} className="stop-details">
          <h2>{(stop.name || '') + ' '}</h2>
          <span className="small">{stop.code || stop.id}</span>
        </Link>
        <LineSelect
          lines={lines}
          selectedLines={selectedLines}
          toggleLine={this.toggleLine}
          toggleAllLines={this.toggleAllLines}
        />
        <Timetable
          rows={visibleRows}
          hideShowMore={hideShowMore}
          showMore={this.showMore}
        />
        <div className="divider" />
      </div>
    );
  }
}

export default StopView;
