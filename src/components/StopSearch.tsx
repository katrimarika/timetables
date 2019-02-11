import React, { Component } from 'react';
import { debounce, isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { routes } from '../routes';
import { searchStops, Stop } from '../utils/fetch';
import 'styles/StopSearch.scss';

interface Props {}

interface State {
  value: string;
  results: Stop[];
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
    searchStops(name).then(stops =>
      this.setState({
        results: stops,
        loading: false,
      })
    );
  }

  clearSearch() {
    this.setState({ value: '' });
  }

  render() {
    const { results, value } = this.state;

    const resultsList = results
      .filter(res => !!res.id)
      .map(res => (
        <Link key={res.id} className="search-result" to={routes.stop(res.id)}>
          <span className="name">{res.name}</span>
          <span>{res.code}</span>
          <span className="small">{res.id}</span>
        </Link>
      ));

    return (
      <div className="stop-search">
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="inputStop" aria-label="Pysäkkihaku" className="small">
            Pysäkkihaku
          </label>
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
              placeholder="Hae pysäkkiä nimellä tai tunnuksella"
            />
          </div>
        </form>
        {value && (
          <div className="stop-search-results">
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
