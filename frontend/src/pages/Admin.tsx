import { useState } from 'react';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  MapIcon,
  VideoCameraIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ShieldCheckIcon,
  EyeIcon,
  UserIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

type TabType = 'users' | 'sites' | 'zones' | 'cameras';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'safety_officer' | 'operator' | 'viewer';
  is_active: boolean;
  site_ids: string[];
  created_at: string;
}

interface Site {
  id: string;
  name: string;
  address: string;
  timezone: string;
  is_active: boolean;
  camera_count: number;
}

interface Zone {
  id: string;
  name: string;
  zone_type: 'exclusion' | 'restricted' | 'mandatory_ppe';
  site_id: string;
  site_name?: string;
  is_active: boolean;
}

interface Camera {
  id: string;
  name: string;
  stream_url: string;
  location_description: string;
  site_id: string;
  site_name?: string;
  is_active: boolean;
  status: 'online' | 'offline' | 'connecting';
}

// Demo data
const DEMO_USERS: User[] = [
  { id: 'usr-001', email: 'admin@company.com', full_name: 'John Admin', role: 'admin', is_active: true, site_ids: ['site-001', 'site-002'], created_at: '2024-01-15' },
  { id: 'usr-002', email: 'safety@company.com', full_name: 'Jane Safety', role: 'safety_officer', is_active: true, site_ids: ['site-001'], created_at: '2024-02-01' },
  { id: 'usr-003', email: 'operator@company.com', full_name: 'Bob Operator', role: 'operator', is_active: true, site_ids: ['site-001', 'site-002'], created_at: '2024-02-15' },
  { id: 'usr-004', email: 'viewer@company.com', full_name: 'Alice Viewer', role: 'viewer', is_active: false, site_ids: ['site-001'], created_at: '2024-03-01' },
];

const DEMO_SITES: Site[] = [
  { id: 'site-001', name: 'Main Construction Site', address: '123 Industrial Ave', timezone: 'America/New_York', is_active: true, camera_count: 5 },
  { id: 'site-002', name: 'Warehouse Complex B', address: '456 Storage Rd', timezone: 'America/New_York', is_active: true, camera_count: 3 },
  { id: 'site-003', name: 'Manufacturing Plant', address: '789 Factory Blvd', timezone: 'America/Chicago', is_active: true, camera_count: 8 },
];

const DEMO_ZONES: Zone[] = [
  { id: 'zone-001', name: 'Heavy Equipment Area', zone_type: 'exclusion', site_id: 'site-001', site_name: 'Main Construction Site', is_active: true },
  { id: 'zone-002', name: 'Loading Dock', zone_type: 'restricted', site_id: 'site-001', site_name: 'Main Construction Site', is_active: true },
  { id: 'zone-003', name: 'Assembly Line', zone_type: 'mandatory_ppe', site_id: 'site-002', site_name: 'Warehouse Complex B', is_active: true },
];

const DEMO_CAMERAS: Camera[] = [
  { id: 'cam-001', name: 'Entrance Camera', stream_url: 'rtsp://192.168.1.100:554/stream1', location_description: 'Main Entrance', site_id: 'site-001', site_name: 'Main Construction Site', is_active: true, status: 'online' },
  { id: 'cam-002', name: 'Dock Camera', stream_url: 'rtsp://192.168.1.101:554/stream1', location_description: 'Loading Dock', site_id: 'site-001', site_name: 'Main Construction Site', is_active: true, status: 'online' },
  { id: 'cam-003', name: 'Line Camera 1', stream_url: 'rtsp://192.168.1.102:554/stream1', location_description: 'Assembly Line', site_id: 'site-002', site_name: 'Warehouse Complex B', is_active: true, status: 'offline' },
];

