import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InviteStatusState from '../InviteStatusState';

describe('InviteStatusState', () => {
  it('renders accepted status correctly', () => {
    render(
      <BrowserRouter>
        <InviteStatusState
          status="accepted"
          groupName="Test Group"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Invitation Already Accepted')).toBeInTheDocument();
    expect(screen.getByText('This invitation has already been used.')).toBeInTheDocument();
  });

  it('renders expired status correctly', () => {
    render(
      <BrowserRouter>
        <InviteStatusState
          status="expired"
          groupName="Test Group"
          inviterName="John Doe"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Invitation Expired')).toBeInTheDocument();
    expect(screen.getByText(/This invitation to join Test Group has expired/i)).toBeInTheDocument();
    expect(screen.getByText(/Please ask John Doe to send a new invitation/i)).toBeInTheDocument();
  });

  it('renders expired status without inviter name', () => {
    render(
      <BrowserRouter>
        <InviteStatusState
          status="expired"
          groupName="Test Group"
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/Please ask for a new invitation/i)).toBeInTheDocument();
  });

  it('renders declined status correctly', () => {
    render(
      <BrowserRouter>
        <InviteStatusState
          status="declined"
          groupName="Test Group"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Invitation Declined')).toBeInTheDocument();
    expect(screen.getByText(/This invitation to join Test Group was declined/i)).toBeInTheDocument();
  });

  it('renders go home button', () => {
    render(
      <BrowserRouter>
        <InviteStatusState
          status="accepted"
          groupName="Test Group"
        />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });
});
