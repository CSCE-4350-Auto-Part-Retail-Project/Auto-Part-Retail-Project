import { useState } from 'react';
import { Button } from './ui/button';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

interface ReportData {
  total_orders: number | null;
  total_items: number | null;
}

export default function ManageReports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    setError(null);
    setReport(null);

    try {
      const res = await fetch(`${API_BASE}/api/reports/${type}`);
      if (!res.ok) throw new Error('Failed to load report.');
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Reports</h2>
      <p className="text-sm text-slate-400">
        Generate daily, weekly, and monthly reports.
      </p>

      <div className="flex gap-3">
        <Button size="sm" onClick={() => fetchReport('daily')}>
          Daily Report
        </Button>
        <Button size="sm" onClick={() => fetchReport('weekly')}>
          Weekly Report
        </Button>
        <Button size="sm" onClick={() => fetchReport('monthly')}>
          Monthly Report
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {report && (
        <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Report Results
          </h3>

          <p className="text-slate-300">
            <strong>Total Orders:</strong> {report.total_orders ?? 0}
          </p>
          <p className="text-slate-300">
            <strong>Total Items Ordered:</strong> {report.total_items ?? 0}
          </p>
        </div>
      )}
    </div>
  );
}
