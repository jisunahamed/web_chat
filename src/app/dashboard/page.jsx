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

  if (loading) return <p style={{color:'var(--text-secondary)'}}>Loading dashboard…</p>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Active Agents</div><div className="stat-value" style={{color:'var(--primary-light)'}}>{stats.agents}</div></div>
        <div className="stat-card"><div className="stat-label">Conversations</div><div className="stat-value" style={{color:'var(--success)'}}>{stats.conversations}</div></div>
        <div className="stat-card"><div className="stat-label">Leads Collected</div><div className="stat-value" style={{color:'var(--warning)'}}>{stats.leads}</div></div>
      </div>
      <div className="card">
        <h2 style={{marginBottom:16,fontSize:18,fontWeight:600}}>Recent Leads</h2>
        {recentLeads.length === 0 ? (
          <p style={{color:'var(--text-secondary)'}}>No leads yet. Connect an agent to start collecting.</p>
        ) : (
          <div className="table-wrapper"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Agent</th><th>Date</th></tr></thead><tbody>
            {recentLeads.map((lead) => (
              <tr key={lead.id}><td>{lead.name||'–'}</td><td>{lead.email||'–'}</td><td>{lead.phone||'–'}</td><td>{lead.agent?.name||'–'}</td><td>{new Date(lead.createdAt).toLocaleDateString()}</td></tr>
            ))}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
