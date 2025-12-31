import { render, screen } from '@testing-library/react';
import ContributorsSection from '../ContributorsSection';
import { Contributor } from '../../../types/goal';

const mockContributors: Contributor[] = [
  {
    user_id: 1,
    user_name: 'john_doe',
    contribution_count: 5,
    total_amount: 250.50,
    percentage: 28,
  },
  {
    user_id: 2,
    user_name: 'jane_smith',
    contribution_count: 3,
    total_amount: 150.75,
    percentage: 17,
  },
  {
    user_id: 3,
    user_name: 'bob_wilson',
    contribution_count: 8,
    total_amount: 500.00,
    percentage: 55,
  },
];

describe('ContributorsSection', () => {
  it('renders nothing when contributors array is empty', () => {
    const { container } = render(
      <ContributorsSection contributors={[]} contributorCount={0} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when contributors is null', () => {
    const { container } = render(
      <ContributorsSection contributors={null as unknown as Contributor[]} contributorCount={0} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays contributors heading with correct count', () => {
    render(
      <ContributorsSection
        contributors={mockContributors}
        contributorCount={3}
      />
    );

    expect(screen.getByText('Contributors (3)')).toBeInTheDocument();
  });

  it('renders all contributors with their usernames', () => {
    render(
      <ContributorsSection
        contributors={mockContributors}
        contributorCount={3}
      />
    );

    expect(screen.getByText('john_doe')).toBeInTheDocument();
    expect(screen.getByText('jane_smith')).toBeInTheDocument();
    expect(screen.getByText('bob_wilson')).toBeInTheDocument();
  });

  it('displays contribution counts for each contributor', () => {
    render(
      <ContributorsSection
        contributors={mockContributors}
        contributorCount={3}
      />
    );

    expect(screen.getByText('5 contributions')).toBeInTheDocument();
    expect(screen.getByText('3 contributions')).toBeInTheDocument();
    expect(screen.getByText('8 contributions')).toBeInTheDocument();
  });

  it('displays total amounts for each contributor', () => {
    render(
      <ContributorsSection
        contributors={mockContributors}
        contributorCount={3}
      />
    );

    expect(screen.getByText('$250.5')).toBeInTheDocument();
    expect(screen.getByText('$150.75')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('displays percentages for each contributor', () => {
    render(
      <ContributorsSection
        contributors={mockContributors}
        contributorCount={3}
      />
    );

    expect(screen.getByText('28%')).toBeInTheDocument();
    expect(screen.getByText('17%')).toBeInTheDocument();
    expect(screen.getByText('55%')).toBeInTheDocument();
  });

  it('renders with a single contributor', () => {
    const singleContributor = [mockContributors[0]];

    render(
      <ContributorsSection
        contributors={singleContributor}
        contributorCount={1}
      />
    );

    expect(screen.getByText('Contributors (1)')).toBeInTheDocument();
    expect(screen.getByText('john_doe')).toBeInTheDocument();
    expect(screen.getByText('5 contributions')).toBeInTheDocument();
    expect(screen.getByText('$250.5')).toBeInTheDocument();
  });

  it('renders person icon for each contributor', () => {
    render(
      <ContributorsSection
        contributors={mockContributors}
        contributorCount={3}
      />
    );

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });
});
