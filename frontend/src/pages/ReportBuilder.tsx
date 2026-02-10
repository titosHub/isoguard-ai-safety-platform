import { useState } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  SparklesIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

interface ReportConfig {
  title: string;
  dateRange: { from: string; to: string };
  sites: string[];
  metrics: string[];
  groupBy: string;
  chartType: string;
}

const METRICS = [
  { id: 'violations', label: 'Total Violations', color: '#ef4444' },
  { id: 'critical', label: 'Critical Incidents', color: '#dc2626' },
  { id: 'compliance_rate', label: 'Compliance Rate', color: '#22c55e' },
  { id: 'response_time', label: 'Avg Response Time', color: '#3b82f6' },
  { id: 'ppe_compliance', label: 'PPE Compliance', color: '#8b5cf6' },
  { id: 'zone_breaches', label: 'Zone Breaches', color: '#f59e0b' },
  { id: 'false_positives', label: 'False Positives', color: '#6b7280' },
  { id: 'camera_uptime', label: 'Camera Uptime', color: '#06b6d4' },
];

const SITES = [
  { id: 'site-001', name: 'Main Construction Site' },
  { id: 'site-002', name: 'Warehouse Complex B' },
  { id: 'site-003', name: 'Manufacturing Plant' },
];

const CHART_TYPES = [
  { id: 'bar', label: 'Bar Chart', icon: ChartBarIcon },
  { id: 'line', label: 'Line Chart', icon: PresentationChartLineIcon },
  { id: 'pie', label: 'Pie Chart', icon: ChartPieIcon },
  { id: 'table', label: 'Data Table', icon: TableCellsIcon },
];

const GROUP_OPTIONS = [
  { id: 'day', label: 'Daily' },
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
  { id: 'site', label: 'By Site' },
  { id: 'detection_type', label: 'By Detection Type' },
  { id: 'severity', label: 'By Severity' },
];

