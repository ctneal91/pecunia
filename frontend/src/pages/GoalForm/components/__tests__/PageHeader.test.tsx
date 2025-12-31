import { render, screen } from '@testing-library/react';
import PageHeader from '../PageHeader';

describe('PageHeader', () => {
  const steps = ['Choose Template', 'Customize Goal'];

  it('renders create goal title when not editing', () => {
    render(<PageHeader isEditing={false} activeStep={0} steps={steps} error={null} />);

    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
  });

  it('renders edit goal title when editing', () => {
    render(<PageHeader isEditing={true} activeStep={1} steps={steps} error={null} />);

    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
  });

  it('renders stepper when not editing', () => {
    render(<PageHeader isEditing={false} activeStep={0} steps={steps} error={null} />);

    expect(screen.getByText('Choose Template')).toBeInTheDocument();
    expect(screen.getByText('Customize Goal')).toBeInTheDocument();
  });

  it('does not render stepper when editing', () => {
    render(<PageHeader isEditing={true} activeStep={1} steps={steps} error={null} />);

    expect(screen.queryByText('Choose Template')).not.toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    render(<PageHeader isEditing={false} activeStep={0} steps={steps} error="Test error message" />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('does not render error when error is null', () => {
    const { container } = render(<PageHeader isEditing={false} activeStep={0} steps={steps} error={null} />);

    const alerts = container.querySelectorAll('.MuiAlert-root');
    expect(alerts.length).toBe(0);
  });
});
