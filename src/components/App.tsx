import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { isEmpty, uniq, without, includes } from 'lodash';
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
    this.state = {
      pinnedStops: [],
      starredStops: [],
    };
    this.getStops = this.getStops.bind(this);
    this.addStop = this.addStop.bind(this);
    this.removeStop = this.removeStop.bind(this);
  }

  componentDidMount() {
    this.setState({
      pinnedStops: this.getStops(PINNED_STOPS),
      starredStops: this.getStops(STARRED_STOPS),
    });
  }

  getStops(setKey: keyof State) {
    const cookieStops = Cookies.getJSON(setKey);
    if (!isEmpty(cookieStops)) {
      return cookieStops;
    }
    const stateStops = this.state[setKey];
    if (!isEmpty(stateStops)) {
      return stateStops;
    }
    return [];
  }

  addStop(setKey: keyof State, stopId: string) {
    const previousStops = this.getStops(setKey);
    const newStops = uniq([...previousStops, stopId]);
    Cookies.set(setKey, newStops);
    this.setState({ [setKey]: newStops });
  }

  removeStop(setKey: keyof State, stopId: string) {
    const previousStops = this.getStops(setKey);
    const newStops = without(previousStops, stopId);
    Cookies.set(setKey, newStops);
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
                removePin={this.removeStop.bind(this, PINNED_STOPS)}
                removeStar={this.removeStop.bind(this, STARRED_STOPS)}
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
              const togglePin = () =>
                isPinned
                  ? this.removeStop(PINNED_STOPS, stopId)
                  : this.addStop(PINNED_STOPS, stopId);
              const toggleStar = () =>
                isStarred
                  ? this.removeStop(STARRED_STOPS, stopId)
                  : this.addStop(STARRED_STOPS, stopId);
              return (
                <StopPage
                  stopId={stopId}
                  isPinned={isPinned}
                  isStarred={isStarred}
                  togglePin={togglePin}
                  toggleStar={toggleStar}
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
