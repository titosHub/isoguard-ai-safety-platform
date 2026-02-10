import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PlayIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

interface Evidence {
  id: string;
  type: 'image' | 'video';
  original_url: string;
  blurred_url: string;
  thumbnail_url: string;
  duration_seconds?: number;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

interface Violation {
  id: string;
  detection_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence_score: number;
  site_id: string;
  site_name: string;
  zone_id: string;
  zone_name: string;
  camera_id: string;
  camera_name: string;
  detected_at: string;
  is_false_positive: boolean;
  false_positive_reason?: string;
  evidence: Evidence[];
  comments: Comment[];
  description: string;
  status: 'active' | 'resolved' | 'pending_review';
}

interface SearchFilters {
  date_from: string;
  date_to: string;
  site_id: string;
  zone_id: string;
  camera_id: string;
  detection_type: string;
  severity: string;
  min_confidence: number;
  is_false_positive: string;
  status: string;
}

const DETECTION_TYPES = [
  // Industrial Safety
  { value: 'no_hardhat', label: 'No Hardhat' },
  { value: 'no_safety_vest', label: 'No Safety Vest' },
  { value: 'no_safety_glasses', label: 'No Safety Glasses' },
  { value: 'no_gloves', label: 'No Gloves' },
  { value: 'no_safety_boots', label: 'No Safety Boots' },
  { value: 'proximity_violation', label: 'Proximity Violation' },
  { value: 'exclusion_zone_breach', label: 'Exclusion Zone Breach' },
  { value: 'fall_detection', label: 'Fall Detection' },
  { value: 'fire_smoke', label: 'Fire/Smoke' },
  { value: 'spill_hazard', label: 'Spill Hazard' },
  { value: 'unsafe_behavior', label: 'Unsafe Behavior' },
  // Airport Security
  { value: 'unattended_bag', label: 'Unattended Bag' },
  { value: 'suspicious_package', label: 'Suspicious Package' },
  { value: 'loitering', label: 'Loitering Detection' },
  { value: 'crowd_density', label: 'Crowd Density Alert' },
  { value: 'perimeter_breach', label: 'Perimeter Breach' },
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

// Demo data for sites, zones, cameras
const DEMO_SITES = [
  { id: 'site-001', name: 'Main Construction Site' },
  { id: 'site-002', name: 'Warehouse Complex B' },
  { id: 'site-003', name: 'Manufacturing Plant' },
];

const DEMO_ZONES = [
  { id: 'zone-001', name: 'Heavy Equipment Area', site_id: 'site-001' },
  { id: 'zone-002', name: 'Loading Dock', site_id: 'site-001' },
  { id: 'zone-003', name: 'Assembly Line', site_id: 'site-002' },
];

const DEMO_CAMERAS = [
  { id: 'cam-001', name: 'Entrance Camera', site_id: 'site-001' },
  { id: 'cam-002', name: 'Dock Camera', site_id: 'site-001' },
  { id: 'cam-003', name: 'Line Camera 1', site_id: 'site-002' },
];

export default function Forensics() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const [filters, setFilters] = useState<SearchFilters>({
    date_from: '',
    date_to: '',
    site_id: '',
    zone_id: '',
    camera_id: '',
    detection_type: '',
    severity: '',
    min_confidence: 0,
    is_false_positive: '',
    status: '',
  });

  // Generate demo violations
  useEffect(() => {
    generateDemoData();
  }, [page, filters]);

  const generateDemoData = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const demoViolations: Violation[] = [];
      const total = 100;
      
      for (let i = 0; i < total; i++) {
        const site = DEMO_SITES[Math.floor(Math.random() * DEMO_SITES.length)];
        const zones = DEMO_ZONES.filter(z => z.site_id === site.id);
        const zone = zones.length > 0 ? zones[Math.floor(Math.random() * zones.length)] : DEMO_ZONES[0];
        const cameras = DEMO_CAMERAS.filter(c => c.site_id === site.id);
        const camera = cameras.length > 0 ? cameras[Math.floor(Math.random() * cameras.length)] : DEMO_CAMERAS[0];
        const detType = DETECTION_TYPES[Math.floor(Math.random() * DETECTION_TYPES.length)];
        const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
        
        demoViolations.push({
          id: `VIO-${String(i + 1).padStart(6, '0')}`,
          detection_type: detType.value,
          severity: severity.value as 'critical' | 'high' | 'medium' | 'low',
          confidence_score: 0.85 + Math.random() * 0.14,
          site_id: site.id,
          site_name: site.name,
          zone_id: zone.id,
          zone_name: zone.name,
          camera_id: camera.id,
          camera_name: camera.name,
          detected_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_false_positive: Math.random() > 0.9,
          evidence: [
            {
              id: `ev-${i}-1`,
              type: Math.random() > 0.5 ? 'video' : 'image',
              original_url: `/evidence/${i}_original.jpg`,
              blurred_url: `/evidence/${i}_blurred.jpg`,
              thumbnail_url: `https://picsum.photos/seed/${i}/400/300`,
              duration_seconds: Math.random() > 0.5 ? 10 + Math.random() * 5 : undefined,
            }
          ],
          comments: Math.random() > 0.7 ? [{
            id: `cmt-${i}-1`,
            user_id: 'usr-001',
            user_name: 'Safety Officer',
            content: 'Reviewed and noted.',
            created_at: new Date().toISOString(),
          }] : [],
          description: `${detType.label} detected in ${zone.name}`,
          status: ['active', 'resolved', 'pending_review'][Math.floor(Math.random() * 3)] as any,
        });
      }

      // Apply filters
      let filtered = demoViolations;
      if (filters.site_id) filtered = filtered.filter(v => v.site_id === filters.site_id);
      if (filters.zone_id) filtered = filtered.filter(v => v.zone_id === filters.zone_id);
      if (filters.camera_id) filtered = filtered.filter(v => v.camera_id === filters.camera_id);
      if (filters.detection_type) filtered = filtered.filter(v => v.detection_type === filters.detection_type);
      if (filters.severity) filtered = filtered.filter(v => v.severity === filters.severity);
      if (filters.min_confidence > 0) filtered = filtered.filter(v => v.confidence_score >= filters.min_confidence / 100);
      if (filters.is_false_positive) filtered = filtered.filter(v => v.is_false_positive === (filters.is_false_positive === 'true'));
      if (filters.status) filtered = filtered.filter(v => v.status === filters.status);

      setTotalCount(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      
      const start = (page - 1) * pageSize;
      const paged = filtered.slice(start, start + pageSize);
      
      setViolations(paged);
      setLoading(false);
    }, 500);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      site_id: '',
      zone_id: '',
      camera_id: '',
      detection_type: '',
      severity: '',
      min_confidence: 0,
      is_false_positive: '',
      status: '',
    });
    setPage(1);
  };

  const getSeverityBadge = (severity: string) => {
    const sev = SEVERITIES.find(s => s.value === severity);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${sev?.color || 'bg-gray-500'}`}>
        {sev?.label || severity}
      </span>
    );
  };

  const getConfidenceBadge = (score: number) => {
    const pct = Math.round(score * 100);
    const color = pct >= 95 ? 'text-green-400' : pct >= 85 ? 'text-yellow-400' : 'text-red-400';
    return (
      <span className={`text-sm font-mono font-semibold ${color}`}>
        {pct}%
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Forensics Search</h1>
          <p className="text-gray-400 mt-1">Search historical violations and analyze evidence</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
          <button 
            onClick={() => {
              // Export violations as CSV
              const headers = ['ID', 'Type', 'Severity', 'Site', 'Zone', 'Camera', 'Detected At', 'Status', 'Confidence'];
              const csvRows = violations.map(v => [
                v.id,
                v.detection_type,
                v.severity,
                v.site_name,
                v.zone_name,
                v.camera_name,
                v.detected_at,
                v.status,
                (v.confidence_score * 100).toFixed(1) + '%'
              ]);
              const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `violations-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Search Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Search Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date From</label>
              <input
                type="datetime-local"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date To</label>
              <input
                type="datetime-local"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Site */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site</label>
              <select
                value={filters.site_id}
                onChange={(e) => handleFilterChange('site_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sites</option>
                {DEMO_SITES.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Zone</label>
              <select
                value={filters.zone_id}
                onChange={(e) => handleFilterChange('zone_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Zones</option>
                {DEMO_ZONES.filter(z => !filters.site_id || z.site_id === filters.site_id).map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>

            {/* Camera */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Camera</label>
              <select
                value={filters.camera_id}
                onChange={(e) => handleFilterChange('camera_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cameras</option>
                {DEMO_CAMERAS.filter(c => !filters.site_id || c.site_id === filters.site_id).map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.name}</option>
                ))}
              </select>
            </div>

            {/* Detection Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Detection Type</label>
              <select
                value={filters.detection_type}
                onChange={(e) => handleFilterChange('detection_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {DETECTION_TYPES.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                {SEVERITIES.map(sev => (
                  <option key={sev.value} value={sev.value}>{sev.label}</option>
                ))}
              </select>
            </div>

            {/* Min Confidence */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Min Confidence: {filters.min_confidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.min_confidence}
                onChange={(e) => handleFilterChange('min_confidence', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>

            {/* False Positive */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">False Positive</label>
              <select
                value={filters.is_false_positive}
                onChange={(e) => handleFilterChange('is_false_positive', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="false">Not False Positive</option>
                <option value="true">False Positive Only</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={generateDemoData}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {violations.length} of {totalCount} violations
        </p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : violations.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400">No violations found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {violations.map((violation) => (
            <div
              key={violation.id}
              onClick={() => setSelectedViolation(violation)}
              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 cursor-pointer transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={violation.evidence[0]?.thumbnail_url}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                />
                {violation.evidence[0]?.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-12 h-12 text-white" />
                  </div>
                )}
                {violation.evidence[0]?.duration_seconds && (
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {Math.floor(violation.evidence[0].duration_seconds)}s
                  </span>
                )}
                {violation.is_false_positive && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 rounded text-xs font-medium text-black">
                    False Positive
                  </span>
                )}
                <div className="absolute top-2 right-2">
                  {getConfidenceBadge(violation.confidence_score)}
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-500">{violation.id}</span>
                  {getSeverityBadge(violation.severity)}
                </div>
                <h4 className="font-medium text-white truncate">
                  {DETECTION_TYPES.find(d => d.value === violation.detection_type)?.label || violation.detection_type}
                </h4>
                <p className="text-sm text-gray-400 truncate mt-1">
                  {violation.site_name} • {violation.zone_name}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(violation.detected_at)}
                </p>
                
                {/* Indicators */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700">
                  {violation.comments.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      {violation.comments.length}
                    </span>
                  )}
                  {violation.status === 'resolved' && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckBadgeIcon className="w-4 h-4" />
                      Resolved
                    </span>
                  )}
                  {violation.status === 'pending_review' && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Evidence Modal */}
      {selectedViolation && (
        <EvidenceModal
          violation={selectedViolation}
          onClose={() => setSelectedViolation(null)}
        />
      )}
    </div>
  );
}

// Evidence Modal Component
function EvidenceModal({ violation, onClose }: { violation: Violation; onClose: () => void }) {
  const [newComment, setNewComment] = useState('');
  const [showBlurred, setShowBlurred] = useState(true);
  const [comments, setComments] = useState(violation.comments);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      user_id: 'current-user',
      user_name: 'Current User',
      content: newComment,
      created_at: new Date().toISOString(),
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleAcknowledge = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, acknowledged_at: new Date().toISOString(), acknowledged_by: 'Current User' }
        : c
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">{violation.id}</h2>
            <p className="text-gray-400">
              {DETECTION_TYPES.find(d => d.value === violation.detection_type)?.label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence Viewer */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {violation.evidence[0]?.type === 'video' ? (
                  <video
                    src={showBlurred ? violation.evidence[0].blurred_url : violation.evidence[0].original_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={violation.evidence[0].thumbnail_url}
                  />
                ) : (
                  <img
                    src={showBlurred ? violation.evidence[0]?.blurred_url : violation.evidence[0]?.original_url}
                    alt="Evidence"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={showBlurred}
                    onChange={(e) => setShowBlurred(e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  Face Blur Enabled
                </label>
                <div className="flex gap-2">
                  <a
                    href={showBlurred ? violation.evidence[0]?.blurred_url : violation.evidence[0]?.original_url}
                    download
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>

            {/* Details & Comments */}
            <div className="space-y-6">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Confidence</p>
                  <p className="text-lg font-bold text-green-400">
                    {Math.round(violation.confidence_score * 100)}%
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Severity</p>
                  <p className="text-lg font-bold text-white capitalize">{violation.severity}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Site</p>
                  <p className="text-sm text-white">{violation.site_name}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Zone</p>
                  <p className="text-sm text-white">{violation.zone_name}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Camera</p>
                  <p className="text-sm text-white">{violation.camera_name}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Detected</p>
                  <p className="text-sm text-white">{new Date(violation.detected_at).toLocaleString()}</p>
                </div>
              </div>

              {/* False Positive Toggle */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlagIcon className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500 font-medium">Mark as False Positive</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={violation.is_false_positive}
                      className="sr-only peer"
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Comments</h3>
                <div className="space-y-3 max-h-48 overflow-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{comment.user_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                      {comment.acknowledged_at ? (
                        <p className="text-xs text-green-400 mt-2">
                          ✓ Acknowledged by {comment.acknowledged_by}
                        </p>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(comment.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  )}
                </div>
                
                {/* Add Comment */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
