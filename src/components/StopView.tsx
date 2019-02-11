import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { without, includes, isEmpty } from 'lodash';
import { fetchStopView, Stop, TimetableRow } from '../utils/fetch';
import { routes } from '../routes';
import LineSelect from './LineSelect';
import Timetable from './Timetable';
import 'styles/StopView.scss';

const REFRESH_INTERVAL = 20000;
const ROW_LIMIT = 35;
const ROW_COUNT = 7;

interface Props {
  stopId: string;
  buttons?: JSX.Element;
  withLink?: boolean;
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
      stop: { id: stopId, name: '', code: '' },
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
      fetchStopView(stopId, ROW_LIMIT)
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
    const { stopId, withLink, buttons } = this.props;
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

    const stopDetails = (
      <div className="stop-details">
        <h2>{stop.name} </h2>
        <span className="small">{stop.code || stop.id}</span>
      </div>
    );

    return (
      <div className="stop-view">
        <div className="stop-header">
          {withLink ? (
            <Link to={routes.stop(stopId)}>{stopDetails}</Link>
          ) : (
            stopDetails
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
          hideShowMore={hideShowMore}
          showMore={this.showMore}
        />
        <div className="divider" />
      </div>
    );
  }
}

export default StopView;
