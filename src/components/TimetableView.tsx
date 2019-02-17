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
      selectedLines: [],
      selectedDirections: [],
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
    const { id } = this.props;
    this.queryTimetable(id);
    this.startRefresher(id);
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
      item =>
        (isEmpty(selectedLines) || includes(selectedLines, item.line)) &&
        (isEmpty(selectedDirections) ||
          includes(selectedDirections, item.direction))
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
    const newSelection = selectedLines.length === 0 ? lines : [];
    this.setVisibleRows(0, newSelection);
  }

  toggleDirection(direction: string) {
    const { selectedDirections } = this.state;
    const newSelection = includes(selectedDirections, direction)
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
    const { id, withLink, buttons, isStation } = this.props;
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

    if (loading) {
      return (
        <div className="timetable-view loading">
          Ladataan tietoja (id: {id})...
        </div>
      );
    } else if (!timetable) {
      return (
        <div className="timetable-view error-message">
          Tietoja ei saatu (id: {id}).
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
          <span className="small">{station.stops.length}&nbsp;laituria</span>
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
        <div className="divider" />
      </div>
    );
  }
}

export default TimetableView;
