import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UnauthenticatedInviteCard from '../UnauthenticatedInviteCard';

describe('UnauthenticatedInviteCard', () => {
  it('renders group and inviter information', () => {
    render(
      <BrowserRouter>
        <UnauthenticatedInviteCard
          groupName="Test Group"
          inviterName="John Doe"
          token="test-token"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText(/John Doe invited you to join/i)).toBeInTheDocument();
  });

  it('renders login and register buttons with correct redirect', () => {
    render(
      <BrowserRouter>
        <UnauthenticatedInviteCard
          groupName="Test Group"
          inviterName="John Doe"
          token="test-token"
        />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('link', { name: /log in/i });
    const registerButton = screen.getByRole('link', { name: /create account/i });

    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', '/login?redirect=/invites/test-token');

    expect(registerButton).toBeInTheDocument();
    expect(registerButton).toHaveAttribute('href', '/register?redirect=/invites/test-token');
  });

  it('displays authentication message', () => {
    render(
      <BrowserRouter>
        <UnauthenticatedInviteCard
          groupName="Test Group"
          inviterName="John Doe"
          token="test-token"
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/please log in or create an account/i)).toBeInTheDocument();
  });
});
