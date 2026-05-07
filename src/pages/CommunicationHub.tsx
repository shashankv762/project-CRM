import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, MessageSquare, Phone, Send, Search, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState('all');

  const messages = [
    { id: 1, type: 'email', sender: 'john@acme.com', subject: 'Re: Proposal feedback', preview: 'Thanks for sending this over. We had a few questions...', time: '10:42 AM', unread: true },
    { id: 2, type: 'sms', sender: '+1 (555) 123-4567', subject: 'Acme Corp', preview: 'Can we push our meeting to 3PM?', time: 'Yesterday', unread: true },
    { id: 3, type: 'chat', sender: 'Live Chat (Website)', subject: 'Pricing Inquiry', preview: 'Is the enterprise plan billed annually?', time: 'Tuesday', unread: false }
  ];

  return (
    <div className="flex h-full animate-in fade-in duration-500 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col hidden md:flex shrink-0">
         <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Unified Inbox</h2>
            <div className="relative">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
               <Input className="pl-9 bg-white" placeholder="Search messages..." />
            </div>
         </div>
         <div className="p-2 space-y-1">
            <button className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium ${activeTab === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('all')}>
               <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> All Messages</div>
               <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">2</span>
            </button>
            <button className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium ${activeTab === 'email' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('email')}>
               <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> Emails</div>
            </button>
            <button className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium ${activeTab === 'sms' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('sms')}>
               <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> SMS</div>
            </button>
            <button className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium ${activeTab === 'calls' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => setActiveTab('calls')}>
               <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> Call Logs</div>
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto mt-4">
            <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent</h3>
            {messages.map(m => (
               <div key={m.id} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors ${m.unread ? 'bg-white' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                     <span className={`font-semibold text-sm ${m.unread ? 'text-slate-900' : 'text-slate-600'}`}>{m.sender}</span>
                     <span className="text-xs text-slate-400">{m.time}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-700 mb-1 truncate">{m.subject}</div>
                  <div className="text-xs text-slate-500 truncate">{m.preview}</div>
               </div>
            ))}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
            <div>
               <h2 className="text-xl font-bold text-slate-900">Re: Proposal feedback</h2>
               <p className="text-sm text-slate-500 mt-1">John Doe &lt;john@acme.com&gt; • Acme Corp Deal</p>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="hidden sm:flex"><CheckCircle2 className="h-4 w-4 mr-2" /> Mark Done</Button>
               <Button variant="outline" size="sm">View Deal</Button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            <div className="flex justify-center">
               <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
            </div>
            
            <div className="flex gap-4">
               <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0">JD</div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm max-w-2xl">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                     Thanks for sending this over. We had a few questions about the implementation timeline on page 4.<br/><br/>
                     Can we jump on a quick call tomorrow to clarify the migration steps?<br/><br/>
                     Best,<br/>John
                  </p>
               </div>
               <span className="text-xs text-slate-400 mt-auto pb-2 shrink-0">10:42 AM</span>
            </div>
         </div>

         <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-2">
               <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all overflow-hidden p-1">
                  <textarea 
                     rows={3} 
                     placeholder="Reply to John..." 
                     className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none"
                  ></textarea>
                  <div className="flex justify-between items-center p-2 border-t border-slate-100 bg-white rounded-b-lg">
                     <div className="flex gap-1 text-slate-400">
                        {/* Action buttons could go here */}
                     </div>
                     <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md px-6">
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
