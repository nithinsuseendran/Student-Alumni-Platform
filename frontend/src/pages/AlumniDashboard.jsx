import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Briefcase, Calendar, Plus, Check, X, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    purple: 'rgba(168,85,247,', pink: 'rgba(236,72,153,', orange: 'rgba(249,115,22,', blue: 'rgba(59,130,246,',
  };
  const c = colorMap[color] || colorMap.purple;
  return (
    <div className="stat-card" style={{ borderColor: `${c}0.25)` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c}0.12)`, border: `1px solid ${c}0.25)` }}>
          <Icon size={18} style={{ color: `${c}1)` }} />
        </div>
        <div>
          <p className="text-white/50 text-xs">{label}</p>
          <p className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk' }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AlumniDashboard() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({ title: '', description: '', type: 'full-time', location: '', salary: '', skills: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', type: 'webinar', date: '', duration: '1 hour', link: '', platform: 'Zoom' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [reqRes, jobRes, evRes] = await Promise.all([
          api.get('/mentorship/my'),
          api.get('/jobs?limit=5'),
          api.get('/events?limit=3'),
        ]);
        setRequests(reqRes.data.requests || []);
        setJobs(jobRes.data.jobs || []);
        setEvents(evRes.data.events || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/mentorship/${id}/respond`, { status });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Request ${status}`);
    } catch { toast.error('Failed to respond'); }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...jobForm, skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) };
      const { data } = await api.post('/jobs', payload);
      setJobs(prev => [data.job, ...prev]);
      setShowCreateJob(false);
      setJobForm({ title: '', description: '', type: 'full-time', location: '', salary: '', skills: '' });
      toast.success('Job posted successfully!');
    } catch { toast.error('Failed to post job'); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/events', eventForm);
      setEvents(prev => [data.event, ...prev]);
      setShowCreateEvent(false);
      toast.success('Event created!');
    } catch { toast.error('Failed to create event'); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');

  return (
    <DashboardLayout title="Alumni Dashboard">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-6 mb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(249,115,22,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Space Grotesk' }}>Hello, {user?.name?.split(' ')[0]} 👋</h2>
            <p className="text-white/60">{user?.designation} @ {user?.company} · {user?.domain}</p>
            {!user?.isApproved && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
                style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c' }}>
                ⏳ Pending admin approval
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreateJob(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
              <Plus size={16} /> Post Job
            </button>
            <button onClick={() => setShowCreateEvent(true)} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
              <Calendar size={16} /> Create Event
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Pending Requests" value={pending.length} color="orange" />
        <StatCard icon={Check} label="Active Mentees" value={accepted.length} color="green" />
        <StatCard icon={Briefcase} label="Jobs Posted" value={jobs.length} color="purple" />
        <StatCard icon={Calendar} label="Events" value={events.length} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentorship Requests */}
        <div>
          <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            Mentorship Requests
            {pending.length > 0 && <span className="ml-2 badge badge-orange text-xs">{pending.length} new</span>}
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {loading ? <div className="skeleton h-24 rounded-xl" /> :
              requests.length ? requests.map(req => (
                <div key={req._id} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {req.student?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{req.student?.name}</p>
                        <span className={`badge text-xs ${req.status === 'pending' ? 'badge-orange' : req.status === 'accepted' ? 'badge-green' : 'badge-pink'}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs">{req.student?.college} · {req.student?.year} Year</p>
                      <p className="text-white/60 text-xs mt-2 line-clamp-2">{req.message}</p>
                    </div>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleRespond(req._id, 'accepted')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                        <Check size={12} /> Accept
                      </button>
                      <button onClick={() => handleRespond(req._id, 'rejected')}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f472b6' }}>
                        <X size={12} /> Decline
                      </button>
                      <Link to={`/chat/${req.student?._id}`}
                        className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                        style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
                        <MessageCircle size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              )) : <div className="glass-card p-8 text-center text-white/40"><BookOpen size={32} className="mx-auto mb-2 opacity-40" /><p>No requests yet</p></div>
            }
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>Posted Jobs</h3>
            <Link to="/jobs" className="text-purple-400 text-sm flex items-center gap-1">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {loading ? <div className="skeleton h-24 rounded-xl" /> :
              jobs.slice(0, 4).map(job => (
                <div key={job._id} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{job.title}</p>
                    <p className="text-xs text-white/40">{job.company} · {job.location}</p>
                  </div>
                  <span className={`badge text-xs ${job.type === 'internship' ? 'badge-orange' : 'badge-purple'}`}>{job.type}</span>
                </div>
              ))
            }
            <button onClick={() => setShowCreateJob(true)} className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm text-white/40 hover:text-purple-400 hover:border-purple-500/30 transition-all border border-dashed border-white/10">
              <Plus size={16} /> Post a new job
            </button>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-xl" style={{ fontFamily: 'Space Grotesk' }}>Post a Job</h3>
              <button onClick={() => setShowCreateJob(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <input placeholder="Job Title *" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} className="input-field" required />
              <textarea placeholder="Job Description *" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} className="input-field h-28 resize-none" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                  {['full-time', 'part-time', 'internship', 'contract', 'remote'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input placeholder="Location" value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} className="input-field" />
              </div>
              <input placeholder="Salary (e.g. 12-18 LPA)" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} className="input-field" />
              <input placeholder="Skills (comma separated)" value={jobForm.skills} onChange={e => setJobForm(p => ({ ...p, skills: e.target.value }))} className="input-field" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateJob(false)} className="btn-secondary flex-1 py-3 rounded-xl">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 rounded-xl">Post Job</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-xl" style={{ fontFamily: 'Space Grotesk' }}>Create Event</h3>
              <button onClick={() => setShowCreateEvent(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input placeholder="Event Title *" value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} className="input-field" required />
              <textarea placeholder="Description *" value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} className="input-field h-24 resize-none" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={eventForm.type} onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                  {['webinar', 'workshop', 'seminar', 'networking', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="datetime-local" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} className="input-field" required />
              </div>
              <input placeholder="Meeting Link (Zoom/Meet)" value={eventForm.link} onChange={e => setEventForm(p => ({ ...p, link: e.target.value }))} className="input-field" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateEvent(false)} className="btn-secondary flex-1 py-3 rounded-xl">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 rounded-xl">Create Event</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
