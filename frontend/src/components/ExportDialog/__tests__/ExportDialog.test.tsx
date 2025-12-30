import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportDialog from '../ExportDialog';
import * as exportUtils from '../../../utils/export';

jest.mock('../../../utils/export', () => ({
  exportGoals: jest.fn(),
  exportContributions: jest.fn(),
  exportSummaryReport: jest.fn(),
}));

const mockedExportUtils = exportUtils as jest.Mocked<typeof exportUtils>;

describe('ExportDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedExportUtils.exportGoals.mockResolvedValue(undefined);
    mockedExportUtils.exportContributions.mockResolvedValue(undefined);
    mockedExportUtils.exportSummaryReport.mockResolvedValue(undefined);
  });

  it('renders dialog when open', () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(<ExportDialog open={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
  });

  it('shows export type options', () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Contributions')).toBeInTheDocument();
    expect(screen.getByText('Summary Report')).toBeInTheDocument();
  });

  it('shows format options for goals export', () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('hides format options for summary export', () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText(/Summary Report/));

    expect(screen.queryByText('Format')).not.toBeInTheDocument();
  });

  it('calls exportGoals when exporting goals', async () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(mockedExportUtils.exportGoals).toHaveBeenCalledWith('json');
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls exportContributions when contributions selected', async () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText(/Contributions/));
    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(mockedExportUtils.exportContributions).toHaveBeenCalledWith('json');
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls exportSummaryReport when summary selected', async () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText(/Summary Report/));
    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(mockedExportUtils.exportSummaryReport).toHaveBeenCalled();
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('uses CSV format when selected', async () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText('CSV'));
    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(mockedExportUtils.exportGoals).toHaveBeenCalledWith('csv');
    });
  });

  it('shows error message on export failure', async () => {
    mockedExportUtils.exportGoals.mockRejectedValue(new Error('Export failed'));

    render(<ExportDialog open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to export. Please try again.')).toBeInTheDocument();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button clicked', () => {
    render(<ExportDialog open={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables buttons while exporting', async () => {
    mockedExportUtils.exportGoals.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<ExportDialog open={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /export/i }));

    expect(screen.getByRole('button', { name: /exporting/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