export default function ReportBuilder() {
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Safety Compliance Report',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    },
    sites: ['site-001', 'site-002', 'site-003'],
    metrics: ['violations', 'compliance_rate', 'ppe_compliance'],
    groupBy: 'week',
    chartType: 'bar',
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  const toggleMetric = (metricId: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };

  const toggleSite = (siteId: string) => {
    setConfig(prev => ({
      ...prev,
      sites: prev.sites.includes(siteId)
        ? prev.sites.filter(s => s !== siteId)
        : [...prev.sites, siteId],
    }));
  };

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  // Generate demo chart data
  const generateChartData = () => {
    const labels = config.groupBy === 'week' 
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : config.groupBy === 'month'
      ? ['Jan', 'Feb', 'Mar', 'Apr']
      : config.groupBy === 'site'
      ? SITES.filter(s => config.sites.includes(s.id)).map(s => s.name)
      : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

    return labels.map(label => ({
      label,
      data: config.metrics.reduce((acc, metric) => {
        if (metric === 'compliance_rate' || metric === 'ppe_compliance' || metric === 'camera_uptime') {
          acc[metric] = 75 + Math.random() * 20;
        } else if (metric === 'response_time') {
          acc[metric] = 2 + Math.random() * 5;
        } else {
          acc[metric] = Math.floor(10 + Math.random() * 40);
        }
        return acc;
      }, {} as Record<string, number>),
    }));
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.flatMap(d => Object.values(d.data)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Report Builder</h1>
          <p className="text-gray-400 mt-1">Create custom reports with dynamic visualizations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            disabled={config.metrics.length === 0 || generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <DocumentChartBarIcon className="w-5 h-5" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Report Title */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-2">Report Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* Date Range */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Date Range</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={config.dateRange.from}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={config.dateRange.to}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sites Selection */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Sites</h3>
            </div>
            <div className="space-y-2">
              {SITES.map(site => (
                <label key={site.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sites.includes(site.id)}
                    onChange={() => toggleSite(site.id)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300 text-sm">{site.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Metrics Selection */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Metrics</h3>
            </div>
            <div className="space-y-2">
              {METRICS.map(metric => (
                <label key={metric.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.metrics.includes(metric.id)}
                    onChange={() => toggleMetric(metric.id)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
                    style={{ accentColor: metric.color }}
                  />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="text-gray-300 text-sm">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Group By */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Group By</h3>
            </div>
            <select
              value={config.groupBy}
              onChange={(e) => setConfig(prev => ({ ...prev, groupBy: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              {GROUP_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Chart Type */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-medium text-white mb-3">Chart Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {CHART_TYPES.map(chart => (
                <button
                  key={chart.id}
                  onClick={() => setConfig(prev => ({ ...prev, chartType: chart.id }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    config.chartType === chart.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <chart.icon className="w-5 h-5" />
                  <span className="text-sm">{chart.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl border border-gray-700 h-full">
            {!showPreview ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-gray-500">
                <DocumentChartBarIcon className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium">Report Preview</h3>
                <p className="text-sm mt-1">Configure your report and click Generate</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Report Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                  <div>
                    <h2 className="text-xl font-bold text-white">{config.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {config.dateRange.from} to {config.dateRange.to}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      // Export report data as JSON (can be converted to PDF on server)
                      const reportData = {
                        title: config.title,
                        dateRange: config.dateRange,
                        sites: config.sites.map(id => SITES.find(s => s.id === id)?.name),
                        metrics: config.metrics.map(id => METRICS.find(m => m.id === id)?.label),
                        groupBy: config.groupBy,
                        chartData,
                        generatedAt: new Date().toISOString(),
                      };
                      const dataStr = JSON.stringify(reportData, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${config.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      alert('Report exported! In production, this would generate a PDF.');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Export PDF
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {config.metrics.slice(0, 4).map(metricId => {
                    const metric = METRICS.find(m => m.id === metricId);
                    const value = metricId.includes('rate') || metricId.includes('compliance') || metricId.includes('uptime')
                      ? `${(85 + Math.random() * 10).toFixed(1)}%`
                      : metricId === 'response_time'
                      ? `${(2 + Math.random() * 3).toFixed(1)} min`
                      : Math.floor(50 + Math.random() * 100);
                    return (
                      <div key={metricId} className="bg-gray-700/50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">{metric?.label}</p>
                        <p className="text-2xl font-bold" style={{ color: metric?.color }}>{value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Chart */}
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">
                    {GROUP_OPTIONS.find(g => g.id === config.groupBy)?.label} Breakdown
                  </h3>
                  
                  {config.chartType === 'bar' && (
                    <div className="space-y-4">
                      {chartData.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>{item.label}</span>
                          </div>
                          <div className="flex gap-1 h-8">
                            {config.metrics.map(metricId => {
                              const metric = METRICS.find(m => m.id === metricId);
                              const value = item.data[metricId];
                              const width = (value / maxValue) * 100;
                              return (
                                <div
                                  key={metricId}
                                  className="h-full rounded transition-all"
                                  style={{
                                    width: `${width}%`,
                                    backgroundColor: metric?.color,
                                    minWidth: '2px',
                                  }}
                                  title={`${metric?.label}: ${typeof value === 'number' ? value.toFixed(1) : value}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {config.chartType === 'line' && (
                    <div className="h-64 flex items-end gap-4">
                      {chartData.map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="w-full h-48 flex items-end justify-center gap-1">
                            {config.metrics.map(metricId => {
                              const metric = METRICS.find(m => m.id === metricId);
                              const value = item.data[metricId];
                              const height = (value / maxValue) * 100;
                              return (
                                <div
                                  key={metricId}
                                  className="w-2 rounded-t transition-all"
                                  style={{
                                    height: `${height}%`,
                                    backgroundColor: metric?.color,
                                  }}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {config.chartType === 'pie' && (
                    <div className="flex items-center justify-center gap-8">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {config.metrics.map((metricId, idx) => {
                            const metric = METRICS.find(m => m.id === metricId);
                            const total = config.metrics.length;
                            const offset = (idx / total) * 100;
                            const value = 100 / total;
                            return (
                              <circle
                                key={metricId}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={metric?.color}
                                strokeWidth="20"
                                strokeDasharray={`${value} ${100 - value}`}
                                strokeDashoffset={-offset}
                              />
                            );
                          })}
                        </svg>
                      </div>
                      <div className="space-y-2">
                        {config.metrics.map(metricId => {
                          const metric = METRICS.find(m => m.id === metricId);
                          return (
                            <div key={metricId} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: metric?.color }} />
                              <span className="text-sm text-gray-400">{metric?.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {config.chartType === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Period</th>
                            {config.metrics.map(metricId => {
                              const metric = METRICS.find(m => m.id === metricId);
                              return (
                                <th key={metricId} className="px-3 py-2 text-right text-xs font-medium text-gray-400">
                                  {metric?.label}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-700">
                              <td className="px-3 py-2 text-sm text-white">{item.label}</td>
                              {config.metrics.map(metricId => (
                                <td key={metricId} className="px-3 py-2 text-sm text-gray-300 text-right">
                                  {item.data[metricId].toFixed(1)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {config.metrics.map(metricId => {
                    const metric = METRICS.find(m => m.id === metricId);
                    return (
                      <div key={metricId} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: metric?.color }} />
                        <span className="text-sm text-gray-400">{metric?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
