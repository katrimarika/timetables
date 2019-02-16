import React, { Component } from 'react';
import { debounce, isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import { search, Stop, Station } from '../utils/fetch';
import 'styles/Search.scss';

interface Props {}

interface State {
  value: string;
  stops: Stop[];
  stations: Station[];
  loading: boolean;
}

class Search extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: '',
      stops: [],
      stations: [],
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.querySearch = debounce(this.querySearch, 1000);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    this.setState({ value, loading: true });
    this.querySearch(value);
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Hide on-screen keyboard on enter
    const el = document.activeElement as HTMLElement;
    if (el && el.blur && typeof el.blur === 'function') {
      el.blur();
    }
    event.preventDefault();
    this.setState({ loading: true });
    this.querySearch(this.state.value);
  }

  querySearch(name: string) {
    search(name).then(result =>
      this.setState({
        ...result,
        loading: false,
      })
    );
  }

  clearSearch() {
    this.setState({ value: '' });
  }

  render() {
    const { stops, stations, value, loading } = this.state;

    const stopResults = stops
      .filter(stop => !!stop.id)
      .map(stop => (
        <Link key={stop.id} className="search-result" to={routes.stop(stop.id)}>
          <span className="name">{stop.name}</span>
          <span>{stop.code}</span>
          <span className="small">{stop.id}</span>
        </Link>
      ));

    const stationResults = stations
      .filter(station => !!station.id)
      .map(station => (
        <Link
          key={station.id}
          className="search-result"
          to={routes.station(station.id)}
        >
          <span className="name">{station.name}</span>
          <span>{station.stops.length} laituria</span>
          <span className="small">{station.id}</span>
        </Link>
      ));

    return (
      <div className="search">
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="inputStop">Asema- ja pysäkkihaku</label>
          <div className="search-input">
            <button type="submit">
              <FontAwesomeIcon icon="search" />
            </button>
            <input
              id="inputStop"
              type="text"
              value={value}
              onChange={this.handleChange}
              autoComplete="off"
              placeholder="Hae nimellä tai koodilla"
            />
          </div>
        </form>
        {value && (
          <div className="search-results">
            <div className="results-header">
              <h3>Tulokset</h3>
              <div
                className="icon-button close"
                tabIndex={0}
                aria-label="Sulje pysäkkihaku"
                title="Sulje pysäkkihaku"
                onClick={this.clearSearch}
                onKeyPress={this.clearSearch}
              >
                <FontAwesomeIcon icon="times" />
              </div>
            </div>
            {loading && <div>Ladataan...</div>}
            {!isEmpty(stationResults) && (
              <>
                <h4 className="result-title">Asemat</h4>
                <div className="list-group">{stationResults}</div>
              </>
            )}
            {!isEmpty(stopResults) && (
              <>
                <h4 className="result-title">Pysäkit</h4>
                <div className="list-group">{stopResults}</div>
              </>
            )}
            {!loading && isEmpty(stopResults) && isEmpty(stationResults) && (
              <div>Ei hakutuloksia</div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Search;
