import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Briefcase, Calendar, TrendingUp, Star, Search, ArrowRight, Clock, MessageCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-8 w-3/4" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, change, to }) {
  const colorMap = {
    purple: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', icon: '#a855f7' },
    pink: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', icon: '#ec4899' },
    orange: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', icon: '#f97316' },
    blue: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: '#3b82f6' },
  };
  const c = colorMap[color];
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} className="stat-card cursor-pointer" style={{ borderColor: c.border }}>
      <Link to={to || '#'} className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={22} style={{ color: c.icon }} />
        </div>
        <div>
          <p className="text-white/50 text-sm mb-1">{label}</p>
          <p className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk' }}>{value}</p>
          {change && <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><TrendingUp size={12} />{change}</p>}
        </div>
      </Link>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, alumniRes, jobsRes, eventsRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/users/alumni?limit=4'),
          api.get('/jobs?limit=4'),
          api.get('/events?limit=3&status=upcoming'),
        ]);
        setStats(statsRes.data.stats);
        setAlumni(alumniRes.data.alumni || []);
        setJobs(jobsRes.data.jobs || []);
        setEvents(eventsRes.data.events || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }) };

  return (
    <DashboardLayout title="Student Dashboard">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 mb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #a855f7 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              Hello, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p className="text-white/60">
              {user?.course} • {user?.college} • {user?.year} Year
            </p>
          </div>
          <Link to="/alumni" className="btn-primary flex items-center gap-2 rounded-xl text-sm px-5 py-3">
            <Search size={16} /> Find Mentors
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : [
            { icon: Users, label: 'Alumni Mentors', value: stats?.totalAlumni || '—', color: 'purple', to: '/alumni' },
            { icon: BookOpen, label: 'My Requests', value: '—', color: 'pink', to: '/mentorship' },
            { icon: Briefcase, label: 'Jobs Available', value: jobs.length ? `${jobs.length}+` : '—', color: 'orange', to: '/jobs' },
            { icon: Calendar, label: 'Events', value: events.length ? `${events.length}+` : '—', color: 'blue', to: '/events' },
          ].map((s, i) => (
            <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <StatCard {...s} />
            </motion.div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Alumni */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>Featured Alumni</h3>
            <Link to="/alumni" className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) :
              alumni.length ? alumni.map((a, i) => (
                <motion.div key={a._id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {a.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{a.name}</p>
                      <p className="text-white/50 text-xs">{a.designation}</p>
                      <p className="text-purple-400 text-xs">{a.company}</p>
                      {a.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.skills.slice(0, 3).map(s => (
                            <span key={s} className="badge badge-purple text-xs px-2 py-0.5">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/profile/${a._id}`} className="btn-secondary text-xs px-3 py-2 rounded-lg flex-1 text-center">View</Link>
                    <Link to={`/chat/${a._id}`} className="btn-primary text-xs px-3 py-2 rounded-lg flex items-center gap-1">
                      <MessageCircle size={12} /> Chat
                    </Link>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-2 glass-card p-8 text-center text-white/40">
                  <Users size={32} className="mx-auto mb-3 opacity-40" />
                  <p>No alumni found yet</p>
                </div>
              )
            }
          </div>
        </div>

        {/* Sidebar: Events + Jobs */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Upcoming Events</h3>
              <Link to="/events" className="text-purple-400 text-xs hover:text-purple-300">See all</Link>
            </div>
            <div className="space-y-3">
              {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) :
                events.length ? events.map(ev => (
                  <div key={ev._id} className="glass-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{ev.title}</p>
                        <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                          <Clock size={10} />
                          {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : <div className="glass-card p-5 text-center text-white/40 text-sm">No events yet</div>
              }
            </div>
          </div>

          {/* Latest Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk' }}>Latest Jobs</h3>
              <Link to="/jobs" className="text-purple-400 text-xs hover:text-purple-300">See all</Link>
            </div>
            <div className="space-y-3">
              {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) :
                jobs.slice(0, 3).map(job => (
                  <div key={job._id} className="glass-card p-4 hover:border-purple-500/30 transition-colors cursor-pointer">
                    <p className="text-sm font-semibold mb-1">{job.title}</p>
                    <p className="text-xs text-purple-400">{job.company}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`badge text-xs ${job.type === 'internship' ? 'badge-orange' : 'badge-purple'}`}>{job.type}</span>
                      {job.location && <span className="text-xs text-white/40">{job.location}</span>}
                    </div>
                  </div>
                )) || <div className="glass-card p-5 text-center text-white/40 text-sm">No jobs yet</div>
              }
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
