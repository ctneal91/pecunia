import { render, screen } from '@testing-library/react';
import TemplateChips from '../TemplateChips';

describe('TemplateChips', () => {
  it('renders suggested amount chip', () => {
    render(<TemplateChips suggestedAmount={5000} />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('renders months chip when suggestedMonths is provided', () => {
    render(<TemplateChips suggestedAmount={5000} suggestedMonths={6} />);

    expect(screen.getByText('6 months')).toBeInTheDocument();
  });

  it('does not render months chip when suggestedMonths is not provided', () => {
    render(<TemplateChips suggestedAmount={5000} />);

    expect(screen.queryByText(/months/)).not.toBeInTheDocument();
  });
});
