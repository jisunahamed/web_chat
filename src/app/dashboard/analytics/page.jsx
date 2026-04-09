'use client';
import { useEffect, useState } from 'react';
import { getAnalytics } from '@/lib/api';
import { Activity, MousePointerClick, Eye, Globe } from 'lucide-react';

export default function AnalyticsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ views: 0, clicks: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics('detailed=true').then(d => {
      setStats({ views: d.views || 0, clicks: d.clicks || 0, total: d.total || 0 });
      setLogs(d.logs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Analytics Logs</h1>
        <span style={{color:'var(--text-secondary)',fontSize:14}}>Detailed Engagement</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:20,marginBottom:32}}>
        <div className="stat-card">
          <div className="stat-icon"><Activity size={20} /></div>
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Eye size={20} /></div>
          <div className="stat-label">Widget Views</div>
          <div className="stat-value" style={{color:'var(--primary)'}}>{stats.views}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><MousePointerClick size={20} /></div>
          <div className="stat-label">Widget Clicks</div>
          <div className="stat-value" style={{color:'var(--success)'}}>{stats.clicks}</div>
        </div>
      </div>

      <div className="card" style={{padding:0}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600,display:'flex',alignItems:'center',gap:8}}>
          <Globe size={18} className="text-secondary" />
          Recent Activity Log
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{width: 150}}>Action</th>
                <th style={{width: 200}}>Time</th>
                <th style={{width: 200}}>Agent</th>
                <th>Page URL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-secondary)',padding:40}}>Loading analytics...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-secondary)',padding:40}}>No analytics data available yet.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge ${log.type === 'click' ? 'badge-success' : 'badge-primary'}`} style={{textTransform:'uppercase',fontSize:10}}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{color:'var(--text-secondary)',fontSize:13}}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{fontWeight:500}}>
                      {log.agent?.name || 'Deleted Agent'}
                    </td>
                    <td style={{color:'var(--text-secondary)',fontSize:13}}>
                      {log.pageUrl ? (
                         <div style={{maxWidth:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={log.pageUrl}>
                           {log.pageUrl}
                         </div>
                      ) : (
                         'Unknown Page'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
