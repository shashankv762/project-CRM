import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShieldAlert, HeartPulse, Activity, UserCheck, TrendingDown } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function CustomerSuccess() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <HeartPulse className="h-8 w-8 text-rose-500" />
            Customer Success & Health
          </h1>
          <p className="text-slate-500 mt-2">
            AI-driven churn prediction, account health monitoring, and relationship intelligence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Average Health</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-emerald-600">82/100</div>
             <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-500 rotate-180" /> +4 from last month</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">At Risk Accounts</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-rose-600">4</div>
             <p className="text-xs text-slate-500 mt-1">Requires immediate intervention</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Active Trials</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-indigo-600">12</div>
             <p className="text-xs text-slate-500 mt-1">High conversion likelihood</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
             <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Expansion MRR</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-emerald-600">$12,400</div>
             <p className="text-xs text-slate-500 mt-1">Identified Upsell Opportunities</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Account Health Overview</h2>
        <Card className="border-slate-200">
          <div className="divide-y divide-slate-100">
             {[
               { name: 'Acme Corp', status: 'Healthy', score: 92, lastActivity: '2 days ago', expansion: 'High' },
               { name: 'Global Tech', status: 'At Risk', score: 45, lastActivity: '14 days ago', expansion: 'Low' },
               { name: 'NextGen Systems', status: 'Needs Attention', score: 68, lastActivity: '5 days ago', expansion: 'Medium' }
             ].map((account, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${account.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : account.status === 'At Risk' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                        {account.status === 'At Risk' ? <ShieldAlert className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                     </div>
                     <div>
                       <h3 className="font-semibold text-slate-900">{account.name}</h3>
                       <p className="text-xs text-slate-500 mt-0.5">Last active: {account.lastActivity}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-8">
                     <div className="hidden sm:block text-right">
                       <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Expansion Potential</p>
                       <p className="text-sm font-medium mt-0.5">{account.expansion}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Health Score</p>
                       <div className="flex items-center gap-2 mt-0.5">
                         <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full ${account.score > 80 ? 'bg-emerald-500' : account.score > 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${account.score}%` }}></div>
                         </div>
                         <span className="text-sm font-bold">{account.score}</span>
                       </div>
                     </div>
                     <Button variant="ghost" size="sm" className="hidden sm:flex text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                       View Playbook
                     </Button>
                   </div>
                </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
