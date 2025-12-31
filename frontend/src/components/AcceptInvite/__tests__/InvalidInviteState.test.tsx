import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InvalidInviteState from '../InvalidInviteState';

describe('InvalidInviteState', () => {
  it('renders error message', () => {
    render(
      <BrowserRouter>
        <InvalidInviteState error="Invitation not found" />
      </BrowserRouter>
    );

    expect(screen.getByText('Invalid Invitation')).toBeInTheDocument();
    expect(screen.getByText('Invitation not found')).toBeInTheDocument();
  });

  it('renders go home button', () => {
    render(
      <BrowserRouter>
        <InvalidInviteState error="Test error" />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });
});
