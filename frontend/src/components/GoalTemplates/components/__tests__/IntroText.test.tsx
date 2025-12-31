import { render, screen } from '@testing-library/react';
import IntroText from '../IntroText';

describe('IntroText', () => {
  it('renders intro text', () => {
    render(<IntroText />);

    expect(screen.getByText(/Choose a template to get started quickly/i)).toBeInTheDocument();
  });
});
