import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Calendar, MessageCircle, Star, ArrowRight, ChevronDown, Zap, Shield, Globe, Award, TrendingUp, BookOpen } from 'lucide-react';

const STATS = [
  { label: 'Students Connected', value: 12500, suffix: '+' },
  { label: 'Alumni Mentors', value: 3800, suffix: '+' },
  { label: 'Jobs Posted', value: 6200, suffix: '+' },
  { label: 'Events Hosted', value: 480, suffix: '+' },
];

const FEATURES = [
  { icon: Users, title: 'Smart Mentorship', desc: 'AI-matched alumni mentors based on your career goals and interests.', color: 'purple' },
  { icon: Briefcase, title: 'Job Board', desc: 'Exclusive opportunities posted directly by alumni from top companies.', color: 'pink' },
  { icon: Calendar, title: 'Live Events', desc: 'Webinars, workshops, and networking sessions with industry leaders.', color: 'orange' },
  { icon: MessageCircle, title: 'Real-Time Chat', desc: 'Instant messaging with your mentors and the alumni community.', color: 'blue' },
  { icon: Shield, title: 'Verified Alumni', desc: 'Every alumni profile is verified ensuring authentic connections.', color: 'green' },
  { icon: Globe, title: 'Global Network', desc: 'Connect with alumni across 50+ countries and 200+ companies.', color: 'purple' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Software Engineer @ Google', avatar: 'PS', text: 'AlumniConnect helped me land my dream job. My mentor guided me through every step of the process!', rating: 5 },
  { name: 'Arjun Mehta', role: 'Product Manager @ Microsoft', avatar: 'AM', text: 'The mentorship I received was invaluable. The platform makes it so easy to connect with experienced professionals.', rating: 5 },
  { name: 'Sneha Patel', role: 'Data Scientist @ Amazon', avatar: 'SP', text: 'I found my internship through AlumniConnect. The alumni community is incredibly supportive and responsive.', rating: 5 },
];

const COLORS = { purple: 'rgba(168,85,247,', pink: 'rgba(236,72,153,', orange: 'rgba(249,115,22,', blue: 'rgba(59,130,246,', green: 'rgba(34,197,94,' };

function AnimatedCounter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        let start = 0;
        const step = value / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 25);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, started]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Particle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: `radial-gradient(circle, rgba(168,85,247,0.6), transparent)` }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden" onMouseMove={handleMouseMove}>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl" style={{ fontFamily: 'Space Grotesk' }}>
            Alumni<span className="neon-text">Connect</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          {['Features', 'Community', 'Events', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors cursor-pointer">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm px-4 py-2 rounded-xl">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-xl">Get Started</Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            🚀 The Future of Student-Alumni Connections
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk' }}
          >
            Bridge the Gap Between{' '}
            <span className="neon-text">Students</span>
            {' '}&amp;{' '}
            <span className="neon-text-orange">Alumni</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            A cinematic platform where students find mentors, discover opportunities, and alumni give back — all powered by real-time connections.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register?role=student" className="btn-primary flex items-center gap-2 px-8 py-4 text-base rounded-2xl pulse-glow">
              Join as Student <ArrowRight size={18} />
            </Link>
            <Link to="/register?role=alumni" className="btn-secondary flex items-center gap-2 px-8 py-4 text-base rounded-2xl">
              Join as Alumni <Users size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
          >
            <ChevronDown size={24} className="animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="stat-card text-center"
            >
              <div className="text-3xl md:text-4xl font-black neon-text mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Everything You Need to <span className="neon-text">Succeed</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Powerful tools designed to supercharge your career journey</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="glass-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${COLORS[feat.color]}0.15)`, border: `1px solid ${COLORS[feat.color]}0.3)` }}
                >
                  <feat.icon size={22} style={{ color: `${COLORS[feat.color]}1)` }} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="community" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-16" style={{ fontFamily: 'Space Grotesk' }}
          >
            Success <span className="neon-text-orange">Stories</span>
          </motion.h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-10"
            >
              <div className="flex justify-center mb-4">
                {Array.from({ length: TESTIMONIALS[activeTestimonial].rating }).map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-white/80 leading-relaxed mb-8 italic">"{TESTIMONIALS[activeTestimonial].text}"</p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm">
                  {TESTIMONIALS[activeTestimonial].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{TESTIMONIALS[activeTestimonial].name}</div>
                  <div className="text-white/50 text-sm">{TESTIMONIALS[activeTestimonial].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-purple-500 w-6' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ fontFamily: 'Space Grotesk' }}>
              Ready to <span className="neon-text">Connect</span>?
            </h2>
            <p className="text-white/50 text-lg mb-10">Join thousands of students and alumni building meaningful connections.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary px-10 py-4 text-lg rounded-2xl flex items-center gap-2 justify-center pulse-glow">
                Start Your Journey <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'Space Grotesk' }}>AlumniConnect</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 AlumniConnect. Built with ❤️ for students everywhere.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
