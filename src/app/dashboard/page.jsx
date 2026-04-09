'use client';
import { useEffect, useState } from 'react';
import { getAgents, getLeads, getConversations, getAnalytics } from '@/lib/api';
import { getSystemSettings } from '@/app/actions/adminActions';
import { Download, Zap, Shield, AlertCircle, CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ agents: 0, conversations: 0, leads: 0, views: 0, clicks: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [pluginInfo, setPluginInfo] = useState({ version: '1.0.4', path: '/inmetech_chatbot.zip' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [a, c, l, an, settings] = await Promise.allSettled([
          getAgents(),
          getConversations(),
          getLeads(),
          getAnalytics('detailed=true'),
          getSystemSettings()
        ]);

        if (settings.status === 'fulfilled' && settings.value) {
          setPluginInfo({
            version: settings.value.pluginVersion || '1.0.4',
            path: settings.value.pluginZipPath || '/inmetech_chatbot.zip'
          });
        }

        const newStats = { ...stats };
        
        if (a.status === 'fulfilled') {
          newStats.agents = a.value.agents?.length || 0;
          
          const isAdmin = session?.user?.role === 'admin';
          setUserInfo({
            isPremium: isAdmin || false,
            trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            agentLimit: isAdmin ? 999 : 1
          });
        }
        if (c.status === 'fulfilled') newStats.conversations = c.value.total || 0;
        if (l.status === 'fulfilled') {
          newStats.leads = l.value.total || 0;
          setRecentLeads((l.value.leads || []).slice(0, 5));
        }
        if (an.status === 'fulfilled') {
          newStats.views = an.value.views || 0;
          newStats.clicks = an.value.clicks || 0;
          setLogs(an.value.logs?.slice(0, 15) || []);
        }

        setStats(newStats);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-zinc-500 p-8">Initializing neural dashboard...</p>;

  return (
    <div className="animate-in space-y-8">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 uppercase">Control Center</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-3">
           {userInfo?.isPremium ? (
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Shield size={14} /> Premium Account
             </div>
           ) : (
             <Link href="/dashboard/billing" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-violet-600/20 hover:scale-105 transition-all">
                <Zap size={14} className="fill-white" /> Upgrade to Pro
             </Link>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Agents', val: stats.agents, color: 'text-violet-400', icon: Package },
          { label: 'Views', val: stats.views, color: 'text-fuchsia-400', icon: Shield },
          { label: 'Clicks', val: stats.clicks, color: 'text-pink-400', icon: Zap },
          { label: 'Chats', val: stats.conversations, color: 'text-emerald-400', icon: CheckCircle },
          { label: 'Leads', val: stats.leads, color: 'text-amber-400', icon: AlertCircle },
        ].map((s, i) => (
          <div key={i} className="bg-[#0c0c0e] border border-white/5 p-6 rounded-3xl">
             <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">{s.label}</p>
             <div className="flex items-center justify-between">
                <h3 className={`text-2xl font-black ${s.color}`}>{s.val}</h3>
                <s.icon size={18} className="text-zinc-800" />
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
               Recent Leads <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-zinc-500">{recentLeads.length}</span>
            </h2>
            {recentLeads.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-zinc-600 text-sm italic">No leads detected yet. Launch your agent to start collecting. </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead className="bg-white/[0.01]">
                    <tr>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Name</th>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Contact</th>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Agent</th>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="font-bold text-white text-sm">{lead.name||'--'}</td>
                        <td className="text-zinc-500 text-xs">{lead.email || lead.phone ||'--'}</td>
                        <td className="text-zinc-400 text-xs">{lead.agent?.name||'--'}</td>
                        <td className="text-zinc-600 text-[10px]">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-6 lg:p-10 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-xl uppercase tracking-tighter">Recent Analytics</h2>
            </div>
            
            {logs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                <AlertCircle size={32} className="mb-4 text-zinc-600" />
                <p className="font-bold uppercase tracking-widest text-xs">No analytics data yet</p>
                <p className="text-zinc-600 text-[10px] uppercase mt-2">Views and clicks will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.01]">
                    <tr>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Type</th>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Agent</th>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Date/Time</th>
                      <th className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Page URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="text-xs">
                          <span className={`px-2 py-1 rounded inline-block uppercase text-[9px] font-black tracking-widest ${log.type === 'click' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="text-zinc-400 text-xs font-bold">{log.agent?.name||'--'}</td>
                        <td className="text-zinc-600 text-[10px] uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="text-zinc-500 text-[10px]" style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={log.pageUrl}>
                          {log.pageUrl||'Unknown Page'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[32px] p-8 text-white shadow-2xl shadow-violet-600/10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Download size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-lg uppercase tracking-tighter">WP Plugin</h3>
                    <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Version {pluginInfo.version}</p>
                 </div>
              </div>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                 Install our specialized WordPress plugin to connect your AI agents seamlessly to your site.
              </p>
              <a href={pluginInfo.path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-black/10">
                 Download ZIP <ArrowRight size={14} />
              </a>
           </div>

           <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-8">
              <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-zinc-400">Account status</h4>
              {!userInfo?.isPremium && (
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Trial Period</span>
                      <span className="text-white font-bold">14 Days Left</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[80%] bg-violet-600" />
                   </div>
                   <p className="text-[10px] text-zinc-600 leading-relaxed">
                      Your 14-day free trial will end on {userInfo?.trialEndsAt.toLocaleDateString()}. Upgrade to Pro to keep your agents alive.
                   </p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
