import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Sparkles, Workflow, ExternalLink, Plus, Activity, Mail, CheckCircle2, Copy } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await apiFetch('/workflows');
      setWorkflows(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, current: boolean) => {
    try {
      setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: !current } : w));
      await apiFetch(`/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !current })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const createDummyWorkflow = async () => {
    try {
      await apiFetch('/workflows', {
         method: 'POST',
         body: JSON.stringify({
            name: 'High Value Deal Alert',
            description: 'Notify the team and draft an introductory email when a deal over $100k is created.',
            triggerType: 'deal_created',
            triggerConfig: { minValue: 100000 },
            actions: [
               { type: 'notify_team', channel: 'slack' },
               { type: 'ai_draft_email', template: 'intro_enterprise' }
            ]
         })
      });
      loadWorkflows();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Workflow className="h-8 w-8 text-indigo-600" />
            Automation Hub
          </h1>
          <p className="text-slate-500 mt-2">
            Build and monitor AI-powered workflows and triggers.
          </p>
        </div>
        <Button onClick={createDummyWorkflow} className="bg-indigo-600 hover:bg-indigo-700">
           <Plus className="h-4 w-4 mr-2" /> New Workflow
        </Button>
      </div>

      {loading ? (
         <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-200 rounded-xl"></div>
            <div className="h-24 bg-slate-200 rounded-xl"></div>
         </div>
      ) : workflows.length === 0 ? (
         <Card className="border-dashed border-2 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
               <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center">
                 <Workflow className="h-8 w-8 text-indigo-500" />
               </div>
               <h3 className="text-lg font-semibold text-slate-900">No workflows active</h3>
               <p className="text-sm text-slate-500 max-w-sm">Automate your sales process with AI-driven triggers and actions. Click below to create your first rule.</p>
               <Button onClick={createDummyWorkflow} variant="outline" className="mt-4 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                 Create Template Workflow
               </Button>
            </CardContent>
         </Card>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {workflows.map(workflow => (
             <Card key={workflow.id} className={`border-slate-200 shadow-sm relative overflow-hidden transition ${!workflow.isActive && 'opacity-70 grayscale'}`}>
               <div className={`absolute top-0 left-0 w-1 h-full ${workflow.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
               <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-start justify-between space-y-0">
                 <div>
                   <CardTitle className="text-base font-semibold text-slate-900">{workflow.name}</CardTitle>
                   <CardDescription className="text-xs mt-1">Trigger: <span className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{workflow.triggerType}</span></CardDescription>
                 </div>
                 <Switch 
                   checked={workflow.isActive} 
                   onCheckedChange={() => toggleWorkflow(workflow.id, workflow.isActive)}
                   className="data-[state=checked]:bg-emerald-500"
                 />
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                 <p className="text-sm text-slate-600 line-clamp-2">{workflow.description}</p>
                 
                 <div className="space-y-2">
                   <h4 className="text-xs font-semibold text-slate-500 uppercase">Actions</h4>
                   <div className="flex flex-wrap gap-2">
                     {JSON.parse(workflow.actions || '[]').map((action: any, idx: number) => (
                       <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 font-normal border border-slate-200">
                         {action.type.replace(/_/g, ' ')}
                       </Badge>
                     ))}
                   </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> 0 executions</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                       Edit <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
      )}
    </div>
  );
}
