import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce, isEmpty } from 'lodash';
import React, { FC, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import 'styles/Search.scss';
import { useUiContext } from 'utils/uiContext';
import { routes } from '../routes';
import { search } from '../utils/fetch';

const Search: FC = () => {
  const { searchString, searchResults, dispatch } = useUiContext();
  const [value, setValue] = useState(searchString);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useRef(
    debounce((v: string) => {
      dispatch({ type: 'startSearch', value: v });
      if (!!v) {
        search(v).then((results) => {
          dispatch({ type: 'setSearchResults', results });
          setLoading(false);
        });
      }
    }, 1000)
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Hide on-screen keyboard on enter
    const el = document.activeElement as HTMLElement;
    if (el && el.blur && typeof el.blur === 'function') {
      el.blur();
    }
    event.preventDefault();
  }

  function handleChange(v: string) {
    setValue(v);
    setLoading(true);
    debouncedSearch.current(v);
  }

  function closeSearch() {
    setValue('');
    setLoading(false);
    dispatch({ type: 'closeSearch' });
  }

  const { stops, stations } = searchResults;

  const stopResults = stops
    .filter((stop) => !!stop.id)
    .map((stop) => (
      <Link key={stop.id} className="search-result" to={routes.stop(stop.id)}>
        <span className="name">{stop.name}</span>
        <span>{stop.code}</span>
        <span className="small">{stop.id}</span>
      </Link>
    ));

  const stationResults = stations
    .filter((station) => !!station.id)
    .map((station) => (
      <Link
        key={station.id}
        className="search-result"
        to={routes.station(station.id)}
      >
        <span className="name">{station.name}</span>
        <span>{station.stops.length}&nbsp;laituria</span>
        <span className="small">{station.id}</span>
      </Link>
    ));

  return (
    <div className="search">
      <form onSubmit={handleSubmit}>
        <label htmlFor="inputStop">Asema- ja pysäkkihaku</label>
        <div className="search-input">
          <button type="submit">
            <FontAwesomeIcon icon="search" />
          </button>
          <input
            id="inputStop"
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
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
              onClick={closeSearch}
              onKeyPress={closeSearch}
            >
              <FontAwesomeIcon icon="times" />
            </div>
          </div>
          {loading && <div>Ladataan...</div>}
          {!loading && !isEmpty(stationResults) && (
            <>
              <h4 className="result-title">Asemat</h4>
              <div className="list-group">{stationResults}</div>
            </>
          )}
          {!loading && !isEmpty(stopResults) && (
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
};

export default Search;
