import ReactDOM from 'react-dom';
import { UiContextProvider } from './utils/uiContext';
import App from './components/App';
import './index.css';
import { iconSetup } from './utils/iconSetup';

iconSetup();

ReactDOM.render(
  <UiContextProvider>
    <App />
  </UiContextProvider>,
  document.getElementById('root')
);
