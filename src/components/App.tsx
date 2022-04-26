import React, { FC, Fragment } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import { routes } from '../routes';
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
              if (!stopId || (!!type && !['pin', 'star'].includes(type))) {
                return null;
              }
              return (
                <TimetablePage
                  key={stopId}
                  stopId={stopId}
                  saveType={type as any}
                />
              );
            }}
          />
          <Route
            exact={true}
            path={routes.station(':stationId', ':type?')}
            render={({ match }) => {
              const { stationId, type } = match.params;
              if (!stationId || (!!type && !['pin', 'star'].includes(type))) {
                return null;
              }
              return (
                <TimetablePage
                  key={stationId}
                  stopId={stationId}
                  isStation={true}
                  saveType={type as any}
                />
              );
            }}
          />
          <Redirect to={routes.frontpage} />
        </Switch>
      </main>
      <footer className="small">Data © HSL</footer>
    </Fragment>
  </HashRouter>
);

export default App;
