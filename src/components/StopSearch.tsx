import React, { Component } from 'react';
import { debounce, isEmpty } from 'lodash';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import { fetchStops } from '../utils/fetch';
import 'styles/StopSearch.scss';

interface StopResult {
  gtfsId: string;
  name?: string;
  code?: string;
}

interface Props {}

interface State {
  value: string;
  results: StopResult[];
  loading: boolean;
}

class StopSearch extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: '',
      results: [],
      loading: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.queryStops = debounce(this.queryStops, 500);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    this.setState({ value });
    this.queryStops(value);
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Hide on-screen keyboard on enter
    const el = document.activeElement as HTMLElement;
    if (el && el.blur && typeof el.blur === 'function') {
      el.blur();
    }
    event.preventDefault();
    this.queryStops(this.state.value);
  }

  queryStops(name: string) {
    this.setState({ loading: true });
    fetchStops(name).then(json =>
      this.setState({ results: json.data.stops || [], loading: false })
    );
  }

  clearSearch() {
    this.setState({ value: '' });
  }

  render() {
    const { results, value } = this.state;

    const resultsList = results
      .filter(res => res.gtfsId)
      .map(res => (
        <NavLink
          key={res.gtfsId}
          className="search-result"
          to={routes.stop(res.gtfsId)}
        >
          <h4>{res.name || 'Pysäkki'}</h4>
          <div>
            <span>{res.code + ' ' || ''}</span>
            <span className="small">{res.gtfsId}</span>
          </div>
        </NavLink>
      ));

    return (
      <div className="stop-search">
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="inputStop" aria-label="Pysäkkihaku">
            Hae pysäkkiä
          </label>
          <input
            id="inputStop"
            type="text"
            value={value}
            onChange={this.handleChange}
            autoComplete="off"
            placeholder="Syötä pysäkin nimi tai tunnus"
          />
        </form>
        {value && (
          <div className="stop-search-results">
            <button
              type="button"
              className="close-button"
              aria-label="Sulje pysäkkihaku"
              onClick={this.clearSearch}
            >
              <FontAwesomeIcon icon="times" />
            </button>
            <h3>Valitse pysäkki</h3>
            <div className="list-group">
              {!isEmpty(resultsList) ? resultsList : <div>Ei hakutuloksia</div>}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default StopSearch;
