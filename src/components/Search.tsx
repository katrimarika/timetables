import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import React, { FC, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from 'routes';
import { fetchBikeStationList, search } from 'utils/fetch';
import { useUiContext } from 'utils/uiContext';
import IconButton from './IconButton';
import styles from './Search.module.css';

const Search: FC = () => {
  const { searchString, searchResults, bikeStations, dispatch } =
    useUiContext();
  const [value, setValue] = useState(searchString);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useRef(
    debounce(async (v: string) => {
      dispatch({ type: 'startSearch', value: v });
      if (!!v) {
        const results = await search(v);
        dispatch({ type: 'setSearchResults', results });

        if (!bikeStations.length) {
          const bikeStationList = await fetchBikeStationList();
          dispatch({ type: 'setBikeStations', bikeStations: bikeStationList });
        }
        setLoading(false);
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
      <Link
        key={stop.id}
        className={styles['search-result']}
        to={routes.stop(stop.id)}
      >
        <span className={styles.name}>{stop.name}</span>
        <span>{stop.code}</span>
        <small className={styles.light}>{stop.id}</small>
      </Link>
    ));

  const stationResults = stations
    .filter((station) => !!station.id)
    .map((station) => (
      <Link
        key={station.id}
        className={styles['search-result']}
        to={routes.station(station.id)}
      >
        <span className={styles.name}>{station.name}</span>
        <span>{station.stops.length}&nbsp;laituria</span>
        <small className={styles.light}>{station.id}</small>
      </Link>
    ));

  const matchingBikeStations = !!searchString
    ? bikeStations.filter(
        (b) =>
          !!b.id &&
          (!searchString ||
            b.id.includes(searchString) ||
            b.name.toLowerCase().includes(searchString))
      )
    : bikeStations;
  const bikeStationResults = matchingBikeStations.map((bikeStation) => (
    <Link
      key={bikeStation.id}
      className={styles['search-result']}
      to={routes.bikeStation(bikeStation.id)}
    >
      <span className={styles.name}>{bikeStation.name}</span>
      <span>{bikeStation.id}</span>
    </Link>
  ));

  return (
    <div className={styles.search}>
      <form onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="inputStop">
          Asema- ja pysäkkihaku
        </label>
        <div className={styles['search-input']}>
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
        <div className={styles['search-results']}>
          <div className={styles['results-header']}>
            <h3 className={styles.heading}>Tulokset</h3>
            <IconButton
              icon="times"
              aria-label="Sulje pysäkkihaku"
              title="Sulje pysäkkihaku"
              onClick={closeSearch}
            />
          </div>
          {loading && <div>Ladataan...</div>}
          {!loading && !isEmpty(stationResults) && (
            <>
              <h4 className={styles['result-title']}>Asemat</h4>
              <div className={styles['list-group']}>{stationResults}</div>
            </>
          )}
          {!loading && !isEmpty(stopResults) && (
            <>
              <h4 className={styles['result-title']}>Pysäkit</h4>
              <div className={styles['list-group']}>{stopResults}</div>
            </>
          )}
          {!loading && !isEmpty(bikeStationResults) && (
            <>
              <h4 className={styles['result-title']}>Pyöräasemat</h4>
              <div className={styles['list-group']}>{bikeStationResults}</div>
            </>
          )}
          {!loading &&
            isEmpty(stopResults) &&
            isEmpty(stationResults) &&
            isEmpty(bikeStationResults) && <div>Ei hakutuloksia</div>}
        </div>
      )}
    </div>
  );
};

export default Search;
