import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GitBranch, Zap, Plus, Settings2, Play, CircleDot } from 'lucide-react';

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'trigger', label: 'When Deal is Created', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <Zap className="h-4 w-4" /> },
    { id: 2, type: 'condition', label: 'If Value > $50k', bg: 'bg-amber-100', text: 'text-amber-700', icon: <GitBranch className="h-4 w-4" /> },
    { id: 3, type: 'action', label: 'Assign to Enterprise Team', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CircleDot className="h-4 w-4" /> },
  ]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-indigo-600" />
            Workflow Builder
          </h1>
          <p className="text-slate-500 mt-2">
            Visual automation engine for enterprise processes and AI routing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Play className="h-4 w-4 mr-2" /> Test Workflow</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Publish Changes</Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-[500px]">
         {/* Builder Canvas Area */}
         <div className="flex-1 bg-slate-50/50 border border-slate-200 rounded-xl overflow-hidden relative dot-pattern flex items-center justify-center p-8">
            {/* Extremely simple visual rep of a flow */}
            <div className="flex flex-col items-center space-y-6">
               {nodes.map((n, i) => (
                  <div key={n.id} className="flex flex-col items-center group relative">
                    <Card className="w-72 shadow-sm border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer z-10 bg-white">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${n.bg} ${n.text}`}>
                           {n.icon}
                        </div>
                        <div className="flex-1 font-medium text-sm text-slate-800">{n.label}</div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><Settings2 className="h-4 w-4 text-slate-400" /></Button>
                      </CardContent>
                    </Card>
                    {i < nodes.length - 1 && (
                      <div className="w-px h-6 bg-slate-300 relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-slate-300 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}
                  </div>
               ))}
               
               <div className="w-px h-6 bg-slate-300 border-dashed"></div>
               <Button variant="outline" className="border-dashed border-2 shadow-sm bg-white hover:bg-slate-50 hover:border-indigo-300">
                  <Plus className="h-4 w-4 mr-2" /> Add Step
               </Button>
            </div>
         </div>

         {/* Configuration Panel */}
         <div className="w-80 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col hidden lg:flex shrink-0">
            <div className="p-4 border-b border-slate-100 font-bold justify-between flex items-center">
               Node Configuration
               <Settings2 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">Select a node on the canvas to configure its properties, logic, and AI integrations.</p>
                  <Button variant="outline" size="sm" className="w-full bg-white text-xs">View Action Library</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