const ROLES = [
  { value: 'admin', label: 'Admin', icon: ShieldCheckIcon, color: 'text-red-400' },
  { value: 'safety_officer', label: 'Safety Officer', icon: UserIcon, color: 'text-blue-400' },
  { value: 'operator', label: 'Operator', icon: CogIcon, color: 'text-yellow-400' },
  { value: 'viewer', label: 'Viewer', icon: EyeIcon, color: 'text-gray-400' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState(DEMO_USERS);
  const [sites, setSites] = useState(DEMO_SITES);
  const [zones, setZones] = useState(DEMO_ZONES);
  const [cameras, setCameras] = useState(DEMO_CAMERAS);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const tabs = [
    { id: 'users', name: 'Users', icon: UserGroupIcon, count: users.length },
    { id: 'sites', name: 'Sites', icon: BuildingOfficeIcon, count: sites.length },
    { id: 'zones', name: 'Zones', icon: MapIcon, count: zones.length },
    { id: 'cameras', name: 'Cameras', icon: VideoCameraIcon, count: cameras.length },
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSave = () => {
    const id = editingItem?.id || `${activeTab.slice(0, -1)}-${Date.now()}`;
    
    if (activeTab === 'users') {
      if (editingItem) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...formData } : u));
      } else {
        setUsers(prev => [...prev, { id, ...formData, is_active: true, site_ids: [], created_at: new Date().toISOString().split('T')[0] }]);
      }
    }
    if (activeTab === 'sites') {
      if (editingItem) {
        setSites(prev => prev.map(s => s.id === id ? { ...s, ...formData } : s));
      } else {
        setSites(prev => [...prev, { id, ...formData, is_active: true, camera_count: 0 }]);
      }
    }
    if (activeTab === 'zones') {
      const site = sites.find(s => s.id === formData.site_id);
      if (editingItem) {
        setZones(prev => prev.map(z => z.id === id ? { ...z, ...formData, site_name: site?.name } : z));
      } else {
        setZones(prev => [...prev, { id, ...formData, is_active: true, site_name: site?.name }]);
      }
    }
    if (activeTab === 'cameras') {
      const site = sites.find(s => s.id === formData.site_id);
      if (editingItem) {
        setCameras(prev => prev.map(c => c.id === id ? { ...c, ...formData, site_name: site?.name } : c));
      } else {
        setCameras(prev => [...prev, { id, ...formData, is_active: true, status: 'offline', site_name: site?.name }]);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'users') setUsers(prev => prev.filter(u => u.id !== id));
    if (activeTab === 'sites') setSites(prev => prev.filter(s => s.id !== id));
    if (activeTab === 'zones') setZones(prev => prev.filter(z => z.id !== id));
    if (activeTab === 'cameras') setCameras(prev => prev.filter(c => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    if (activeTab === 'users') {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    }
    if (activeTab === 'sites') {
      setSites(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
    }
    if (activeTab === 'zones') {
      setZones(prev => prev.map(z => z.id === id ? { ...z, is_active: !z.is_active } : z));
    }
    if (activeTab === 'cameras') {
      setCameras(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  const getRoleIcon = (role: string) => {
    const r = ROLES.find(r => r.value === role);
    if (!r) return null;
    return <r.icon className={`w-4 h-4 ${r.color}`} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Management</h1>
          <p className="text-gray-400 mt-1">Manage users, sites, zones, and cameras</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sites.length}</p>
              <p className="text-sm text-gray-500">Active Sites</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <MapIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{zones.length}</p>
              <p className="text-sm text-gray-500">Zones</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <VideoCameraIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{cameras.filter(c => c.status === 'online').length}/{cameras.length}</p>
              <p className="text-sm text-gray-500">Cameras Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
              <span className="px-2 py-0.5 bg-gray-600 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sites</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.full_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-gray-300 capitalize">{user.role.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400">{user.site_ids.length} sites</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sites Table */}
        {activeTab === 'sites' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timezone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cameras</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sites.map(site => (
                  <tr key={site.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{site.name}</p>
                      <p className="text-sm text-gray-500">{site.id}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{site.address}</td>
                    <td className="px-4 py-3 text-gray-400">{site.timezone}</td>
                    <td className="px-4 py-3 text-gray-400">{site.camera_count}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(site.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          site.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {site.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(site)} className="p-1.5 text-gray-400 hover:text-blue-400">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(site.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Zones Table */}
        {activeTab === 'zones' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Zone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {zones.map(zone => (
                  <tr key={zone.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{zone.name}</p>
                      <p className="text-sm text-gray-500">{zone.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        zone.zone_type === 'exclusion' ? 'bg-red-500/20 text-red-400' :
                        zone.zone_type === 'restricted' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {zone.zone_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{zone.site_name}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(zone.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          zone.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(zone)} className="p-1.5 text-gray-400 hover:text-blue-400">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(zone.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cameras Table */}
        {activeTab === 'cameras' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Camera</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Connection</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cameras.map(camera => (
                  <tr key={camera.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          camera.status === 'online' ? 'bg-green-400' : 
                          camera.status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="font-medium text-white">{camera.name}</p>
                          <p className="text-sm text-gray-500">{camera.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{camera.location_description}</td>
                    <td className="px-4 py-3 text-gray-400">{camera.site_name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                        {camera.stream_url.substring(0, 25)}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        camera.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        camera.status === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {camera.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(camera)} className="p-1.5 text-gray-400 hover:text-blue-400">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(camera.id)} className="p-1.5 text-gray-400 hover:text-red-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {activeTab === 'users' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <input type="text" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                    <select value={formData.role || 'viewer'} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'sites' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Site Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                    <input type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Timezone</label>
                    <select value={formData.timezone || 'America/New_York'} onChange={e => setFormData({...formData, timezone: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Chicago">America/Chicago</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'zones' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Zone Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Zone Type</label>
                    <select value={formData.zone_type || 'restricted'} onChange={e => setFormData({...formData, zone_type: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      <option value="exclusion">Exclusion Zone</option>
                      <option value="restricted">Restricted Zone</option>
                      <option value="mandatory_ppe">Mandatory PPE Zone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Site</label>
                    <select value={formData.site_id || ''} onChange={e => setFormData({...formData, site_id: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {activeTab === 'cameras' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Camera Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Stream URL</label>
                    <input type="text" value={formData.stream_url || ''} onChange={e => setFormData({...formData, stream_url: e.target.value})} placeholder="rtsp://..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Location Description</label>
                    <input type="text" value={formData.location_description || ''} onChange={e => setFormData({...formData, location_description: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Site</label>
                    <select value={formData.site_id || ''} onChange={e => setFormData({...formData, site_id: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingItem ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
