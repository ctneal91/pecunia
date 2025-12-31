import { render, screen } from '@testing-library/react';
import TemplateCardHeader from '../TemplateCardHeader';

describe('TemplateCardHeader', () => {
  it('renders template name and description', () => {
    render(
      <TemplateCardHeader
        name="Emergency Fund"
        description="Save for unexpected expenses"
        isSelected={false}
      />
    );

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('Save for unexpected expenses')).toBeInTheDocument();
  });

  it('shows check icon when selected', () => {
    const { container } = render(
      <TemplateCardHeader
        name="Emergency Fund"
        description="Save for unexpected expenses"
        isSelected={true}
      />
    );

    const icon = container.querySelector('[data-testid="CheckCircleOutlineIcon"]');
    expect(icon).toBeInTheDocument();
  });

  it('does not show check icon when not selected', () => {
    const { container } = render(
      <TemplateCardHeader
        name="Emergency Fund"
        description="Save for unexpected expenses"
        isSelected={false}
      />
    );

    const icon = container.querySelector('[data-testid="CheckCircleOutlineIcon"]');
    expect(icon).not.toBeInTheDocument();
  });
});
