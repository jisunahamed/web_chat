'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Bot, Zap, Globe, MessageSquare, Shield, CheckCircle, 
  ArrowRight, Download, CreditCard, MessageCircle,
  Menu, X, Sparkles, Cpu, Layers, Layout, 
  ChevronRight, Star, Play, Network, TrendingUp, Users
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getSystemSettings } from '@/app/actions/adminActions';

// --- Components ---

const Logo = ({ className = "", settings = null }) => (
  <div className={`flex items-center gap-3 group ${className}`}>
    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-all duration-500">
      {settings?.siteLogo ? (
        <img src={settings.siteLogo} alt={settings.siteName} className="w-8 h-8 object-contain" />
      ) : (
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
      )}
    </div>
    <span className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tighter uppercase italic">
      {settings?.siteName ? settings.siteName.split(' ')[0] : 'INMETECH'} 
      <span className="text-cyan-500 ml-2">
        {settings?.siteName ? settings.siteName.split(' ').slice(1).join(' ') : 'BOT'}
      </span>
    </span>
  </div>
);

const Navbar = ({ settings }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-[#070708]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <Logo settings={settings} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <div className="w-px h-4 bg-white/10" />
          {session ? (
            <Link href="/dashboard" className="px-6 py-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-all font-black shadow-xl shadow-white/10">
              Console
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="group px-6 py-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transition-all font-black shadow-xl shadow-cyan-600/40 flex items-center gap-2">
                Start Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-[80px] bg-[#070708]/95 backdrop-blur-xl z-[99] p-8 flex flex-col items-center gap-8"
          >
            {['Features', 'Demo', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-2xl font-black text-white/80 uppercase tracking-widest hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <div className="w-px h-8 bg-white/10 my-4" />
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-xl font-black text-white/50 uppercase tracking-widest">Login</Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)} className="px-8 py-4 bg-cyan-600 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-600/40 text-center">
              Start Free
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const ParticleField = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-500/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const BentoCard = ({ icon: Icon, title, desc, colSpan = "col-span-1", delay = 0, accent = "cyan" }) => {
  const accentGradients = {
    cyan: "from-cyan-500/10 to-transparent",
    blue: "from-blue-500/10 to-transparent",
    purple: "from-purple-500/10 to-transparent",
    emerald: "from-emerald-500/10 to-transparent",
  };

  const accentBorders = {
    cyan: "hover:border-cyan-500/50",
    blue: "hover:border-blue-500/50",
    purple: "hover:border-purple-500/50",
    emerald: "hover:border-emerald-500/50",
  };

  const accentIcons = {
    cyan: "text-cyan-500 group-hover:bg-cyan-600 group-hover:shadow-cyan-600/40",
    blue: "text-blue-500 group-hover:bg-blue-600 group-hover:shadow-blue-600/40",
    purple: "text-purple-500 group-hover:bg-purple-600 group-hover:shadow-purple-600/40",
    emerald: "text-emerald-500 group-hover:bg-emerald-600 group-hover:shadow-emerald-600/40",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`${colSpan} group relative p-10 bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden ${accentBorders[accent]} transition-all duration-500`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accentGradients[accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div className="relative z-10">
        <div className={`w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 ${accentIcons[accent]} group-hover:text-white transition-all duration-500 shadow-2xl`}>
          <Icon size={32} />
        </div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase leading-none">{title}</h3>
        <p className="text-white/40 text-sm leading-relaxed max-w-[280px] font-medium">{desc}</p>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="relative group p-8 bg-white/[0.03] border border-white/5 rounded-3xl hover:border-cyan-500/30 transition-all duration-500 text-center lg:text-left"
  >
    <div className="w-12 h-12 bg-cyan-600/10 rounded-2xl flex items-center justify-center text-cyan-500 mb-6 mx-auto lg:mx-0 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-500">
      <Icon size={24} />
    </div>
    <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{value}</h3>
    <p className="text-white/40 text-xs font-black uppercase tracking-widest">{label}</p>
  </motion.div>
);

const PricingCard = ({ title, price, features, premium = false, cta }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={`p-12 rounded-[48px] border relative flex flex-col ${premium ? 'bg-zinc-900 border-cyan-500 shadow-2xl shadow-cyan-600/20' : 'bg-transparent border-white/10'}`}
  >
    {premium && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-cyan-600/30">
        Highly Recommended
      </div>
    )}
    <div className="mb-10">
      <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${premium ? 'text-cyan-400' : 'text-white/40'}`}>{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-6xl font-black text-white tracking-tighter">{price}</span>
        {price !== 'Free' && <span className="text-white/30 font-bold uppercase text-xs tracking-widest">/mo</span>}
      </div>
    </div>
    
    <ul className="space-y-6 mb-12 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-4 text-sm font-medium text-white/60">
          <div className="w-5 h-5 rounded-full bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={14} className="text-cyan-500" />
          </div>
          {f}
        </li>
      ))}
    </ul>

    <Link href={premium ? "/signup" : "/login"} className={`w-full py-5 text-center rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${premium ? 'bg-white text-black hover:bg-zinc-200' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
      {cta}
    </Link>
  </motion.div>
);

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const [settings, setSettings] = useState(null);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    getSystemSettings().then(res => setSettings(res));
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070708] text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans">
      <Navbar settings={settings} />
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center pt-32 px-6 overflow-hidden">
        <ParticleField />
        
        {/* Glow Spheres */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, 60, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-cyan-600/10 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/4" 
          />
          <motion.div 
            animate={{ scale: [1.3, 1, 1.3], x: [0, -60, 0] }}
            transition={{ duration: 14, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/8 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/4" 
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl backdrop-blur-lg"
            >
              <Sparkles size={14} className="fill-cyan-400 animate-pulse" />
              Intelligence Without Limits
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-[10vw] md:text-[7vw] lg:text-[6vw] font-black tracking-[-0.04em] leading-[0.9] mb-10 text-white uppercase italic"
            >
              {settings?.siteName ? settings.siteName.split(' ')[0] : 'Enterprise'} AI <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 drop-shadow-2xl">
                {settings?.siteName ? settings.siteName.split(' ').slice(1).join(' ') : 'Evolution.'}
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
            >
              Deploy autonomous AI agents that understand your brand, 
              engage visitors, and convert leads in under 60 seconds.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href="/signup" className="group h-16 px-12 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-[0_10px_60px_-15px_rgba(6,182,212,0.4)]">
                Launch for Free
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#070708] overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-xs text-cyan-400">
                     {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="pl-4 flex flex-col justify-center text-left">
                  <div className="flex gap-1 text-amber-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">500+ Active Nodes</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-20 px-6 border-y border-white/5 bg-[#080809]">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <StatCard icon={Zap} value="0.1s" label="Response Time" delay={0.1} />
            <StatCard icon={Network} value="99.9%" label="Uptime SLA" delay={0.2} />
            <StatCard icon={Users} value="50K+" label="Active Agents" delay={0.3} />
            <StatCard icon={TrendingUp} value="340%" label="Avg ROI Boost" delay={0.4} />
          </div>
        </div>
      </section>

      {/* --- FEATURE CORE --- */}
      <section id="features" className="py-40 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-[8vw] md:text-[5vw] font-black tracking-tight leading-none uppercase mb-6">
               Engineered <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">for the Future.</span>
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full shadow-2xl shadow-cyan-600/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <BentoCard 
              colSpan="md:col-span-2"
              icon={Cpu} 
              title="Neural Precision" 
              desc="Our models adapt to your business context, delivering human-like responses with 99.9% semantic accuracy." 
              delay={0.1}
              accent="cyan"
            />
            <BentoCard 
              icon={Globe} 
              title="Global Matrix" 
              desc="Deploy nodes globally. Optimized for WordPress, Shopify, and modern web environments." 
              delay={0.2}
              accent="blue"
            />
            <BentoCard 
              icon={Shield} 
              title="Quantum Security" 
              desc="Advanced encryption for every session. Your data remains strictly authorized and isolated." 
              delay={0.3}
              accent="purple"
            />
            <BentoCard 
              colSpan="md:col-span-2"
              icon={Layers} 
              title="Lead Harvesting" 
              desc="Automatically capture, qualify, and deliver high-intent leads directly to your central console." 
              delay={0.4}
              accent="emerald"
            />
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE DEMO --- */}
      <section id="demo" className="py-40 px-6 bg-[#0c0c0e]/50 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto">
           <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="flex-1 space-y-10 text-center lg:text-left">
                 <h2 className="text-[7vw] md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                    Optimized for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Peak Performance.</span>
                 </h2>
                 <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                    Connect our specialized WordPress plugin and sync your AI core with a single API key. Production ready in minutes.
                 </p>
                 <div className="grid grid-cols-2 gap-8 justify-center">
                    <div>
                       <h4 className="text-white font-black text-3xl tracking-tighter mb-1">0.1s</h4>
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Response Latency</p>
                    </div>
                    <div>
                       <h4 className="text-white font-black text-3xl tracking-tighter mb-1">2min</h4>
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Deployment Time</p>
                    </div>
                 </div>
                 <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-[1.02]">
                    Explore Protocol <Layout size={18} className="text-cyan-500" />
                 </Link>
              </div>

              <div className="w-full lg:w-[600px] aspect-[4/5] bg-zinc-900 border border-white/10 rounded-[64px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-3 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="h-full bg-zinc-950/80 backdrop-blur-3xl rounded-[56px] border border-white/5 flex flex-col overflow-hidden relative">
                   <div className="p-8 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-600/30">
                            <Bot size={24} className="text-white" />
                         </div>
                         <div className="text-left">
                            <p className="font-black text-sm uppercase tracking-tight">System Node</p>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[10px] font-black text-emerald-500/80 uppercase">Active Core</span>
                            </div>
                         </div>
                      </div>
                      <Link href="/dashboard" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-cyan-600 transition-all text-white">
                         <Play size={16} fill="white" className="ml-0.5" />
                      </Link>
                   </div>
                   <div className="flex-1 p-8 space-y-8 overflow-y-auto text-left">
                      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="max-w-[80%] p-5 bg-zinc-900 border border-white/5 rounded-3xl rounded-bl-sm text-sm font-medium leading-relaxed">
                         Greetings. The neural bridge is active. Ready to automate your support infrastructure?
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="max-w-[80%] ml-auto p-5 bg-cyan-600 text-white rounded-3xl rounded-br-sm text-sm font-bold leading-relaxed shadow-xl shadow-cyan-600/20">
                         Initiate WordPress sync protocol.
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="max-w-[80%] p-5 bg-zinc-900 border border-white/5 rounded-3xl rounded-bl-sm text-sm font-medium leading-relaxed">
                         Confirmed. Download the {settings?.siteName || 'InmeTech'} Plugin from the console, enter your unique key, and deployment will commence.
                      </motion.div>
                   </div>
                   <div className="p-8">
                     <div className="h-14 bg-white/5 border border-white/5 rounded-2xl px-6 flex items-center justify-between text-white/30 text-xs font-medium">
                        Requesting neural link...
                        <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white">
                           <Zap size={14} className="fill-white" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-40 px-6">
        <div className="container mx-auto">
           <div className="text-center mb-32 max-w-3xl mx-auto">
              <h2 className="text-[7vw] md:text-5xl font-black uppercase tracking-tight mb-8">Ecosystem Access.</h2>
              <p className="text-white/40 text-lg font-medium leading-relaxed italic">
                 Precision-engineered plans for every scale.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <PricingCard 
                title="Free Prototype"
                price="Free"
                features={[
                  "1 Autonomous Agent Node",
                  "Free Forever",
                  "WhatsApp & Web Integration",
                  "Standard Response Core",
                  "Visual Customization"
                ]}
                cta="Start for Free"
                premium={false}
              />
              <PricingCard 
                title="Sovereign Protocol"
                price="600৳"
                premium
                features={[
                  "Unlimited Agent Nodes",
                  "Infinite Usage Lifecycle",
                  "Priority Neural Processing",
                  "Whitelabel Integration",
                  "Advanced Lead Analytics",
                  "24/7 Priority Support"
                ]}
                cta="Upgrade Protocol"
              />
           </div>
           
           <p className="text-center mt-20 text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">
              Authorized Gateways: <span className="text-rose-500">BKash</span> • <span className="text-orange-500">Nagad</span> • <span className="text-indigo-500">Nexus</span>
           </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-32 px-6 bg-black border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-600 to-transparent" />
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24 text-center md:text-left">
             <div className="lg:col-span-2">
                <Logo settings={settings} className="justify-center md:justify-start mb-10" />
                <p className="text-white/30 text-lg font-medium max-w-sm leading-relaxed mb-12 mx-auto md:mx-0">
                   Neural infrastructure for the commerce of tomorrow. Intelligent. Secure. Sovereign.
                </p>
                <div className="flex gap-6 justify-center md:justify-start">
                   {[MessageSquare, Globe, Shield].map((Icon, i) => (
                     <div key={i} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 hover:bg-cyan-600 hover:text-white transition-all cursor-pointer border border-white/5">
                        <Icon size={24} />
                     </div>
                   ))}
                </div>
             </div>
             
             <div>
                <h5 className="font-black text-xs uppercase tracking-widest text-white mb-10">Neural Architecture</h5>
                <ul className="space-y-6 text-white/40 text-sm font-bold uppercase tracking-wider">
                   <li><a href="#features" className="hover:text-white transition-colors">Core Systems</a></li>
                   <li><a href="#demo" className="hover:text-white transition-colors">Live Simulation</a></li>
                   <li><a href="#pricing" className="hover:text-white transition-colors">Ecosystem Plans</a></li>
                   <li><Link href="/login" className="text-cyan-500">System Console</Link></li>
                </ul>
             </div>

             <div>
                <h5 className="font-black text-xs uppercase tracking-widest text-white mb-10">Protocols</h5>
                <ul className="space-y-6 text-white/40 text-sm font-bold uppercase tracking-wider">
                   <li><a href="#" className="hover:text-white transition-colors">Data Privacy</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                   <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                </ul>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-8">
             <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                © {new Date().getFullYear()} {settings?.siteName ? settings.siteName.toUpperCase() : 'INMETECH NEURAL SYSTEMS'}. ALL PROTOCOLS RESERVED.
             </p>
             <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
                Engineered for <Sparkles size={12} className="text-cyan-600" /> High Intelligence
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
