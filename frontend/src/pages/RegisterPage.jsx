import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, Building, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ROLES = [
  { id: 'student', label: 'Student', desc: 'Find mentors & opportunities', icon: GraduationCap, color: 'purple' },
  { id: 'alumni', label: 'Alumni', desc: 'Mentor students & give back', icon: Building, color: 'pink' },
];

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(params.get('role') || '');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', course: '', year: '',
    company: '', designation: '', domain: '', graduationYear: '',
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const upd = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!role) return toast.error('Select your role');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, password: form.password, role };
    if (role === 'student') Object.assign(payload, { college: form.college, course: form.course, year: form.year });
    if (role === 'alumni') Object.assign(payload, { company: form.company, designation: form.designation, domain: form.domain, graduationYear: form.graduationYear });
    const res = await register(payload);
    if (res.success) {
      toast.success(`Welcome, ${res.user.name}! 🎉`);
      if (role === 'alumni') navigate('/alumni-dashboard');
      else navigate('/student-dashboard');
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl" style={{ fontFamily: 'Space Grotesk' }}>AlumniConnect</span>
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Space Grotesk' }}>Create Account</h1>
          <p className="text-white/50">Join the community today</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 'bg-white/10 text-white/30'}`}>{s}</div>
              {s < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleStep1} className="space-y-5">
                {/* Role Selection */}
                <div>
                  <label className="text-sm text-white/60 mb-3 block">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(r => (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${role === r.id ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                      >
                        <r.icon size={20} className={role === r.id ? 'text-purple-400 mb-2' : 'text-white/40 mb-2'} />
                        <div className="font-semibold text-sm">{r.label}</div>
                        <div className="text-xs text-white/40 mt-0.5">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" placeholder="John Doe" value={form.name} onChange={e => upd('name', e.target.value)} className="input-field pl-10" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={e => upd('email', e.target.value)} className="input-field pl-10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={e => upd('password', e.target.value)} className="input-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Confirm</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••" value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} className="input-field pl-10" />
                    </div>
                  </div>
                </div>

                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 rounded-xl font-semibold">
                  Continue <ArrowRight size={18} />
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-5">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-2">
                  <ArrowLeft size={16} /> Back
                </button>

                <h3 className="font-semibold text-white/80">
                  {role === 'student' ? '📚 Student Details' : '💼 Professional Details'}
                </h3>

                {role === 'student' && (
                  <>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">College / University</label>
                      <input placeholder="MIT, Stanford..." value={form.college} onChange={e => upd('college', e.target.value)} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">Course</label>
                        <input placeholder="B.Tech CSE" value={form.course} onChange={e => upd('course', e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">Year</label>
                        <select value={form.year} onChange={e => upd('year', e.target.value)} className="input-field">
                          <option value="">Select</option>
                          {['1st', '2nd', '3rd', '4th', 'Final'].map(y => <option key={y} value={y}>{y} Year</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {role === 'alumni' && (
                  <>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Company</label>
                      <input placeholder="Google, Microsoft..." value={form.company} onChange={e => upd('company', e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Designation</label>
                      <input placeholder="Software Engineer" value={form.designation} onChange={e => upd('designation', e.target.value)} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">Domain</label>
                        <input placeholder="Technology" value={form.domain} onChange={e => upd('domain', e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">Grad Year</label>
                        <input placeholder="2020" value={form.graduationYear} onChange={e => upd('graduationYear', e.target.value)} className="input-field" />
                      </div>
                    </div>
                  </>
                )}

                <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 rounded-xl font-semibold">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <> Create Account 🚀 </>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-5 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
