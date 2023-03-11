import { createRoot } from 'react-dom/client';
import App from './components/App';
import './index.css';
import { iconSetup } from './utils/iconSetup';
import { UiContextProvider } from './utils/uiContext';

iconSetup();

createRoot(document.getElementById('root') as HTMLElement).render(
  <UiContextProvider>
    <App />
  </UiContextProvider>
);
