import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MessageCircle, Star, Briefcase, MapPin, Globe, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ domain: '', skills: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/alumni', {
        params: { search, domain: filters.domain, skills: filters.skills, page, limit: 12 }
      });
      setAlumni(data.alumni);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [search, filters, page]);

  return (
    <DashboardLayout title="Alumni Directory">
      <div className="max-w-6xl mx-auto">
        {/* Search and Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                placeholder="Search by name, company, designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Domain (e.g. Tech)"
                value={filters.domain}
                onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                className="input-field w-40"
              />
              <input
                type="text"
                placeholder="Skills"
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                className="input-field w-40"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="skeleton w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-8 w-full" />
              </div>
            ))
          ) : alumni.length > 0 ? (
            alumni.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-6 flex flex-col h-full"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      a.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{a.name}</h3>
                    <p className="text-purple-400 text-sm font-medium">{a.designation}</p>
                    <p className="text-white/40 text-xs">{a.company}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {a.bio && <p className="text-white/60 text-sm line-clamp-2">{a.bio}</p>}
                  <div className="flex flex-wrap gap-2">
                    {a.skills?.slice(0, 3).map(skill => (
                      <span key={skill} className="badge badge-purple">{skill}</span>
                    ))}
                    {a.skills?.length > 3 && <span className="text-xs text-white/40">+{a.skills.length - 3} more</span>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/profile/${a._id}`}
                    className="btn-secondary flex-1 text-center text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/chat/${a._id}`}
                    className="btn-primary p-2 rounded-xl"
                  >
                    <MessageCircle size={20} />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-white/40">No alumni found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center mt-12 gap-2">
            {Array.from({ length: Math.ceil(total / 12) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl transition-all ${
                  page === i + 1
                    ? 'btn-primary'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
