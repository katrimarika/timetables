import React, { Component, Fragment } from 'react';
import ls from 'local-storage';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { uniqBy, find } from 'lodash';
import { routes } from '../routes';
import Frontpage from './Frontpage';
import TimetablePage from './TimetablePage';

const PINNED_STOPS = 'pinnedStops';
const STARRED_STOPS = 'starredStops';

export interface RawDetail {
  id: string;
  code?: string;
  name?: string;
  isStation?: boolean;
  platformCount?: number;
  lines?: string[];
  directions?: string[];
}

interface Props {}

interface State {
  pinnedStops?: RawDetail[];
  starredStops?: RawDetail[];
}

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.getSaved();
    this.toggleSave = this.toggleSave.bind(this);
  }

  lsListener(setKey: keyof State, value?: string[]) {
    this.setState({ [setKey]: value || [] });
  }

  componentDidMount() {
    ls.on(PINNED_STOPS, this.lsListener.bind(this, PINNED_STOPS));
    ls.on(STARRED_STOPS, this.lsListener.bind(this, STARRED_STOPS));
  }

  componentWillUnmount() {
    ls.off(PINNED_STOPS, this.lsListener.bind(this, PINNED_STOPS));
    ls.off(STARRED_STOPS, this.lsListener.bind(this, STARRED_STOPS));
  }

  getSaved() {
    const pinnedStops = (ls.get(PINNED_STOPS) || []).map(
      (s: string | RawDetail): RawDetail =>
        typeof s === 'string' ? { id: s } : s
    );
    const starredStops = (ls.get(STARRED_STOPS) || []).map(
      (s: string | RawDetail): RawDetail =>
        typeof s === 'string' ? { id: s } : s
    );
    return {
      pinnedStops,
      starredStops,
    };
  }

  toggleSave(setKey: keyof State, remove: boolean, detail: RawDetail) {
    const previousStops = this.state[setKey] || [];
    const newStops = remove
      ? previousStops.filter(s => s.id !== detail.id)
      : uniqBy([...previousStops, detail], 'id');
    ls.set(setKey, newStops);
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    this.setState({ [setKey]: newStops });
  }

  render() {
    const { pinnedStops, starredStops } = this.state;

    return (
      <HashRouter>
        <Fragment>
          <main>
            <Switch>
              <Route
                exact={true}
                path={routes.frontpage}
                render={() => (
                  <Frontpage
                    pinned={pinnedStops || []}
                    starred={starredStops || []}
                    removePin={this.toggleSave.bind(this, PINNED_STOPS, true)}
                    removeStar={this.toggleSave.bind(this, STARRED_STOPS, true)}
                  />
                )}
              />
              <Route
                exact={true}
                path={routes.stop(':stopId', ':type?')}
                render={({ match }) => {
                  const { stopId, type } = match.params;
                  const pinnedDetail = find(pinnedStops, s => s.id === stopId);
                  const starredDetail = find(
                    starredStops,
                    s => s.id === stopId
                  );
                  const fromDetail =
                    type === 'star'
                      ? starredDetail
                      : type === 'pin'
                      ? pinnedDetail
                      : {};
                  const detail = {
                    ...fromDetail,
                    id: stopId,
                    isStation: false,
                  };
                  return (
                    <TimetablePage
                      key={stopId}
                      detail={detail}
                      isPinned={!!pinnedDetail}
                      isStarred={!!starredDetail}
                      togglePin={this.toggleSave.bind(
                        this,
                        PINNED_STOPS,
                        !!pinnedDetail
                      )}
                      toggleStar={this.toggleSave.bind(
                        this,
                        STARRED_STOPS,
                        !!starredDetail
                      )}
                    />
                  );
                }}
              />
              <Route
                exact={true}
                path={routes.station(':stationId', ':type?')}
                render={({ match }) => {
                  const { stationId, type } = match.params;
                  const pinnedDetail = find(
                    pinnedStops,
                    s => s.id === stationId
                  );
                  const starredDetail = find(
                    starredStops,
                    s => s.id === stationId
                  );
                  const fromDetail =
                    type === 'star'
                      ? starredDetail
                      : type === 'pin'
                      ? pinnedDetail
                      : {};
                  const detail = {
                    ...fromDetail,
                    id: stationId,
                    isStation: true,
                  };
                  return (
                    <TimetablePage
                      key={stationId}
                      detail={detail}
                      isPinned={!!pinnedDetail}
                      isStarred={!!starredDetail}
                      togglePin={this.toggleSave.bind(
                        this,
                        PINNED_STOPS,
                        !!pinnedDetail
                      )}
                      toggleStar={this.toggleSave.bind(
                        this,
                        STARRED_STOPS,
                        !!starredDetail
                      )}
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
  }
}

export default App;
