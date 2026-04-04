'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Zap, Globe, MessageSquare, Shield, CheckCircle, 
  ArrowRight, Download, CreditCard, MessageCircle,
  Menu, X
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/70 backdrop-blur-lg py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tighter">
            INMETECH
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#download" className="hover:text-white transition-colors">Plugin</a>
          {session ? (
            <Link href="/dashboard" className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-white/90 transition-all font-bold">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="px-5 py-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-500 transition-all font-bold shadow-lg shadow-violet-600/20">
                Try for Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group p-8 bg-zinc-900/50 border border-white/5 rounded-3xl hover:border-violet-500/50 transition-all duration-500"
  >
    <div className="w-14 h-14 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500 text-violet-500">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const PricingCard = ({ title, price, features, highlighted, cta, trial }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className={`p-10 rounded-[32px] border relative ${highlighted ? 'bg-zinc-900 border-violet-500 shadow-2xl shadow-violet-600/10' : 'bg-transparent border-white/10'}`}
  >
    {trial && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-[10px] uppercase font-black tracking-widest text-white shadow-lg">
        Best for Beginners
      </div>
    )}
    <h4 className="text-lg font-bold text-white/60 mb-2">{title}</h4>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-5xl font-black text-white tracking-tighter">{price}</span>
      {price !== 'Free' && <span className="text-white/40 font-medium">/month</span>}
    </div>
    <ul className="space-y-4 mb-10">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm text-white/70">
          <CheckCircle size={18} className="text-violet-500 flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    <Link href={highlighted ? "/signup" : "/login"} className={`block w-full py-4 text-center rounded-2xl font-bold transition-all ${highlighted ? 'bg-white text-black hover:bg-zinc-200' : 'bg-white/5 text-white hover:bg-white/10'}`}>
      {cta}
    </Link>
  </motion.div>
);

const LandingPage = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Nav />
      
      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-violet-400 text-xs font-bold uppercase tracking-wider mb-8"
          >
            <Zap size={14} className="fill-violet-400" />
            Empowering 500+ Businesses Globally
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 max-w-5xl mx-auto"
          >
            Revolutionize your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400">Customer Support.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12"
          >
            Connect AI Chatbots to your WordPress site in minutes. Automate leads, 
            support, and sales with our advanced SaaS platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="group px-8 py-4 bg-white text-black rounded-2xl font-black text-lg flex items-center gap-2 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-white/10">
              Get Started for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Floating Chat Container (Demo) */}
      <section id="demo" className="py-20 px-6 bg-zinc-950/50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto grid md:grid-columns-2 gap-20 items-center">
            <div>
               <h2 className="text-4xl font-black mb-6 tracking-tighter">Your Smart AI <br/> Assistant is Ready.</h2>
               <p className="text-white/50 mb-8 max-w-md">Our chatbots learn from your data to provide accurate, human-like responses 24/7. Never miss a lead again.</p>
               <div className="space-y-4">
                  {[
                    "Auto Lead Capture",
                    "Seamless Website Integration",
                    "Multi-language Support",
                    "Custom Brand Identity"
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-violet-600/20 rounded-full flex items-center justify-center text-violet-500">
                        <CheckCircle size={14} />
                      </div>
                      <span className="font-medium text-white/80">{t}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-violet-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-zinc-900 border border-white/10 rounded-[40px] p-2 aspect-[4/3] shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-zinc-800/50 px-6 py-4 flex items-center justify-between border-bottom border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-600 rounded-full" />
                    <span className="font-bold">InmeTech Assistant</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500/20 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500/20 rounded-full" />
                    <div className="w-3 h-3 bg-green-500/20 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  <div className="max-w-[70%] p-4 bg-zinc-800 rounded-2xl rounded-bl-sm text-sm">
                    Hi! I'm your InmeTech AI assistant. How can I help you setup your business chatbot today?
                  </div>
                  <div className="max-w-[70%] ml-auto p-4 bg-violet-600 rounded-2xl rounded-br-sm text-sm">
                    I want to connect it to my WordPress site.
                  </div>
                  <div className="max-w-[70%] p-4 bg-zinc-800 rounded-2xl rounded-bl-sm text-sm flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    Great! You can download our WordPress plugin from the dashboard and use your API key to sync instantly!
                  </div>
                </div>
                <div className="p-4 bg-zinc-800/30">
                  <div className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/30 flex justify-between items-center">
                    Type a message...
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                      <Zap size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">Powerful Features</h2>
            <div className="w-20 h-1.5 bg-violet-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Globe} 
              title="Global Access" 
              desc="Deploy your chatbot on any website using our simple JS widget or WP plugin." 
              delay={0.1}
            />
            <FeatureCard 
              icon={Shield} 
              title="Identity Guard" 
              desc="Securely manage allowed domains to ensure your chatbot only runs where you want it." 
              delay={0.2}
            />
            <FeatureCard 
              icon={Zap} 
              title="Instant Setup" 
              desc="Sign up, create your agent, and start chatting in less than 60 seconds." 
              delay={0.3}
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="Human Tone" 
              desc="Customize your AI's personality to match your brand's voice perfectly." 
              delay={0.4}
            />
            <FeatureCard 
              icon={Bot} 
              title="Advanced Models" 
              desc="Powered by premium AI models to handle complex queries with ease." 
              delay={0.5}
            />
            <FeatureCard 
              icon={CheckCircle} 
              title="Lead Management" 
              desc="Automatically collect visitor name, email, and phone for your sales team." 
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black tracking-tight mb-6 uppercase">Pricing tailored <br/> for growth.</h2>
            <p className="text-white/50">Simple, transparent, and flexible.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <PricingCard 
              title="Free Trial"
              price="Free"
              trial
              features={[
                "1 AI Agent",
                "14 Days Trial",
                "Full Customization",
                "WP Plugin Support",
                "Community Support"
              ]}
              cta="Star Free Trial"
            />
            <PricingCard 
              title="Professional"
              price="500৳"
              highlighted
              features={[
                "10 AI Agents",
                "Unlimited Messages",
                "Priority Support",
                "Advanced Analytics",
                "White labeling",
                "WhatsApp Integration"
              ]}
              cta="Get Started Now"
            />
          </div>
          
          <p className="text-center mt-12 text-white/40 text-sm">
            Payments accepted via <span className="text-rose-400 font-bold">bKash</span> and <span className="text-orange-400 font-bold">Nagad</span>.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto grid md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
              <Bot className="text-violet-600" size={32} />
              <span className="text-2xl font-black tracking-tighter">INMETECH</span>
            </div>
            <p className="text-white/40 max-w-sm mb-8 mx-auto md:mx-0">
              The ultimate AI chatbot platform for small to large scale businesses. 
              Built with precision and love in InmeTech laboratories.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-violet-600 transition-all cursor-pointer">
                <MessageSquare size={20} />
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-violet-600 transition-all cursor-pointer">
                <MessageSquare size={20} />
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-bold mb-6">Product</h5>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6">Support</h5>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="mailto:support@inmetech.com" className="hover:text-white transition-colors text-violet-400">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto mt-20 pt-10 border-t border-white/5 text-center text-white/20 text-xs">
          © 2026 InmeTech AI Systems. All rights reserved.
        </div>
      </footer>

      {/* Floating Demo Chat Trigger */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-violet-600/40 hover:scale-110 active:scale-95 transition-all z-[100]"
      >
        {chatOpen ? <X size={28} /> : <MessageCircle size={32} />}
      </motion.button>

      {/* Actual Chatbot Widget Simulation */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-28 right-8 w-[380px] h-[520px] bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-[100]"
          >
            <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black">I</div>
                <div>
                  <h6 className="font-bold">faahh Assistant</h6>
                  <p className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto h-[350px]">
              <div className="max-w-[80%] p-3 bg-zinc-800 rounded-2xl rounded-bl-sm text-sm">
                Hi! I'm the InmeTech demo chatbot. You can setup a bot just like me for your business!
              </div>
            </div>
            <div className="p-4 border-t border-white/5 space-y-4">
              <div className="flex gap-2">
                <input disabled className="flex-1 bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm" placeholder="Type a message..." />
                <button className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                   <Zap size={16} />
                </button>
              </div>
              <div className="text-[10px] text-center text-white/20">
                Powered by <span className="font-bold text-white/40">InmeTech.com</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
