import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { parse } from 'query-string';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { uniq, without, includes } from 'lodash';
import { routes } from '../routes';
import Frontpage from './Frontpage';
import StopPage from './StopPage';

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
    this.state = this.getSavedStops();
    this.toggleStop = this.toggleStop.bind(this);
  }

  getSavedStops() {
    const { search } = window.location;
    if (search) {
      const { pin, star } = parse(search);
      const pinnedStops = typeof pin === 'string' ? [pin] : pin || [];
      const starredStops = typeof star === 'string' ? [star] : star || [];
      Cookies.set(PINNED_STOPS, pinnedStops);
      Cookies.set(STARRED_STOPS, starredStops);
      window.history.replaceState({}, document.title, window.location.pathname);
      return {
        pinnedStops,
        starredStops,
      };
    }
    const pinnedStops = Cookies.getJSON(PINNED_STOPS) || [];
    const starredStops = Cookies.getJSON(STARRED_STOPS) || [];
    return {
      pinnedStops,
      starredStops,
    };
  }

  toggleStop(setKey: keyof State, remove: boolean, stopId: string) {
    const previousStops = this.state[setKey] || [];
    const newStops = remove
      ? without(previousStops, stopId)
      : uniq([...previousStops, stopId]);
    Cookies.set(setKey, newStops);
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
                pinnedStops={pinnedStops || []}
                starredStops={starredStops || []}
                removePin={this.toggleStop.bind(this, PINNED_STOPS, true)}
                removeStar={this.toggleStop.bind(this, STARRED_STOPS, true)}
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
                <StopPage
                  stopId={stopId}
                  isPinned={isPinned}
                  isStarred={isStarred}
                  togglePin={() =>
                    this.toggleStop(PINNED_STOPS, isPinned, stopId)
                  }
                  toggleStar={() =>
                    this.toggleStop(STARRED_STOPS, isStarred, stopId)
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
