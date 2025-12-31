import { render, screen } from '@testing-library/react';
import GuestInfoAlert from '../GuestInfoAlert';

describe('GuestInfoAlert', () => {
  it('renders info message about local storage', () => {
    render(<GuestInfoAlert />);

    expect(screen.getByText(/Your data is saved locally/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up to sync across devices/i)).toBeInTheDocument();
  });

  it('renders info severity alert', () => {
    const { container } = render(<GuestInfoAlert />);

    const alert = container.querySelector('.MuiAlert-standardInfo');
    expect(alert).toBeInTheDocument();
  });
});
