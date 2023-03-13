import { FC } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { routes } from '../routes';
import styles from './App.module.css';
import Frontpage from './Frontpage';
import TimetablePage from './TimetablePage';

const App: FC = () => (
  <HashRouter>
    <>
      <main>
        <Routes>
          <Route path={routes.frontpage} element={<Frontpage />} />
          <Route
            path={routes.stop(':stopId', ':saveType?')}
            element={<TimetablePage stopType="stop" />}
          />
          <Route
            path={routes.station(':stopId', ':saveType?')}
            element={<TimetablePage stopType="station" />}
          />
          <Route
            path={routes.bikeStation(':stopId', ':saveType?')}
            element={<TimetablePage stopType="bike" />}
          />
          <Route
            path="/*"
            element={<Navigate to={routes.frontpage} replace />}
          />
        </Routes>
      </main>
      <footer className={styles.footer}>
        <small>Data © HSL</small>
      </footer>
    </>
  </HashRouter>
);

export default App;
