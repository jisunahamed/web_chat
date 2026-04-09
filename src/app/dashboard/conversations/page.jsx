'use client';
import { useEffect, useState } from 'react';
import { getConversations, getConversation, deleteConversation } from '@/lib/api';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getConversations().then(d=>setConversations(d.conversations||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const view = async (id) => { try { const d = await getConversation(id); setSelected(d.conversation); setMessages(d.conversation.messages||[]); setConversations(prev => prev.map(c => c.id === id ? { ...c, isRead: true } : c)); } catch{} };
  const handleDelete = async (id) => { if(!confirm('Delete?')) return; try { await deleteConversation(id); setConversations(conversations.filter(c=>c.id!==id)); if(selected?.id===id){setSelected(null);setMessages([]);} } catch{} };

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Conversations</h1></div>
      <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:20,minHeight:500}}>
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:600}}>All Conversations ({conversations.length})</div>
          <div style={{maxHeight:460,overflowY:'auto'}}>
            {loading ? <p style={{padding:20,color:'var(--text-secondary)'}}>Loading…</p> : conversations.length===0 ? <p style={{padding:20,color:'var(--text-secondary)'}}>No conversations yet.</p> :
              conversations.map(c=>(
                <div key={c.id} onClick={()=>view(c.id)} style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',cursor:'pointer',background:selected?.id===c.id?'rgba(108,92,231,.1)':'transparent',transition:'background .15s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontWeight:!c.isRead?700:500,fontSize:13,display:'flex',alignItems:'center',gap:6}}>{!c.isRead && <span style={{width:8,height:8,borderRadius:'50%',background:'#3b82f6',display:'inline-block'}}></span>}{c.agent?.name||'Agent'}</span><span style={{fontSize:12,color:!c.isRead?'#fff':'var(--text-secondary)'}}>{new Date(c.updatedAt).toLocaleDateString()}</span></div>
                  <div style={{fontSize:13,color:!c.isRead?'#fff':'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontWeight:!c.isRead?500:400}}>{c.messages?.[0]?.content||'No messages'}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:4}}>{c._count?.messages||0} msgs · {c.sessionId?.slice(0,12)}…</div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="card" style={{padding:0,display:'flex',flexDirection:'column'}}>
          {!selected ? <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)'}}>Select a conversation</div> : (
            <>
              <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><span style={{fontWeight:600}}>{selected.agent?.name}</span><span style={{marginLeft:12,fontSize:12,color:'var(--text-secondary)'}}>{selected.userInfo?.name||'Anonymous'}{selected.userInfo?.email?` · ${selected.userInfo.email}`:''}</span></div>
                <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(selected.id)}>Delete</button>
              </div>
              <div className="chat-viewer" style={{flex:1,borderRadius:0,border:'none'}}>
                {messages.map(msg=>(<div key={msg.id}><div className={`chat-bubble ${msg.role}`}>{msg.content}</div><div className="chat-time" style={{textAlign:msg.role==='user'?'right':'left'}}>{new Date(msg.createdAt).toLocaleTimeString()}</div></div>))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
