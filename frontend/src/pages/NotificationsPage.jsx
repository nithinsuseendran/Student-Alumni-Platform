import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Trash2, BookOpen, MessageCircle, 
  Briefcase, Calendar, Info, Clock, CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'mentorship_request': return <BookOpen className="text-orange-400" size={18} />;
      case 'mentorship_accepted': return <CheckCircle2 className="text-green-400" size={18} />;
      case 'message': return <MessageCircle className="text-blue-400" size={18} />;
      case 'job': return <Briefcase className="text-purple-400" size={18} />;
      case 'event': return <Calendar className="text-pink-400" size={18} />;
      default: return <Info className="text-white/40" size={18} />;
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Recent Activity</h2>
              <p className="text-white/40 text-xs">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-6 flex gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-3/4" />
                </div>
              </div>
            ))
          ) : notifications.length > 0 ? (
            notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-6 flex gap-4 relative group transition-all hover:bg-white/5 ${!n.isRead ? 'border-purple-500/30 bg-purple-500/5' : ''}`}
              >
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
                
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm">{n.title}</h4>
                    <span className="text-[10px] text-white/30 flex items-center gap-1">
                      <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mb-3 leading-relaxed">{n.message}</p>
                  {n.link && (
                    <Link 
                      to={n.link} 
                      className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Details
                    </Link>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteNotification(n._id)}
                    className="p-2 rounded-lg text-white/20 hover:text-pink-500 hover:bg-pink-500/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center glass-card">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Bell className="text-white/10" size={40} />
              </div>
              <p className="text-white/30">Your notification center is clear.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
