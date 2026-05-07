import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { apiFetch } from '../lib/api';

interface AIToolkitProps {
  entityId: string;
  entityType: 'deal' | 'lead' | 'company' | 'contact';
}

export function AIToolkit({ entityId, entityType }: AIToolkitProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    setResult(null);
    try {
      let data;
      if (action === 'score') {
         data = await apiFetch('/ai-hub/score-deal', {
           method: 'POST',
           body: JSON.stringify({ dealId: entityId })
         });
      } else if (action === 'summary') {
         data = await apiFetch('/ai-hub/summary', {
           method: 'POST',
           body: JSON.stringify({ entityId, entityType })
         });
      }
      setResult(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
      <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
         <Sparkles className="h-4 w-4 text-indigo-600" /> AI Toolkit
      </h3>
      
      <div className="flex flex-wrap gap-2">
         {(entityType === 'deal' || entityType === 'lead') && (
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-xs text-indigo-600"
              onClick={() => handleAction('score')}
              disabled={loadingAction === 'score'}
            >
              {loadingAction === 'score' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <BrainCircuit className="h-3 w-3 mr-1" />}
              AI {entityType === 'deal' ? 'Deal Risk' : 'Lead'} Score
            </Button>
         )}
         <Button 
            size="sm" 
            variant="outline" 
            className="bg-white border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-xs text-indigo-600"
            onClick={() => handleAction('summary')}
            disabled={loadingAction === 'summary'}
          >
            {loadingAction === 'summary' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
            AI Summary
          </Button>
      </div>

      {result && result.score !== undefined && (
         <div className="mt-4 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
               <span className="text-xs font-semibold text-slate-500 uppercase">AI Score</span>
               <span className={`text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1 ${result.score > 70 ? 'bg-emerald-100 text-emerald-700' : result.score > 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                 {result.score}/100
               </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {result.reasoning}
            </p>
         </div>
      )}
      {result && result.summary !== undefined && (
         <div className="mt-4 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">AI Summary</span>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </p>
         </div>
      )}
    </div>
  );
}
