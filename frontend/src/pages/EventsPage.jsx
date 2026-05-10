import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, Video, 
  ExternalLink, Search, Filter, Plus, ChevronRight,
  Bookmark, CheckCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventForm, setEventForm] = useState({ 
    title: '', description: '', type: 'webinar', date: '', 
    duration: '1 hour', link: '', platform: 'Zoom' 
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events', { params: { status: filter } });
      setEvents(data.events);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', eventForm);
      toast.success('Event created and submitted for approval!');
      setShowCreateModal(false);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to create event');
    }
  };

  const handleRegister = async (id) => {
    try {
      await api.post(`/events/${id}/register`);
      toast.success('Updated registration status');
      fetchEvents();
    } catch (err) {
      toast.error('Registration failed');
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Events & Webinars">
      <div className="max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
            {['upcoming', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  filter === status ? 'btn-primary shadow-lg shadow-purple-900/40' : 'text-white/40 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                placeholder="Search events..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
            {(user.role === 'alumni' || user.role === 'admin') && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
              >
                <Plus size={18} /> Create Event
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="skeleton h-40 rounded-2xl" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-10 w-full" />
              </div>
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden flex flex-col group"
              >
                <div className="h-40 bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                  <div className="absolute top-4 right-4 bg-[#050510]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase tracking-widest text-purple-400">
                    {event.type}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                    <button className="btn-primary px-6 py-2 rounded-xl text-xs font-bold">Details</button>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">
                    <Calendar size={12} className="text-purple-500" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="mx-1">•</span>
                    <Clock size={12} className="text-purple-500" />
                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <h3 className="text-lg font-black mb-3 line-clamp-1" style={{ fontFamily: 'Space Grotesk' }}>{event.title}</h3>
                  <p className="text-white/50 text-sm mb-6 line-clamp-2 flex-1">{event.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold">
                        {event.host?.avatar ? <img src={event.host.avatar} className="w-full h-full rounded-full" /> : event.host?.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{event.host?.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{event.host?.designation} @ {event.host?.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Users size={14} className="text-blue-400" />
                        <span>{event.registrations?.length} Registered</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Video size={14} className="text-orange-400" />
                        <span>{event.platform}</span>
                      </div>
                    </div>
                  </div>
                  
                  {filter === 'upcoming' ? (
                    <button 
                      onClick={() => handleRegister(event._id)}
                      className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        event.registrations?.includes(user._id)
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {event.registrations?.includes(user._id) ? (
                        <span className="flex items-center justify-center gap-2"><CheckCircle size={14} /> Registered</span>
                      ) : 'Register Now'}
                    </button>
                  ) : (
                    <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-white/30 text-xs font-bold cursor-not-allowed">
                      Event Completed
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-white/10" size={40} />
              </div>
              <p className="text-white/30">No {filter} events found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Space Grotesk' }}>Host an Event</h3>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Event Title</label>
                <input 
                  placeholder="e.g. Masterclass on System Design" 
                  value={eventForm.title}
                  onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                  className="input-field" required 
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Description</label>
                <textarea 
                  placeholder="What will students learn?" 
                  value={eventForm.description}
                  onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                  className="input-field h-24 resize-none" required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Type</label>
                  <select 
                    value={eventForm.type}
                    onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))}
                    className="input-field"
                  >
                    <option value="webinar">Webinar</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Duration</label>
                  <input 
                    placeholder="e.g. 1.5 Hours" 
                    value={eventForm.duration}
                    onChange={e => setEventForm(p => ({ ...p, duration: e.target.value }))}
                    className="input-field" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={eventForm.date}
                    onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))}
                    className="input-field" required 
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Platform</label>
                  <input 
                    placeholder="Zoom, Google Meet" 
                    value={eventForm.platform}
                    onChange={e => setEventForm(p => ({ ...p, platform: e.target.value }))}
                    className="input-field" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Meeting Link</label>
                <input 
                  placeholder="https://..." 
                  value={eventForm.link}
                  onChange={e => setEventForm(p => ({ ...p, link: e.target.value }))}
                  className="input-field" 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1 py-3 rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 py-3 rounded-2xl"
                >
                  Create Event
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
