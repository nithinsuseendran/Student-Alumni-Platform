import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, CheckCircle, XCircle, Clock, 
  MessageCircle, User, Briefcase, GraduationCap,
  Calendar, Search, Filter, ArrowRight, ChevronDown
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MentorshipPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/mentorship/my');
      setRequests(data.requests);
    } catch (err) {
      toast.error('Failed to load mentorship requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/mentorship/${id}/respond`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  return (
    <DashboardLayout title="Mentorship Program">
      <div className="max-w-6xl mx-auto">
        {/* Page Info */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-purple-900/40">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'Space Grotesk' }}>Manage Mentorships</h2>
              <p className="text-white/50 text-sm">
                {user.role === 'student' 
                  ? "Track your mentorship requests and connect with alumni." 
                  : "Review incoming requests and mentor the next generation."}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link to="/alumni" className="btn-primary px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Search size={16} /> {user.role === 'student' ? 'Find Mentors' : 'Community'}
            </Link>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {['all', 'pending', 'accepted', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === s 
                  ? 'btn-primary border-transparent shadow-lg shadow-purple-900/40' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-8 space-y-4">
                <div className="flex gap-6">
                  <div className="skeleton w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-1/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-20 w-full rounded-2xl" />
              </div>
            ) )
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((req, i) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-8 flex flex-col lg:flex-row gap-8 relative overflow-hidden group"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  req.status === 'accepted' ? 'bg-green-500' : req.status === 'pending' ? 'bg-orange-500' : 'bg-pink-500'
                }`} />

                {/* User Info Section */}
                <div className="lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                      <div className="w-full h-full rounded-[1.4rem] bg-[#050510] flex items-center justify-center text-2xl font-bold">
                        {(user.role === 'student' ? req.alumni : req.student)?.avatar ? (
                          <img src={(user.role === 'student' ? req.alumni : req.student).avatar} className="w-full h-full rounded-[1.4rem] object-cover" />
                        ) : (user.role === 'student' ? req.alumni : req.student)?.name?.charAt(0)}
                      </div>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#050510] ${
                      req.status === 'accepted' ? 'bg-green-500' : req.status === 'pending' ? 'bg-orange-500' : 'bg-pink-500'
                    }`}>
                      {req.status === 'accepted' ? <CheckCircle size={10} /> : req.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                    {(user.role === 'student' ? req.alumni : req.student)?.name}
                  </h3>
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                    {user.role === 'student' 
                      ? `${req.alumni?.designation} @ ${req.alumni?.company}` 
                      : `${req.student?.course} student`}
                  </p>
                  <div className="flex gap-2 w-full lg:w-auto">
                    <Link to={`/profile/${(user.role === 'student' ? req.alumni : req.student)?._id}`} className="flex-1 btn-secondary py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                      Profile
                    </Link>
                    <Link to={`/chat/${(user.role === 'student' ? req.alumni : req.student)?._id}`} className="btn-primary p-2.5 rounded-xl">
                      <MessageCircle size={16} />
                    </Link>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={14} className="text-purple-500" />
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      req.status === 'accepted' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                      req.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 
                      'bg-pink-500/10 border-pink-500/20 text-pink-400'
                    }`}>
                      {req.status}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-2">Message</h4>
                    <p className="text-white/60 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                      "{req.message}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-2">Target Domain</h4>
                      <span className="badge badge-purple px-4 py-1.5">{req.domain}</span>
                    </div>
                    <div>
                      <h4 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-2">Primary Goals</h4>
                      <div className="flex flex-wrap gap-2">
                        {req.goals?.map(g => (
                          <span key={g} className="text-[10px] font-bold text-white/60 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {user.role === 'alumni' && req.status === 'pending' && (
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => handleStatusUpdate(req._id, 'accepted')}
                        className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                        Accept Request
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(req._id, 'rejected')}
                        className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black text-xs uppercase tracking-widest hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/20 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {req.response && (
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-white/30 font-black uppercase tracking-widest text-[9px] mb-2">Response from Mentor</h4>
                      <p className="text-white/60 text-sm italic">
                        "{req.response}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center glass-card">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-white/10" size={40} />
              </div>
              <p className="text-white/30">No mentorship requests found.</p>
              <Link to="/alumni" className="text-purple-400 text-sm hover:underline mt-4 inline-block">Start exploring mentors</Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
