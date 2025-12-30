/* global Blob, URL, URLSearchParams */
import { api } from '../services/api';
import { ExportFormat } from '../types/goal';

const API_BASE = '/api/v1';

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJson(data: unknown, filename: string): void {
  const content = JSON.stringify(data, null, 2);
  downloadFile(content, filename, 'application/json');
}

async function fetchCsv(endpoint: string): Promise<string> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to export');
  }
  return response.text();
}

export async function exportGoals(format: ExportFormat): Promise<void> {
  const date = new Date().toISOString().split('T')[0];

  if (format === 'csv') {
    const csv = await fetchCsv('/exports/goals?format=csv');
    downloadFile(csv, `goals-${date}.csv`, 'text/csv');
  } else {
    const response = await api.exportGoals('json');
    if (response.data) {
      downloadJson(response.data.data, `goals-${date}.json`);
    }
  }
}

export async function exportContributions(format: ExportFormat, goalId?: number): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const params = new URLSearchParams({ format });
  if (goalId) params.append('goal_id', goalId.toString());

  if (format === 'csv') {
    const csv = await fetchCsv(`/exports/contributions?${params}`);
    const filename = goalId ? `goal-${goalId}-contributions-${date}.csv` : `contributions-${date}.csv`;
    downloadFile(csv, filename, 'text/csv');
  } else {
    const response = await api.exportContributions('json', goalId);
    if (response.data) {
      const filename = goalId ? `goal-${goalId}-contributions-${date}.json` : `contributions-${date}.json`;
      downloadJson(response.data.data, filename);
    }
  }
}

export async function exportSummaryReport(): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const response = await api.exportSummary();
  if (response.data) {
    downloadJson(response.data, `summary-report-${date}.json`);
  }
}

export async function exportGoalReport(goalId: number, goalTitle: string): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const safeTitle = goalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const response = await api.exportGoalReport(goalId);
  if (response.data) {
    downloadJson(response.data, `${safeTitle}-report-${date}.json`);
  }
}
