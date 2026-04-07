'use client';
import React, { useState, useEffect } from 'react';
import { 
  Package, Upload, Download, CheckCircle, 
  AlertTriangle, FileArchive, Globe, History,
  Trash2, Copy, Save
} from 'lucide-react';
import { motion } from 'framer-motion';

import { updateSystemSettings } from '@/app/actions/adminActions';

const PluginManagement = ({ initialSettings }) => {
  const [version, setVersion] = useState(initialSettings?.pluginVersion || '1.0.0');
  const [zipPath, setZipPath] = useState(initialSettings?.pluginZipPath || '/downloads/inmetech_chatbot.zip');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert("Please upload a .zip file only.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/plugin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setZipPath(data.path);
        alert(`Successfully uploaded ${file.name}! Now click "Push Update" to finalize.`);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Real data for distribution updates
  const stats = [
    { label: 'Current Stable Version', value: version, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'System Integration Link', value: 'Active', icon: Globe, color: 'text-violet-500' },
    { label: 'Registry Update', value: 'Synced', icon: CheckCircle, color: 'text-amber-500' },
  ];

  const handleUpdate = async () => {
    setUploading(true);
    const result = await updateSystemSettings({
      ...initialSettings,
      pluginVersion: version,
      pluginZipPath: zipPath
    });
    
    if (result.success) {
      setUploading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setUploading(false);
      alert(result.error);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex items-end justify-between">
        <div>
           <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">WordPress Plugin Distribution</h2>
           <p className="text-zinc-500 text-sm">Managing the latest plugin archives for end-users.</p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={uploading}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-violet-600/20'}`}
        >
          {saved ? <CheckCircle size={18} /> : (uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />)}
          {saved ? 'Distribution Updated' : (uploading ? 'Compressing...' : 'Push Update')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {stats.map((s, i) => (
           <div key={i} className="p-6 bg-[#0c0c0e] border border-white/5 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                 <s.icon className={s.color} size={20} />
              </div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">{s.label}</p>
              <h3 className="text-xl font-bold">{s.value}</h3>
           </div>
         ))}
      </div>

      <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] p-10">
         <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Target Version Number</label>
                  <input 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-6 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium outline-none focus:border-violet-600 transition-all font-mono" 
                    placeholder="e.g. 1.0.5" 
                  />
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1 flex items-center justify-between">
                    <span>Public Download URL</span>
                    <span className="text-[9px] text-amber-500 lowercase font-medium italic">Hint: Use manual URL for Vercel/DigitalOcean hosting</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-violet-500">
                          <Globe size={16} />
                       </div>
                       <input 
                         type="text"
                         value={zipPath}
                         onChange={(e) => setZipPath(e.target.value)}
                         placeholder="https://example.com/plugin.zip"
                         className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-mono outline-none focus:border-violet-600 transition-all"
                       />
                       <button 
                         type="button"
                         onClick={() => {
                           navigator.clipboard.writeText(zipPath);
                           alert("URL copied to clipboard!");
                         }}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white p-1"
                       >
                          <Copy size={16} />
                       </button>
                    </div>
                  </div>
               </div>
            </div>

            <div 
               onClick={() => fileInputRef.current?.click()}
               className="w-full md:w-[400px] bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center p-12 text-center group hover:border-violet-600/30 transition-all cursor-pointer relative"
            >
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect} 
                 accept=".zip" 
                 className="hidden" 
               />
               <div className="w-20 h-20 bg-violet-600/10 rounded-full flex items-center justify-center text-violet-500 mb-6 group-hover:scale-110 transition-transform">
                  <FileArchive size={32} />
               </div>
               <h5 className="font-bold mb-2">Upload ZIP Archive</h5>
               <p className="text-zinc-600 text-xs mb-6">Drag and drop your updated inmetech_chatbot.zip here.</p>
               <div className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest uppercase text-zinc-400 group-hover:text-white group-hover:border-violet-600 transition-all">
                  {uploading ? 'Processing...' : 'Browse Files'}
               </div>
            </div>
         </div>

         <div className="mt-12 p-6 bg-violet-600/5 border border-violet-600/10 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-violet-500 flex-shrink-0" size={20} />
            <p className="text-xs text-zinc-400 leading-relaxed">
              When you push an update, the new version will be immediately available for download globally in every user's dashboard. 
              Ensure you have tested the `inmetech_chatbot.js` internally before finalizing the distribution.
            </p>
         </div>
      </div>

      <div className="bg-[#0c0c0e] border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h4 className="font-bold text-sm uppercase tracking-tight">Distribution History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.01]">
              <tr>
                <th className="py-4 pl-8 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Version</th>
                <th className="py-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Release Date</th>
                <th className="py-4 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Archive Size</th>
                <th className="py-4 pr-8 text-right text-[10px] font-black uppercase text-zinc-600 tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-5 pl-8 font-mono text-violet-400 font-bold">1.0.4</td>
                <td className="py-5 text-zinc-400">Apr 04, 2026</td>
                <td className="py-5 text-zinc-500">1.2 MB</td>
                <td className="py-5 pr-8 text-right">
                   <button className="text-rose-400 hover:text-rose-300 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-5 pl-8 font-mono text-zinc-600">1.0.3</td>
                <td className="py-5 text-zinc-600">Mar 28, 2026</td>
                <td className="py-5 text-zinc-700">1.1 MB</td>
                <td className="py-5 pr-8 text-right">
                   <button className="text-zinc-600 hover:text-white p-2"><History size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PluginManagement;
