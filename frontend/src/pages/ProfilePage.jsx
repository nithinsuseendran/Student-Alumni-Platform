import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Link as LinkIcon, Linkedin, Github, MapPin, 
  Briefcase, GraduationCap, Award, MessageCircle, BookOpen,
  ArrowLeft, CheckCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ message: '', domain: '', goals: '' });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser(data.user);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleMentorshipRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mentorship', {
        alumniId: id,
        message: requestForm.message,
        domain: requestForm.domain,
        goals: requestForm.goals.split(',').map(g => g.trim())
      });
      toast.success('Mentorship request sent successfully!');
      setShowRequestModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) return (
    <DashboardLayout title="Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="skeleton h-64 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="md:col-span-2 skeleton h-96 rounded-2xl" />
        </div>
      </div>
    </DashboardLayout>
  );

  if (!user) return <DashboardLayout title="Profile"><div className="text-center py-20">User not found</div></DashboardLayout>;

  const isOwnProfile = currentUser?._id === id;

  return (
    <DashboardLayout title={isOwnProfile ? "My Profile" : `${user.name}'s Profile`}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden mb-8"
        >
          <div className="h-40 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-orange-900/40 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 80%, #ec4899 0%, transparent 50%)' }} />
          </div>
          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="w-32 h-32 rounded-3xl p-1 bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl">
                <div className="w-full h-full rounded-[1.4rem] bg-[#050510] flex items-center justify-center text-4xl font-bold">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-[1.4rem] object-cover" /> : user.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk' }}>{user.name}</h2>
                  {user.role === 'alumni' && user.isApproved && <CheckCircle size={20} className="text-blue-400" />}
                </div>
                <p className="text-white/60 text-lg">
                  {user.role === 'alumni' ? `${user.designation} @ ${user.company}` : `${user.course} Student`}
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/40">
                  {user.location && <span className="flex items-center gap-1"><MapPin size={14} /> {user.location}</span>}
                  <span className="flex items-center gap-1 capitalize"><Award size={14} /> {user.role}</span>
                </div>
              </div>
              {!isOwnProfile && (
                <div className="flex gap-3 pb-2">
                  <Link to={`/chat/${user._id}`} className="btn-secondary px-6 py-3 rounded-2xl flex items-center gap-2">
                    <MessageCircle size={18} /> Message
                  </Link>
                  {user.role === 'alumni' && (
                    <button 
                      onClick={() => setShowRequestModal(true)}
                      className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-2"
                    >
                      <BookOpen size={18} /> Request Mentorship
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Mail size={18} className="text-purple-400" /> Contact Info</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/40">Email</span>
                  <span className="text-white/80">{user.email}</span>
                </div>
                {user.linkedin && (
                  <a href={user.linkedin} target="_blank" className="flex items-center justify-between hover:text-purple-400 transition-colors">
                    <span className="text-white/40">LinkedIn</span>
                    <Linkedin size={16} />
                  </a>
                )}
                {user.github && (
                  <a href={user.github} target="_blank" className="flex items-center justify-between hover:text-purple-400 transition-colors">
                    <span className="text-white/40">GitHub</span>
                    <Github size={16} />
                  </a>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-bold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills?.length > 0 ? user.skills.map(skill => (
                  <span key={skill} className="badge badge-purple">{skill}</span>
                )) : <p className="text-white/30 text-xs">No skills listed</p>}
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>About</h3>
              <p className="text-white/60 leading-relaxed">
                {user.bio || "No bio provided."}
              </p>
            </div>

            {user.role === 'alumni' ? (
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk' }}>
                  <Briefcase size={22} className="text-purple-400" /> Experience
                </h3>
                <div className="space-y-8">
                  <div className="relative pl-8 border-l-2 border-white/5">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#050510]" />
                    <div className="mb-1 flex items-center justify-between">
                      <h4 className="font-bold">{user.designation}</h4>
                      <span className="text-xs text-white/30">Present</span>
                    </div>
                    <p className="text-purple-400 text-sm mb-2">{user.company}</p>
                    <p className="text-white/50 text-sm">{user.domain} Domain</p>
                  </div>
                  
                  <div className="relative pl-8 border-l-2 border-white/5">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white/10 border-4 border-[#050510]" />
                    <div className="mb-1 flex items-center justify-between">
                      <h4 className="font-bold">Education</h4>
                      <span className="text-xs text-white/30">Class of {user.graduationYear}</span>
                    </div>
                    <p className="text-white/60 text-sm">Graduated from our esteemed institution</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk' }}>
                  <GraduationCap size={22} className="text-purple-400" /> Academic Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">College</p>
                    <p className="font-semibold">{user.college}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Course</p>
                    <p className="font-semibold">{user.course}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Academic Year</p>
                    <p className="font-semibold">{user.year} Year</p>
                  </div>
                  {user.gpa && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">GPA</p>
                      <p className="font-semibold">{user.gpa}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {user.achievements?.length > 0 && (
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk' }}>
                   Achievements
                </h3>
                <ul className="space-y-3">
                  {user.achievements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/60 text-sm">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mentorship Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 w-full max-w-lg"
          >
            <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Space Grotesk' }}>Request Mentorship</h3>
            <p className="text-white/50 mb-6">Connect with {user.name} for career guidance and mentorship.</p>
            
            <form onSubmit={handleMentorshipRequest} className="space-y-5">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Interested Domain</label>
                <input 
                  placeholder="e.g. Frontend Development, Data Science" 
                  value={requestForm.domain}
                  onChange={e => setRequestForm(p => ({ ...p, domain: e.target.value }))}
                  className="input-field" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">What are your goals?</label>
                <input 
                  placeholder="e.g. Mock Interviews, Project Review (comma separated)" 
                  value={requestForm.goals}
                  onChange={e => setRequestForm(p => ({ ...p, goals: e.target.value }))}
                  className="input-field" 
                  required 
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Personal Message</label>
                <textarea 
                  placeholder="Tell them why you'd like to be mentored..." 
                  value={requestForm.message}
                  onChange={e => setRequestForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field h-32 resize-none" 
                  required 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary flex-1 py-3 rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 py-3 rounded-2xl"
                >
                  Send Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
