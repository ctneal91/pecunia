import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DeclinedState from '../DeclinedState';

describe('DeclinedState', () => {
  it('renders declined message with group name', () => {
    render(
      <BrowserRouter>
        <DeclinedState groupName="Test Group" />
      </BrowserRouter>
    );

    expect(screen.getByText('Invitation Declined')).toBeInTheDocument();
    expect(screen.getByText("You've declined the invitation to join Test Group.")).toBeInTheDocument();
  });

  it('renders go home button', () => {
    render(
      <BrowserRouter>
        <DeclinedState groupName="Test Group" />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });
});
