import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App';
import { iconSetup } from '../utils/iconSetup';

iconSetup();

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
