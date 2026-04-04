'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Bot, Zap, Globe, MessageSquare, Shield, CheckCircle, 
  ArrowRight, Download, CreditCard, MessageCircle,
  Menu, X, Sparkles, Cpu, Layers, Layout, 
  ChevronRight, Star, Play
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// --- Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/40 transform -rotate-6">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tighter">
            INMETECH
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <div className="w-px h-4 bg-white/10" />
          {session ? (
            <Link href="/dashboard" className="px-6 py-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-all font-black shadow-xl shadow-white/10">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="group px-6 py-3 bg-violet-600 text-white rounded-full hover:bg-violet-500 transition-all font-black shadow-xl shadow-violet-600/40 flex items-center gap-2">
                Start Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const BentoCard = ({ icon: Icon, title, desc, colSpan = "col-span-1", delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className={`${colSpan} group relative p-10 bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden hover:border-violet-500/50 transition-all duration-500`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative z-10">
      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-violet-500 mb-8 border border-white/5 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500 shadow-2xl group-hover:shadow-violet-600/40">
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase leading-none">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed max-w-[280px] font-medium">{desc}</p>
    </div>
  </motion.div>
);

const PricingCard = ({ title, price, features, premium, cta }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={`p-12 rounded-[48px] border relative flex flex-col ${premium ? 'bg-zinc-900 border-violet-500 shadow-2xl shadow-violet-600/20' : 'bg-transparent border-white/10'}`}
  >
    {premium && (
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-violet-600/30">
        Highly Recommended
      </div>
    )}
    <div className="mb-10">
      <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${premium ? 'text-violet-400' : 'text-white/40'}`}>{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-6xl font-black text-white tracking-tighter">{price}</span>
        {price !== 'Free' && <span className="text-white/30 font-bold uppercase text-xs tracking-widest">/mo</span>}
      </div>
    </div>
    
    <ul className="space-y-6 mb-12 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-4 text-sm font-medium text-white/60">
          <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={14} className="text-violet-500" />
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
  const [chatOpen, setChatOpen] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070708] text-white selection:bg-violet-500/30 overflow-x-hidden font-sans">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center pt-32 px-6 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-violet-600/15 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/4" 
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 blur-[140px] rounded-full translate-y-1/3 -translate-x-1/4" 
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl backdrop-blur-lg"
            >
              <Sparkles size={14} className="fill-violet-400 animate-pulse" />
              Intelligence Meets Automation
            </motion.div>

            <motion.h1 
              style={{ y: heroY, opacity }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-[12vw] md:text-[9vw] lg:text-[7.5vw] font-black tracking-[-0.04em] leading-[0.85] mb-10 text-white uppercase italic"
            >
              The AI Core for <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-400 to-indigo-400 drop-shadow-2xl">Hyper-Growth.</span>
            </motion.h1>

            <motion.p 
              style={{ opacity }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-16 font-medium leading-relaxed"
            >
              Transform your website with sophisticated AI agents that speak your brand's language. 
              Built for speed. Optimized for conversion. Setup in 60 seconds.
            </motion.p>

            <motion.div 
              style={{ opacity }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href="/signup" className="group h-16 px-10 bg-white text-black rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-[0_10px_60px_-15px_rgba(255,255,255,0.3)]">
                Try for Free
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#070708] overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-xs">
                     {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="pl-4 flex flex-col justify-center text-left">
                  <div className="flex gap-1 text-amber-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">500+ Trusted Partners</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURE CORE (Bento Grid) --- */}
      <section id="features" className="py-40 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-[8vw] md:text-[5vw] font-black tracking-tight leading-none uppercase mb-6 drop-shadow-lg">
               Futuristic <br/> Components.
            </h2>
            <div className="h-1.5 w-24 bg-violet-600 mx-auto rounded-full shadow-2xl shadow-violet-600/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <BentoCard 
              colSpan="md:col-span-2"
              icon={Cpu} 
              title="Neural Precision" 
              desc="Our models adapt to your business context, delivering human-like responses with 99.9% semantic accuracy." 
              delay={0.1}
            />
            <BentoCard 
              icon={Globe} 
              title="Global Grid" 
              desc="Deploy once, integrate everywhere. Optimized for WordPress, Shopify, and standard web stacks." 
              delay={0.2}
            />
            <BentoCard 
              icon={Shield} 
              title="Data Shield" 
              desc="Enterprise-grade encryption for every conversation. Your customer data remains 100% private and protected." 
              delay={0.3}
            />
            <BentoCard 
              colSpan="md:col-span-2"
              icon={Layers} 
              title="Lead Harvesting" 
              desc="Automatically capture, qualify, and deliver high-intent leads directly to your dashboard or CRM of choice." 
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE DEMO (Bento Style) --- */}
      <section id="demo" className="py-40 px-6 bg-[#0c0c0e]/50 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto">
           <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="flex-1 space-y-10">
                 <h2 className="text-[7vw] md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                    Built for <br/> <span className="text-violet-500">Speed.</span>
                 </h2>
                 <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md">
                    Connect our specialized WordPress plugin and sync your AI core with a single API key. No manual coding required. 
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <h4 className="text-white font-black text-3xl tracking-tighter mb-1">0.1s</h4>
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Response Latency</p>
                    </div>
                    <div>
                       <h4 className="text-white font-black text-3xl tracking-tighter mb-1">2min</h4>
                       <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Avg. Integration</p>
                    </div>
                 </div>
                 <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-[1.02]">
                    Explore Documentation <Layout size={18} className="text-violet-500" />
                 </Link>
              </div>

              <div className="w-full lg:w-[600px] aspect-[4/5] bg-zinc-900 border border-white/10 rounded-[64px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-3 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="h-full bg-zinc-950/80 backdrop-blur-3xl rounded-[56px] border border-white/5 flex flex-col overflow-hidden relative">
                   <div className="p-8 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/30">
                            <Bot size={24} className="text-white" />
                         </div>
                         <div>
                            <p className="font-black text-sm uppercase tracking-tight">AI Assistant</p>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[10px] font-black text-emerald-500/80 uppercase">Active Core</span>
                            </div>
                         </div>
                      </div>
                      <Link href="/dashboard" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-violet-600 transition-all">
                         <Play size={16} fill="white" className="text-white ml-0.5" />
                      </Link>
                   </div>
                   <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="max-w-[80%] p-5 bg-zinc-900 border border-white/5 rounded-3xl rounded-bl-sm text-sm font-medium leading-relaxed">
                         Greetings. I'm the InmeTech integration agent. Ready to automate your website's support?
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="max-w-[80%] ml-auto p-5 bg-violet-600 text-white rounded-3xl rounded-br-sm text-sm font-bold leading-relaxed shadow-xl shadow-violet-600/20">
                         Yes, let's connect it to my WordPress site.
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="max-w-[80%] p-5 bg-zinc-900 border border-white/5 rounded-3xl rounded-bl-sm text-sm font-medium leading-relaxed">
                         Perfect. Download our <b>WP Plugin</b> from the dashboard, enter your Secret Key, and we're live. No code required.
                      </motion.div>
                   </div>
                   <div className="p-8">
                     <div className="h-14 bg-white/5 border border-white/5 rounded-2xl px-6 flex items-center justify-between text-white/30 text-xs font-medium">
                        Speak with Intelligence...
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                           <Zap size={14} className="fill-white" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- PRICING REDESIGN --- */}
      <section id="pricing" className="py-40 px-6">
        <div className="container mx-auto">
           <div className="text-center mb-32 max-w-3xl mx-auto">
              <h2 className="text-[7vw] md:text-5xl font-black uppercase tracking-tight mb-8">Ecosystem Tiers.</h2>
              <p className="text-white/40 text-lg font-medium leading-relaxed italic">
                 Start for free. Scale to the moon.
              </p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <PricingCard 
                title="Exploration Phase"
                price="Free"
                features={[
                  "1 Autonomous Agent",
                  "14-Day Free Access",
                  "WordPress Sync Support",
                  "Standard Latency",
                  "Core Customization"
                ]}
                cta="Start Exploring"
              />
              <PricingCard 
                title="Professional Protocol"
                price="500৳"
                premium
                features={[
                  "10 Autonomous Agents",
                  "Lifetime Usage License",
                  "Priority Neural Access",
                  "Whitelabel Integration",
                  "Advanced Lead Hub",
                  "Premium Support 24/7"
                ]}
                cta="Establish Protocol"
              />
           </div>
           
           <p className="text-center mt-20 text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">
              Supported Gateways: <span className="text-rose-500">BKash</span> • <span className="text-orange-500">Nagad</span> • <span className="text-indigo-500">Nexus</span>
           </p>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <footer className="py-32 px-6 bg-black border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-600 to-transparent" />
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
             <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-10">
                   <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center transform rotate-6">
                      <Bot className="text-white" size={28} />
                   </div>
                   <span className="text-3xl font-black tracking-tighter italic uppercase">INMETECH</span>
                </div>
                <p className="text-white/30 text-lg font-medium max-w-sm leading-relaxed mb-12">
                   Building the neural infrastructure for the websites of tomorrow. Smart. Secure. Scalable.
                </p>
                <div className="flex gap-6">
                   {[MessageSquare, Globe, Shield].map((Icon, i) => (
                     <div key={i} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/50 hover:bg-violet-600 hover:text-white transition-all cursor-pointer border border-white/5">
                        <Icon size={24} />
                     </div>
                   ))}
                </div>
             </div>
             
             <div>
                <h5 className="font-black text-xs uppercase tracking-widest text-white mb-10">System Architecture</h5>
                <ul className="space-y-6 text-white/40 text-sm font-bold uppercase tracking-wider">
                   <li><a href="#features" className="hover:text-white transition-colors">Neural Core</a></li>
                   <li><a href="#demo" className="hover:text-white transition-colors">Live Simulation</a></li>
                   <li><a href="#pricing" className="hover:text-white transition-colors">Ecosystem Plans</a></li>
                   <li><Link href="/login" className="text-violet-500">Access Console</Link></li>
                </ul>
             </div>

             <div>
                <h5 className="font-black text-xs uppercase tracking-widest text-white mb-10">Protocols</h5>
                <ul className="space-y-6 text-white/40 text-sm font-bold uppercase tracking-wider">
                   <li><a href="#" className="hover:text-white transition-colors">Privacy Guard</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Terms of Ops</a></li>
                   <li><a href="/dashboard/docs" className="hover:text-white transition-colors">Documentation</a></li>
                </ul>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-8">
             <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                © 2026 INMETECH NEURAL SYSTEMS. DISTRIBUTED VIA THE CLOUD.
             </p>
             <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
                Engineered for <Sparkles size={12} className="text-violet-600" /> Intelligence
             </div>
          </div>
        </div>
      </footer>

      {/* --- FLOATING CHAT TRIGGER --- */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 6 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-violet-600/50 z-[1000] border border-white/20"
      >
        <AnimatePresence mode="wait">
          {chatOpen ? <X key="x" size={32} /> : <MessageCircle key="mc" size={36} />}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default LandingPage;
