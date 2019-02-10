import React, { Component } from 'react';
import { uniq, sortBy, remove } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchTimetable } from '../utils/fetch';
import 'styles/Timetable.scss';

const REFRESH_INTERVAL = 20000;
const ROW_LIMIT = 35;
const ROW_COUNT = 7;

interface Stop {
  id?: string;
  name?: string;
  code?: string;
}

interface TimeTableRow {
  line: string;
  min: number;
  hasRealtime: boolean;
  realTime: string;
  time: string;
  dest: string;
}

interface Props {
  stopId: string;
}

interface State {
  stop: Stop;
  timetable: TimeTableRow[];
  limit: number;
  visibleRows: TimeTableRow[];
  hideShowMore: boolean;
  lines: string[];
  selectedLines: string[];
  loading: boolean;
}

class Timetable extends Component<Props, State> {
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
    this.toggleLines = this.toggleLines.bind(this);
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
    const { timetable, selectedLines: oldSelected } = this.state;
    const selectedLines = newSelectedLines || oldSelected;
    const filteredRows = timetable.filter(item => {
      return this.isSelected(item.line, selectedLines);
    });
    const showAll =
      this.isSelected('all', selectedLines) || selectedLines.length === 0;
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

  isSelected(line: string, selectedLines?: string[]) {
    const { selectedLines: oldSelected } = this.state;
    const lines = selectedLines || oldSelected;
    return lines.indexOf(line) !== -1;
  }

  allButtonSelected(selectedLines?: string[]) {
    const { selectedLines: oldSelected, lines: oldLines } = this.state;
    const lines = selectedLines || oldSelected;
    return lines.length === oldLines.length;
  }

  allSelected(selectedLines: string[]) {
    return (
      this.allButtonSelected(selectedLines) ||
      this.state.selectedLines.length === 0
    );
  }

  toggleLine(
    line: string,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) {
    const selectedLines = this.state.selectedLines.slice();
    if (this.isSelected(line, selectedLines)) {
      remove(selectedLines, l => l === line);
    } else {
      selectedLines.push(line);
    }
    this.setVisibleRows(0, selectedLines);
    event.currentTarget.blur();
  }

  toggleLines(
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) {
    const selectedLines = this.allButtonSelected() ? [] : this.state.lines;
    this.setVisibleRows(0, selectedLines);
    event.currentTarget.blur();
  }

  lineSelect() {
    const buttons = this.state.lines.map(line => {
      const selected = this.isSelected(line) ? ' selected' : '';
      return (
        <div
          key={line}
          tabIndex={0}
          className={`button line-button ${selected}`}
          onClick={this.toggleLine.bind(this, line)}
          onKeyPress={this.toggleLine.bind(this, line)}
        >
          {line}
        </div>
      );
    });
    const allSelected = this.allButtonSelected() ? ' selected' : '';
    const allButton = (
      <div
        key="all-lines"
        tabIndex={0}
        className={`button line-button ${allSelected}`}
        onClick={this.toggleLines}
        onKeyPress={this.toggleLines}
      >
        Kaikki linjat
      </div>
    );
    return (
      <div className="line-buttons">
        {allButton}
        {buttons}
      </div>
    );
  }

  showMore() {
    this.setVisibleRows(ROW_COUNT);
  }

  timetable() {
    const timetable = this.state.visibleRows;
    const rows = timetable.map(row => {
      const mins = row.min;
      const gone = mins < 0;
      const realTime = row.hasRealtime ? ' (' + row.realTime + ')' : null;
      const minSpan = <span className="small">{' min'}</span>;
      const rowClass = 'data-row ' + (gone ? 'gone' : '');
      return (
        <tr key={row.line + '-' + row.time} className={rowClass}>
          <td className="time">
            <span>{row.time}</span>
            <span className="realtime small">{realTime}</span>
          </td>
          <td className="min">
            {gone ? '-' : mins}
            {gone ? null : minSpan}
          </td>
          <td className="line">{row.line}</td>
          <td className="dest small">{row.dest || ''}</td>
        </tr>
      );
    });
    const noRows = (
      <tr className="no-rows small">
        <td colSpan={4}>
          Ei näytettäviä aikoja seuraavaan tuntiin. Valitse jokin toinen linja
          tai pysäkki.
        </td>
      </tr>
    );
    const showMoreRow = (
      <tr
        className="show-more small"
        onClick={this.showMore.bind(this)}
        tabIndex={0}
      >
        <td colSpan={4}>
          <FontAwesomeIcon icon="chevron-down" />
        </td>
      </tr>
    );
    const showMore = !this.state.hideShowMore ? showMoreRow : null;

    return (
      <table>
        <thead className="small">
          <tr>
            <th className="fit">Lähtee</th>
            <th className="fit">Min</th>
            <th className="fit">
              <FontAwesomeIcon icon="bus" />
            </th>
            <th>Määränpää</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows : noRows}
          {showMore}
        </tbody>
      </table>
    );
  }

  render() {
    const { stopId } = this.props;
    const { stop, timetable, loading } = this.state;

    if (loading) {
      return (
        <div className="timetable loading">
          Ladataan pysäkin {stopId} tietoja...
        </div>
      );
    } else if (!timetable) {
      return (
        <div className="timetable error-message">
          Virheellinen pysäkki-id: {stopId}
        </div>
      );
    }

    return (
      <div className="timetable">
        <div className="stop-details">
          <h2>{(stop.name || '') + ' '}</h2>
          <span className="small">{stop.code || stop.id}</span>
        </div>
        {this.lineSelect()}
        {this.timetable()}
        <div className="divider" />
      </div>
    );
  }
}

export default Timetable;
