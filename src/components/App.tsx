import { FC, Fragment } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import { routes } from 'routes';
import styles from './App.module.css';
import Frontpage from './Frontpage';
import TimetablePage from './TimetablePage';

const App: FC = () => (
  <HashRouter>
    <Fragment>
      <main>
        <Switch>
          <Route exact={true} path={routes.frontpage} component={Frontpage} />
          <Route
            exact={true}
            path={routes.stop(':stopId', ':type?')}
            render={({ match }) => {
              const { stopId, type } = match.params;
              if (!stopId) {
                return null;
              }
              return (
                <TimetablePage key={stopId} stopId={stopId} saveType={type} />
              );
            }}
          />
          <Route
            exact={true}
            path={routes.station(':stationId', ':type?')}
            render={({ match }) => {
              const { stationId, type } = match.params;
              if (!stationId) {
                return null;
              }
              return (
                <TimetablePage
                  key={stationId}
                  stopId={stationId}
                  isStation={true}
                  saveType={type}
                />
              );
            }}
          />
          <Route
            exact={true}
            path={routes.bikeStation(':bikeStationId', ':type?')}
            render={({ match }) => {
              const { bikeStationId, type } = match.params;
              if (!bikeStationId) {
                return null;
              }
              return (
                <TimetablePage
                  key={bikeStationId}
                  stopId={bikeStationId}
                  isBike={true}
                  saveType={type}
                />
              );
            }}
          />
          <Redirect to={routes.frontpage} />
        </Switch>
      </main>
      <footer className={styles.footer}>
        <small>Data © HSL</small>
      </footer>
    </Fragment>
  </HashRouter>
);

export default App;
