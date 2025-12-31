import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  it('renders generic welcome for unauthenticated users', () => {
    render(<PageHeader isAuthenticated={false} />);

    expect(screen.getByText('Welcome to Pecunia')).toBeInTheDocument();
  });

  it('renders personalized welcome with user name', () => {
    render(<PageHeader isAuthenticated={true} userName="John" userEmail="john@example.com" />);

    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
  });

  it('renders personalized welcome with email prefix when no name', () => {
    render(<PageHeader isAuthenticated={true} userEmail="john@example.com" />);

    expect(screen.getByText('Welcome back, john!')).toBeInTheDocument();
  });

  it('renders generic welcome when authenticated but no user data', () => {
    render(<PageHeader isAuthenticated={true} />);

    expect(screen.getByText('Welcome to Pecunia')).toBeInTheDocument();
  });
});
