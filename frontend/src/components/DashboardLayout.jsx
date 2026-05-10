import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, MessageCircle, Calendar, Briefcase,
  BookOpen, Bell, Settings, LogOut, Menu, X, Zap, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const STUDENT_NAV = [
  { to: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alumni', icon: Users, label: 'Find Alumni' },
  { to: '/mentorship', icon: BookOpen, label: 'Mentorship' },
  { to: '/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
];

const ALUMNI_NAV = [
  { to: '/alumni-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mentorship', icon: BookOpen, label: 'Mentorship' },
  { to: '/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/jobs', icon: Briefcase, label: 'Post Jobs' },
  { to: '/alumni', icon: Users, label: 'Community' },
];

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alumni', icon: Users, label: 'All Users' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
];

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const nav = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'alumni' ? ALUMNI_NAV : STUDENT_NAV;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>AlumniConnect</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/40 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User Profile */}
      <NavLink to={`/profile/${user?._id}`} className="m-4 p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-white/5 group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-xs text-white/40 capitalize">{user?.role}</p>
        </div>
        <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student-dashboard' || item.to === '/alumni-dashboard' || item.to === '/admin'}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <NavLink to={`/profile/${user?._id}`} onClick={() => mobile && setSidebarOpen(false)} className="sidebar-item">
          <User size={18} /> <span>Profile</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-item w-full text-left hover:!bg-red-500/10 hover:!text-red-400">
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-animated flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0"
        style={{ background: 'rgba(10,10,31,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
      >
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col lg:hidden"
              style={{ background: 'rgba(10,10,31,0.98)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4"
          style={{ background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <div>
            <h1 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NavLink to="/chat" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
              <MessageCircle size={20} />
            </NavLink>
            <NavLink to="/notifications" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
              <Bell size={20} />
            </NavLink>
            <NavLink to={`/profile/${user?._id}`} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
