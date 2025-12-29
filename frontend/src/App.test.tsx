import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app with navigation', () => {
  render(<App />);
  const appTitle = screen.getByText(/Pecunia/i);
  expect(appTitle).toBeInTheDocument();
});

test('renders login and signup links when not authenticated', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
});
