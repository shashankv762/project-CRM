import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Sparkles, Send, BrainCircuit, LineChart, MessageSquare } from 'lucide-react';
import { useCRMData } from '../hooks/useCRMData';

export default function AiCenter() {
  const { data: deals } = useCRMData('deals');
  const { data: leads } = useCRMData('leads');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    
    // Build context
    const contextStr = `
Total Deals: ${deals.length}
Total Value: $${deals.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)}
Total Leads: ${leads.length}
Deals context (JSON): ${JSON.stringify(deals.slice(0, 10))}
Leads context (JSON): ${JSON.stringify(leads.slice(0, 10))}
    `;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: contextStr })
      });
      const data = await res.json();
      setResponse(data.response || 'No response from Aegix AI.');
    } catch (err: any) {
      setResponse(`Error connecting to Aegix Intelligence: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-indigo-600" />
          Aegix Intelligence Center
        </h1>
        <p className="text-slate-500 mt-2">
          Your centralized AI command center. Ask natural language queries, generate reports, or analyze pipeline health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-slate-200 shadow-sm">
           <CardHeader className="bg-slate-50/50 border-b">
             <CardTitle className="flex items-center gap-2 text-lg">
               <MessageSquare className="h-5 w-5 text-indigo-500" />
               Ask Aegix AI
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-4">
             <Textarea 
               placeholder="E.g. Which deals in the pipeline have the highest probability of closing this month?" 
               className="min-h-[120px] resize-none text-base p-4 bg-slate-50 focus-visible:ring-indigo-500"
               value={prompt}
               onChange={e => setPrompt(e.target.value)}
             />
             <div className="flex items-center justify-between">
               <p className="text-xs text-slate-400">Context automatically includes real-time CRM state.</p>
               <Button onClick={handleAskAI} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-full" disabled={loading || !prompt.trim()}>
                 {loading ? <span className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border-2 border-t-white animate-spin"></div> Thinking...</span> : <span className="flex items-center gap-2">Execute <Send className="h-4 w-4" /></span>}
               </Button>
             </div>

             {response && (
               <div className="mt-6 p-6 bg-slate-900 text-slate-50 rounded-xl leading-relaxed whitespace-pre-wrap text-sm border border-slate-800 shadow-inner">
                 <div className="flex items-center gap-2 mb-4 text-indigo-400 font-medium">
                   <Sparkles className="h-4 w-4" /> Aegix Response
                 </div>
                 {response}
               </div>
             )}
           </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <BrainCircuit className="h-4 w-4 text-emerald-500" /> Suggested Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <button onClick={() => setPrompt("Summarize all new leads added this week and write a draft welcome email.")} className="w-full text-left text-sm p-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition border border-transparent hover:border-indigo-100">
                Summarize new leads & draft welcome email
              </button>
              <button onClick={() => setPrompt("Analyze pipeline bottlenecks. Which stage takes the longest?")} className="w-full text-left text-sm p-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition border border-transparent hover:border-indigo-100">
                Analyze pipeline bottlenecks
              </button>
              <button onClick={() => setPrompt("What are the highest value deals over 50% probability?")} className="w-full text-left text-sm p-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition border border-transparent hover:border-indigo-100">
                Identify high-value likely deals
              </button>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm">
             <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <LineChart className="h-24 w-24 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-indigo-900 mb-2 relative z-10">Revenue Intelligence</h3>
                <p className="text-sm text-indigo-700/80 mb-4 relative z-10">AI-driven predictive forecasting requires at least 30 days of historical deal data to build a confidence matrix.</p>
                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-indigo-500 w-[15%]" />
                </div>
                <p className="text-xs text-indigo-600 mt-2 font-medium relative z-10">Data collection at 15%</p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
