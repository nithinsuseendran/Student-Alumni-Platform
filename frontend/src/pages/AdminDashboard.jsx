import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, Shield, 
  BarChart3, Settings, AlertCircle, Trash2,
  Check, X, Briefcase, Calendar, Search
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/users/admin/all')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/users/admin/${id}/approve`);
      toast.success('Alumni approved');
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/users/admin/${id}/toggle`);
      toast.success('User status updated');
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="System Administration">
      <div className="max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Total Students</p>
                <p className="text-3xl font-black">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Total Alumni</p>
                <p className="text-3xl font-black">{stats?.totalAlumni || 0}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Pending Approval</p>
                <p className="text-3xl font-black">{stats?.pendingAlumni || 0}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Online Users</p>
                <p className="text-3xl font-black">{stats?.onlineUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>User Management</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest font-black text-white/40">
                  <th className="p-6">User</th>
                  <th className="p-6">Role</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Joined</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-6"><div className="skeleton h-10 w-40" /></td>
                      <td className="p-6"><div className="skeleton h-6 w-20" /></td>
                      <td className="p-6"><div className="skeleton h-6 w-20" /></td>
                      <td className="p-6"><div className="skeleton h-4 w-32" /></td>
                      <td className="p-6"><div className="skeleton h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-xl object-cover" /> : u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.name}</p>
                            <p className="text-xs text-white/30">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          u.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                          u.role === 'alumni' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-orange-500/10 border-orange-500/20 text-orange-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-pink-500'}`} />
                          <span className="text-xs text-white/60">{u.isActive ? 'Active' : 'Banned'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-xs text-white/40">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.role === 'alumni' && !u.isApproved && (
                            <button 
                              onClick={() => handleApprove(u._id)}
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 transition-colors hover:text-white"
                              title="Approve Alumni"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleToggleStatus(u._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.isActive ? 'bg-pink-500/10 text-pink-400 hover:bg-pink-500' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500'
                            } hover:text-white`}
                            title={u.isActive ? "Deactivate User" : "Activate User"}
                          >
                            {u.isActive ? <X size={16} /> : <Check size={16} />}
                          </button>
                          <button className="p-2 rounded-lg bg-white/5 text-white/30 hover:bg-pink-900/40 hover:text-pink-400 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-white/30">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
