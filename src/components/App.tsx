import React, { Component } from 'react';
import Cookies from 'js-cookie';
import ls from 'local-storage';
import { parse } from 'query-string';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { uniq, without, includes } from 'lodash';
import { routes } from '../routes';
import Frontpage from './Frontpage';
import TimetablePage from './TimetablePage';

const PINNED_STOPS = 'pinnedStops';
const STARRED_STOPS = 'starredStops';

interface Props {}

interface State {
  pinnedStops?: string[];
  starredStops?: string[];
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
    const { search } = window.location;
    if (search) {
      const { pin, star } = parse(search);
      const pinnedStops = typeof pin === 'string' ? [pin] : pin || [];
      const starredStops = typeof star === 'string' ? [star] : star || [];
      ls.set(PINNED_STOPS, pinnedStops);
      ls.set(STARRED_STOPS, starredStops);
      window.history.replaceState({}, document.title, window.location.pathname);
      return {
        pinnedStops,
        starredStops,
      };
    }
    let pinnedStops = ls.get(PINNED_STOPS);
    let starredStops = ls.get(STARRED_STOPS);
    // Backward compatibility: read cookies and then delete them
    if (!pinnedStops && !starredStops) {
      pinnedStops = Cookies.getJSON(PINNED_STOPS) || [];
      starredStops = Cookies.getJSON(STARRED_STOPS) || [];
      ls.set(PINNED_STOPS, pinnedStops);
      ls.set(STARRED_STOPS, starredStops);
      Cookies.remove(PINNED_STOPS);
      Cookies.remove(STARRED_STOPS);
    }
    return {
      pinnedStops: pinnedStops || [],
      starredStops: starredStops || [],
    };
  }

  toggleSave(setKey: keyof State, remove: boolean, stopId: string) {
    const previousStops = this.state[setKey] || [];
    const newStops = remove
      ? without(previousStops, stopId)
      : uniq([...previousStops, stopId]);
    ls.set(setKey, newStops);
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    this.setState({ [setKey]: newStops });
  }

  render() {
    const { pinnedStops, starredStops } = this.state;

    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
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
            path={routes.stop(':stopId')}
            render={({ match }) => {
              const { stopId } = match.params;
              const isPinned = includes(pinnedStops, stopId);
              const isStarred = includes(starredStops, stopId);
              return (
                <TimetablePage
                  key={stopId}
                  id={stopId}
                  isPinned={isPinned}
                  isStarred={isStarred}
                  togglePin={() =>
                    this.toggleSave(PINNED_STOPS, isPinned, stopId)
                  }
                  toggleStar={() =>
                    this.toggleSave(STARRED_STOPS, isStarred, stopId)
                  }
                />
              );
            }}
          />
          <Route
            exact={true}
            path={routes.station(':stationId')}
            render={({ match }) => {
              const { stationId } = match.params;
              const isPinned = includes(pinnedStops, stationId);
              const isStarred = includes(starredStops, stationId);
              return (
                <TimetablePage
                  key={stationId}
                  id={stationId}
                  isStation={true}
                  isPinned={isPinned}
                  isStarred={isStarred}
                  togglePin={() =>
                    this.toggleSave(PINNED_STOPS, isPinned, stationId)
                  }
                  toggleStar={() =>
                    this.toggleSave(STARRED_STOPS, isStarred, stationId)
                  }
                />
              );
            }}
          />
          <Redirect to={routes.frontpage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
