import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTimes,
  faBus,
  faStar,
  faChevronDown,
  faThumbtack,
  faTrashAlt,
  faArrowLeft,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import 'styles/index.scss';

library.add(
  faTimes,
  faBus,
  faStar,
  faChevronDown,
  faThumbtack,
  faTrashAlt,
  faArrowLeft,
  faSearch
);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
