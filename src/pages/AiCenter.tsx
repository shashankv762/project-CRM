import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Sparkles, Send, BrainCircuit, Bot } from 'lucide-react';
import { useCRMData } from '../hooks/useCRMData';
import { apiFetch } from '../lib/api';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function AiCenter() {
  const { data: deals } = useCRMData('deals');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model',
    parts: [{ text: "Hello! I'm Aegix AI. I can analyze deals, generate insights, build workflows, or draft emails. How can I help you today?" }]
  }]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: prompt }] };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/ai-hub/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) throw new Error('Network error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      let aiResponseText = '';
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(Boolean);
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                aiResponseText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  last.parts[0].text = aiResponseText;
                  return updated;
                });
              } else if (data.error) {
                aiResponseText += `\n\n**Error:** ${data.error}`;
              }
            } catch(e) {}
          }
        }
      }

    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Error connecting to Aegix Intelligence: ${err.message}` }] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-indigo-600" />
          Aegix Intelligence Center
        </h1>
        <p className="text-slate-500 mt-2">
          Your centralized AI command center. Ask natural language queries, generate reports, or analyze pipeline health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        <Card className="col-span-1 lg:col-span-3 border-slate-200 shadow-sm flex flex-col min-h-0">
           <CardHeader className="bg-slate-50/50 border-b py-3 px-4 shrink-0">
             <CardTitle className="flex items-center gap-2 text-base">
               <Bot className="h-5 w-5 text-indigo-500" />
               Aegix AI Session
             </CardTitle>
           </CardHeader>
           <CardContent className="p-0 flex-1 flex flex-col min-h-0 bg-slate-50/30 line-height-relaxed">
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                         <Sparkles className="h-4 w-4 text-indigo-600" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}>
                       {msg.role === 'model' ? (
                          <div className="markdown-body text-sm">
                            <Markdown remarkPlugins={[remarkGfm]}>{msg.parts[0].text}</Markdown>
                          </div>
                       ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                       )}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                 <div className="relative">
                   <Textarea 
                     placeholder="Type a command or ask a question... (Shift+Enter for new line)" 
                     className="min-h-[60px] max-h-[200px] resize-none text-sm pr-14 py-3 bg-slate-50 focus-visible:ring-indigo-500 rounded-xl"
                     value={prompt}
                     onChange={e => setPrompt(e.target.value)}
                     onKeyDown={handleKeyDown}
                   />
                   <Button 
                     onClick={handleAskAI} 
                     disabled={loading || !prompt.trim()}
                     className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                   >
                     <Send className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
           </CardContent>
        </Card>

        <div className="space-y-6 overflow-y-auto pr-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50 px-4 py-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <BrainCircuit className="h-4 w-4 text-emerald-500" /> Suggested Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <button onClick={() => setPrompt("Summarize all new leads added this week.")} className="w-full text-left text-xs p-2.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 text-slate-600 transition border border-transparent">
                Summarize new leads
              </button>
              <button onClick={() => setPrompt("Analyze pipeline bottlenecks. Which stage takes the longest?")} className="w-full text-left text-xs p-2.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 text-slate-600 transition border border-transparent">
                Analyze pipeline bottlenecks
              </button>
              <button onClick={() => setPrompt("Draft a cold outreach email to CTOs.")} className="w-full text-left text-xs p-2.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 text-slate-600 transition border border-transparent">
                Draft outreach email
              </button>
              <button onClick={() => setPrompt("Which deals have been stuck in the same stage for over 14 days?")} className="w-full text-left text-xs p-2.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 text-slate-600 transition border border-transparent">
                Find stalled deals
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
