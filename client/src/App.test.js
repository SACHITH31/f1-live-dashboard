import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard brand', () => {
  render(<App />);
  const linkElement = screen.getByRole('button', { name: /f1 live dashboard/i });
  expect(linkElement).toBeInTheDocument();
});
