'use client';
import { useEffect, useState } from 'react';
import { getAgents, getLeads, getConversations } from '@/lib/api';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ agents: 0, conversations: 0, leads: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAgents(), getConversations(), getLeads()])
      .then(([a, c, l]) => {
        setStats({ agents: a.agents?.length || 0, conversations: c.total || 0, leads: l.total || 0 });
        setRecentLeads((l.leads || []).slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{color:'var(--text-secondary)'}}>Loading dashboard...</p>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div className="stat-label">Active Agents</div><div className="stat-value" style={{color:'var(--primary-light)'}}>{stats.agents}</div></div>
            <div style={{width:42,height:42,borderRadius:12,background:'rgba(108,92,231,.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div className="stat-label">Conversations</div><div className="stat-value" style={{color:'var(--success)'}}>{stats.conversations}</div></div>
            <div style={{width:42,height:42,borderRadius:12,background:'rgba(85,239,196,.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div className="stat-label">Leads Collected</div><div className="stat-value" style={{color:'var(--warning)'}}>{stats.leads}</div></div>
            <div style={{width:42,height:42,borderRadius:12,background:'rgba(254,202,87,.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 style={{marginBottom:16,fontSize:18,fontWeight:600}}>Recent Leads</h2>
        {recentLeads.length === 0 ? (
          <p style={{color:'var(--text-secondary)'}}>No leads yet. Create an agent and connect to your website to start collecting.</p>
        ) : (
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Agent</th><th>Date</th></tr></thead><tbody>
            {recentLeads.map((lead) => (
              <tr key={lead.id}><td>{lead.name||'--'}</td><td>{lead.email||'--'}</td><td>{lead.phone||'--'}</td><td>{lead.agent?.name||'--'}</td><td>{new Date(lead.createdAt).toLocaleDateString()}</td></tr>
            ))}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
