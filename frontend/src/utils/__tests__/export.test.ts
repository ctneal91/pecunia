import { downloadFile, downloadJson, exportGoals, exportContributions, exportSummaryReport, exportGoalReport } from '../export';
import { api } from '../../services/api';

jest.mock('../../services/api', () => ({
  api: {
    exportGoals: jest.fn(),
    exportContributions: jest.fn(),
    exportSummary: jest.fn(),
    exportGoalReport: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('export utilities', () => {
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;
  let mockAppendChild: jest.Mock;
  let mockRemoveChild: jest.Mock;
  let mockClick: jest.Mock;
  let mockCreateElement: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateObjectURL = jest.fn(() => 'blob:test-url');
    mockRevokeObjectURL = jest.fn();
    mockAppendChild = jest.fn();
    mockRemoveChild = jest.fn();
    mockClick = jest.fn();

    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    global.fetch = jest.fn();

    mockCreateElement = jest.spyOn(document, 'createElement');
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement);

    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
  });

  afterEach(() => {
    mockCreateElement.mockRestore();
  });

  describe('downloadFile', () => {
    it('creates a blob and triggers download', () => {
      downloadFile('test content', 'test.txt', 'text/plain');

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  describe('downloadJson', () => {
    it('downloads JSON data', () => {
      const data = { key: 'value' };
      downloadJson(data, 'test.json');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportGoals', () => {
    it('exports goals as JSON', async () => {
      mockedApi.exportGoals.mockResolvedValue({
        data: { data: [{ id: 1, title: 'Test Goal' }] },
      } as never);

      await exportGoals('json');

      expect(mockedApi.exportGoals).toHaveBeenCalledWith('json');
      expect(mockClick).toHaveBeenCalled();
    });

    it('exports goals as CSV', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('id,title\n1,Test Goal'),
      });

      await exportGoals('csv');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/exports/goals?format=csv',
        expect.any(Object)
      );
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportContributions', () => {
    it('exports all contributions as JSON', async () => {
      mockedApi.exportContributions.mockResolvedValue({
        data: { data: [{ id: 1, amount: 100 }] },
      } as never);

      await exportContributions('json');

      expect(mockedApi.exportContributions).toHaveBeenCalledWith('json', undefined);
    });

    it('exports contributions for a specific goal as CSV', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('id,amount\n1,100'),
      });

      await exportContributions('csv', 123);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('goal_id=123'),
        expect.any(Object)
      );
    });
  });

  describe('exportSummaryReport', () => {
    it('exports summary report', async () => {
      mockedApi.exportSummary.mockResolvedValue({
        data: { summary: { total_goals: 5 } },
      } as never);

      await exportSummaryReport();

      expect(mockedApi.exportSummary).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportGoalReport', () => {
    it('exports goal report with sanitized filename', async () => {
      mockedApi.exportGoalReport.mockResolvedValue({
        data: { goal: { id: 1, title: 'Test Goal' } },
      } as never);

      await exportGoalReport(1, 'My Test Goal!');

      expect(mockedApi.exportGoalReport).toHaveBeenCalledWith(1);
      expect(mockClick).toHaveBeenCalled();
    });
  });
});
