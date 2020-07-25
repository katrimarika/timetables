import ls from 'local-storage';
import { uniqBy } from 'lodash';
import React, {
  createContext,
  Dispatch,
  FC,
  useContext,
  useReducer,
} from 'react';
import 'styles/Search.scss';
import { Station, Stop } from '../utils/fetch';

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
type SearchResults = { stops: Stop[]; stations: Station[] };
const emptySearchResults: SearchResults = { stops: [], stations: [] };
type Action =
  | { type: 'startSearch'; value: string }
  | { type: 'setSearchResults'; results: SearchResults }
  | { type: 'closeSearch' }
  | { type: 'saveStar'; detail: RawDetail }
  | { type: 'removeStar'; stopId: string }
  | { type: 'savePin'; detail: RawDetail }
  | { type: 'removePin'; stopId: string }
  | { type: 'setStarsState'; values: RawDetail[] }
  | { type: 'setPinsState'; values: RawDetail[] };

type UiContext = {
  searchString: string;
  searchResults: SearchResults;
  pinned: RawDetail[];
  starred: RawDetail[];
  dispatch: Dispatch<Action>;
};

const initialState: UiContext = {
  searchString: '',
  searchResults: emptySearchResults,
  pinned: [],
  starred: [],
  dispatch: () => null,
};

const UiContext = createContext(initialState);

function getInitialSaves() {
  const pinned: RawDetail[] = (ls.get(PINNED_STOPS) || []).map(
    (s: string | RawDetail) => (typeof s === 'string' ? { id: s } : s)
  );
  const starred: RawDetail[] = (ls.get(STARRED_STOPS) || []).map(
    (s: string | RawDetail) => (typeof s === 'string' ? { id: s } : s)
  );
  return { starred, pinned };
}

export const UiContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    (state: UiContext, action: Action) => {
      switch (action.type) {
        case 'startSearch':
          return { ...state, searchString: action.value };
        case 'setSearchResults':
          return {
            ...state,
            searchResults: action.results,
          };
        case 'closeSearch':
          return {
            ...state,
            searchString: '',
            searchResults: emptySearchResults,
          };
        case 'saveStar':
          const newStarred = uniqBy([...state.starred, action.detail], 'id');
          ls.set(STARRED_STOPS, newStarred);
          return { ...state, starred: newStarred };
        case 'removeStar':
          const remainingStarred = state.starred.filter(
            s => s.id !== action.stopId
          );
          ls.set(STARRED_STOPS, remainingStarred);
          return { ...state, starred: remainingStarred };
        case 'savePin':
          const newPinned = uniqBy([...state.pinned, action.detail], 'id');
          ls.set(PINNED_STOPS, newPinned);
          return { ...state, pinned: newPinned };
        case 'removePin':
          const remainingPinned = state.pinned.filter(
            s => s.id !== action.stopId
          );
          ls.set(PINNED_STOPS, remainingPinned);
          return { ...state, pinned: remainingPinned };
        case 'setStarsState':
          return { ...state, starred: action.values };
        case 'setPinsState':
          return { ...state, pinned: action.values };
        default:
          return state;
      }
    },
    { ...initialState, ...getInitialSaves() }
  );

  return (
    <UiContext.Provider value={{ ...state, dispatch }}>
      {children}
    </UiContext.Provider>
  );
};

export const useUiContext = () => {
  const context = useContext(UiContext);
  return context;
};
