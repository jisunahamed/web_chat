'use client';
import { useEffect, useState } from 'react';
import { getLeads, deleteLead } from '@/lib/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p=1) => { setLoading(true); getLeads(`page=${p}&limit=25`).then(d=>{setLeads(d.leads||[]);setTotal(d.total||0);setPage(p);}).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{load();},[]);

  const handleDelete = async (id) => { if(!confirm('Delete lead?')) return; try { await deleteLead(id); load(page); } catch{} };
  const totalPages = Math.ceil(total/25);

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Leads</h1><span style={{color:'var(--text-secondary)',fontSize:14}}>{total} total</span></div>
      <div className="card" style={{padding:0}}>
        <div className="table-wrapper"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Agent</th><th>Date</th><th></th></tr></thead><tbody>
          {loading ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-secondary)'}}>Loading…</td></tr> : leads.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-secondary)'}}>No leads yet.</td></tr> :
            leads.map(lead=>(<tr key={lead.id}><td style={{fontWeight:500}}>{lead.name||'–'}</td><td>{lead.email||'–'}</td><td>{lead.phone||'–'}</td><td>{lead.agent?.name||'–'}</td><td>{new Date(lead.createdAt).toLocaleDateString()}</td><td><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(lead.id)}>×</button></td></tr>))
          }
        </tbody></table></div>
        {totalPages>1 && <div style={{padding:'12px 16px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'center',gap:8}}><button className="btn btn-secondary btn-sm" disabled={page<=1} onClick={()=>load(page-1)}>← Prev</button><span style={{padding:'7px 14px',fontSize:13,color:'var(--text-secondary)'}}>Page {page} of {totalPages}</span><button className="btn btn-secondary btn-sm" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next →</button></div>}
      </div>
    </div>
  );
}
