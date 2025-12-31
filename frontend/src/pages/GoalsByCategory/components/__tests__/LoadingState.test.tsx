import { render } from '@testing-library/react';
import LoadingState from '../LoadingState';

describe('LoadingState', () => {
  it('renders skeleton loaders', () => {
    const { container } = render(<LoadingState />);

    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(4);
  });
});
