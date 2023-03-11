import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash/debounce';
import React, { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../routes';
import { cx } from '../utils/classNames';
import { fetchBikeStationList, search } from '../utils/fetch';
import { stopTypeToIcon } from '../utils/misc';
import { useUiContext } from '../utils/uiContext';
import IconButton from './IconButton';
import styles from './Search.module.css';

const Search: FC = () => {
  const { searchString, searchResults, bikeStations, dispatch } =
    useUiContext();
  const [value, setValue] = useState(searchString);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((v: string) => {
        dispatch({ type: 'startSearch', value: v });
        if (!!v) {
          search(v)
            .then((results) => {
              dispatch({ type: 'setSearchResults', results });
              if (bikeStations.length) {
                setLoading(false);
              } else {
                fetchBikeStationList()
                  .then((bikeStationList) => {
                    dispatch({
                      type: 'setBikeStations',
                      bikeStations: bikeStationList,
                    });
                    setLoading(false);
                  })
                  .catch();
              }
            })
            .catch();
        }
      }, 1000),
    [bikeStations, dispatch]
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
    debouncedSearch(v);
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
        <span
          className={cx(styles.icon, stop.stopType && styles[stop.stopType])}
        >
          <FontAwesomeIcon icon={stopTypeToIcon(stop.stopType)} />
        </span>
        <span className={styles.name}>{stop.name}</span>
        <span>{stop.code}</span>
        <small className={styles.light}>{stop.id}</small>
      </Link>
    ));

  const stationResults = stations
    .filter((station) => !!station.id)
    .map((station) => {
      const stopType = station.stops.find((st) => !!st.stopType)?.stopType;
      return (
        <Link
          key={station.id}
          className={styles['search-result']}
          to={routes.station(station.id)}
        >
          <span className={cx(styles.icon, stopType && styles[stopType])}>
            <FontAwesomeIcon icon={stopTypeToIcon(stopType)} />
          </span>
          <span className={styles.name}>{station.name}</span>
          <span>{station.stops.length}&nbsp;laituria</span>
          <small className={styles.light}>{station.id}</small>
        </Link>
      );
    });

  const matchingBikeStations = !!searchString
    ? bikeStations.filter(
        (b) =>
          !!b.id &&
          (b.id.toLowerCase().includes(searchString.toLowerCase()) ||
            b.name.toLowerCase().includes(searchString.toLowerCase()))
      )
    : bikeStations;

  const bikeStationResults = matchingBikeStations.map((bikeStation) => (
    <Link
      key={bikeStation.id}
      className={styles['search-result']}
      to={routes.bikeStation(bikeStation.id)}
    >
      <span className={cx(styles.icon, styles.bicycle)}>
        <FontAwesomeIcon icon={'bicycle'} />
      </span>
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
        <div className={styles['input-container']}>
          <button type="submit" className={styles['search-button']}>
            <FontAwesomeIcon icon="search" />
          </button>
          <input
            id="inputStop"
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            autoComplete="off"
            placeholder="Hae nimellä tai koodilla"
            className={styles.input}
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
          {!loading && !!stationResults.length && (
            <>
              <h4 className={styles['result-title']}>Asemat</h4>
              <div className={styles['list-group']}>{stationResults}</div>
            </>
          )}
          {!loading && !!stopResults.length && (
            <>
              <h4 className={styles['result-title']}>Pysäkit</h4>
              <div className={styles['list-group']}>{stopResults}</div>
            </>
          )}
          {!loading && !!bikeStationResults.length && (
            <>
              <h4 className={styles['result-title']}>Pyöräasemat</h4>
              <div className={styles['list-group']}>{bikeStationResults}</div>
            </>
          )}
          {!loading &&
            !stopResults.length &&
            !stationResults.length &&
            !bikeStationResults.length && <div>Ei hakutuloksia</div>}
        </div>
      )}
    </div>
  );
};

export default Search;
