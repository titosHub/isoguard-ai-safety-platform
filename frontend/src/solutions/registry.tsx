import type React from 'react'
import {
  CubeIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  HeartIcon,
  HomeModernIcon,
  SunIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  VideoCameraIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  ShieldExclamationIcon,
  ClipboardDocumentCheckIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline'

export type SolutionId =
  | 'mining'
  | 'airport'
  | 'border'
  | 'smart_city'
  | 'manufacturing'
  | 'warehouse'
  | 'health'
  | 'construction'
  | 'agriculture'

export type SolutionSlug =
  | 'overview'
  | 'incidents'
  | 'analytics'
  | 'cameras'
  | 'reports'
  | 'forensics'
  | 'media'
  | 'government-submit'
  | 'shift-reports'
  | 'ppe-compliance'
  | 'tailing-dam'
  | 'perimeter-security'
  | 'passenger-flow'
  | 'queue-management'
  | 'baggage-tracking'

export interface SolutionNavItem {
  label: string
  slug: SolutionSlug
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

export interface SolutionDefinition {
  id: SolutionId
  name: string
  shortDescription: string
  icon: React.ComponentType<{ className?: string }>
  // Used for gradient/background accents in the landing page cards
  accent: {
    border: string
    from: string
    to: string
    icon: string
  }
  // Default page when entering the solution
  defaultSlug: SolutionSlug
  // Primary navigation (solution dashboard module)
  moduleNav: SolutionNavItem[]
  // Tools navigation (must be sector-driven)
  toolsNav: SolutionNavItem[]
}

export function solutionPath(solutionId: SolutionId, slug: SolutionSlug): string {
  return `/s/${solutionId}/${slug}`
}

export const SOLUTIONS: SolutionDefinition[] = [
  {
    id: 'mining',
    name: 'Mining',
    shortDescription: 'PPE compliance, near-miss detection, and high-risk zone analytics.',
    icon: CubeIcon,
    accent: {
      border: 'border-amber-500/30',
      from: 'from-amber-900/50',
      to: 'to-gray-800',
      icon: 'text-amber-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Control Room', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'PPE Compliance', slug: 'ppe-compliance', icon: ShieldExclamationIcon },
      { label: 'Tailing Dam Analytics', slug: 'tailing-dam', icon: ChartBarIcon },
      { label: 'Shift Reports', slug: 'shift-reports', icon: ClipboardDocumentCheckIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'airport',
    name: 'Airport',
    shortDescription: 'Perimeter security, passenger flow, and queue monitoring.',
    icon: PaperAirplaneIcon,
    accent: {
      border: 'border-cyan-500/30',
      from: 'from-cyan-900/50',
      to: 'to-gray-800',
      icon: 'text-cyan-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Security Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Perimeter Security', slug: 'perimeter-security', icon: ShieldExclamationIcon },
      { label: 'Passenger Flow', slug: 'passenger-flow', icon: ArrowsRightLeftIcon },
      { label: 'Queue Management', slug: 'queue-management', icon: ClipboardDocumentCheckIcon },
      { label: 'Baggage Tracking', slug: 'baggage-tracking', icon: BuildingStorefrontIcon },
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'border',
    name: 'Border Control',
    shortDescription: 'Perimeter breach detection and operations oversight.',
    icon: GlobeAltIcon,
    accent: {
      border: 'border-emerald-500/30',
      from: 'from-emerald-900/50',
      to: 'to-gray-800',
      icon: 'text-emerald-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Operations Overview', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'smart_city',
    name: 'Smart City',
    shortDescription: 'Public safety analytics and camera-based monitoring.',
    icon: BuildingOfficeIcon,
    accent: {
      border: 'border-sky-500/30',
      from: 'from-sky-900/50',
      to: 'to-gray-800',
      icon: 'text-sky-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'City Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    shortDescription: 'LOTO and machine safety analytics with incident management.',
    icon: WrenchScrewdriverIcon,
    accent: {
      border: 'border-blue-500/30',
      from: 'from-blue-900/50',
      to: 'to-gray-800',
      icon: 'text-blue-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Safety Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'warehouse',
    name: 'Warehousing',
    shortDescription: 'Forklift proximity analytics and warehouse safety monitoring.',
    icon: BuildingStorefrontIcon,
    accent: {
      border: 'border-purple-500/30',
      from: 'from-purple-900/50',
      to: 'to-gray-800',
      icon: 'text-purple-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Safety Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'health',
    name: 'Healthcare',
    shortDescription: 'Incident management and safety analytics for clinical settings.',
    icon: HeartIcon,
    accent: {
      border: 'border-red-500/30',
      from: 'from-red-900/50',
      to: 'to-gray-800',
      icon: 'text-red-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Safety Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'construction',
    name: 'Construction',
    shortDescription: 'Site safety monitoring, exclusion zones, and reporting.',
    icon: HomeModernIcon,
    accent: {
      border: 'border-orange-500/30',
      from: 'from-orange-900/50',
      to: 'to-gray-800',
      icon: 'text-orange-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Safety Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    shortDescription: 'Animal behavior anomalies and farm safety monitoring.',
    icon: SunIcon,
    accent: {
      border: 'border-green-500/30',
      from: 'from-green-900/50',
      to: 'to-gray-800',
      icon: 'text-green-400',
    },
    defaultSlug: 'overview',
    moduleNav: [
      { label: 'Safety Monitor', slug: 'overview', icon: ShieldExclamationIcon },
      { label: 'Incidents', slug: 'incidents', icon: ExclamationTriangleIcon },
      { label: 'Analytics', slug: 'analytics', icon: ChartBarIcon },
    ],
    toolsNav: [
      { label: 'Live Cameras', slug: 'cameras', icon: VideoCameraIcon },
      { label: 'Forensics', slug: 'forensics', icon: MagnifyingGlassIcon },
      { label: 'Reports', slug: 'reports', icon: DocumentChartBarIcon },
      { label: 'Media Upload', slug: 'media', icon: CloudArrowUpIcon },
      { label: 'Government Submit', slug: 'government-submit', icon: PaperAirplaneIcon },
    ],
  },
]

export function getSolution(solutionId: string | undefined | null): SolutionDefinition | null {
  if (!solutionId) return null
  return SOLUTIONS.find((s) => s.id === solutionId) ?? null
}
