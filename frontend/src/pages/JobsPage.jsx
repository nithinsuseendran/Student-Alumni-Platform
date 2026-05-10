import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, MapPin, DollarSign, Clock, Search, 
  Filter, Plus, ExternalLink, Bookmark, Building,
  ArrowRight, X, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', { 
        params: { type: filter !== 'all' ? filter : undefined } 
      });
      setJobs(data.jobs);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout title="Jobs & Internships">
      <div className="max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
            {['all', 'full-time', 'internship', 'remote'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  filter === type 
                    ? 'btn-primary border-transparent' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                placeholder="Search jobs, skills..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-20 w-full rounded-xl" />
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-6 flex flex-col group cursor-pointer"
                onClick={() => { setSelectedJob(job); setShowJobModal(true); }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-purple-400 transition-colors">{job.title}</h3>
                      <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                        <Building size={12} /> {job.company}
                      </p>
                    </div>
                  </div>
                  <button className="text-white/20 hover:text-pink-500 transition-colors">
                    <Bookmark size={20} />
                  </button>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge text-[10px] uppercase font-bold tracking-widest ${
                      job.type === 'internship' ? 'badge-orange' : 'badge-purple'
                    }`}>
                      {job.type}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        <MapPin size={12} /> {job.location}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-white/5 border border-white/5 text-[10px] text-white/60 px-2 py-0.5 rounded-md font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && <span className="text-[10px] text-white/30">+{job.skills.length - 3}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                      {job.postedBy?.name?.charAt(0)}
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                      Posted by {job.postedBy?.name.split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-purple-400 font-bold text-[10px] uppercase tracking-widest">
                    Apply <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-white/10" size={40} />
              </div>
              <p className="text-white/30">No jobs found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {showJobModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 relative">
                <button 
                  onClick={() => setShowJobModal(false)}
                  className="absolute right-6 top-6 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-purple-900/40">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Space Grotesk' }}>{selectedJob.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      <span className="text-purple-400 flex items-center gap-1.5"><Building size={16} /> {selectedJob.company}</span>
                      <span className="text-white/40 flex items-center gap-1.5"><MapPin size={16} /> {selectedJob.location}</span>
                      <span className="text-white/40 flex items-center gap-1.5"><DollarSign size={16} /> {selectedJob.salary || 'Competitive'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">Job Description</h4>
                  <p className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map(skill => (
                      <span key={skill} className="px-4 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                      {selectedJob.postedBy?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{selectedJob.postedBy?.name}</p>
                      <p className="text-[10px] text-white/40">{selectedJob.postedBy?.designation} @ {selectedJob.company}</p>
                    </div>
                  </div>
                  <Link to={`/profile/${selectedJob.postedBy?._id}`} className="text-xs text-purple-400 font-bold hover:underline">View Profile</Link>
                </div>
              </div>
              
              <div className="p-8 border-t border-white/5 flex gap-4">
                <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                  Save Job
                </button>
                <a 
                  href={selectedJob.applyLink || `mailto:${selectedJob.postedBy?.email}`} 
                  target="_blank" 
                  className="flex-[2] btn-primary flex items-center justify-center gap-2 rounded-2xl text-white font-black text-sm transition-all uppercase tracking-widest"
                >
                  Apply Now <ExternalLink size={18} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
