import App from 'components/App';
import { createRoot } from 'react-dom/client';
import { iconSetup } from 'utils/iconSetup';

iconSetup();

it('renders without crashing', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<App />);
  root.unmount();
});
