import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart3, PieChart, Activity, TrendingUp, Download, Eye, Sparkles } from 'lucide-react';

export default function AnalyticsHub() {
  const [activeReport, setActiveReport] = useState('sales');

  const reports = [
    { title: 'Pipeline Velocity', type: 'sales', desc: 'Average time spent in each stage', icon: <TrendingUp className="h-5 w-5" /> },
    { title: 'Win/Loss Analysis', type: 'sales', desc: 'Conversion rates by industry', icon: <PieChart className="h-5 w-5" /> },
    { title: 'Activity Leaderboard', type: 'productivity', desc: 'Calls, emails, and meetings per rep', icon: <Activity className="h-5 w-5" /> },
    { title: 'Revenue Forecast', type: 'forecasting', desc: 'AI predictive revenue model', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
            Enterprise Analytics
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Advanced reports, predictive forecasting, and interactive data visualizations.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto"><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">Create Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reports.map((r, i) => (
          <Card key={i} className="hover:border-indigo-300 transition-colors cursor-pointer group shadow-sm border-slate-200">
             <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                      {r.icon}
                   </div>
                   <Eye className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{r.desc}</p>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
             <div>
                <CardTitle className="text-lg font-bold text-slate-900">Revenue Forecast (AI Model)</CardTitle>
                <p className="text-sm text-slate-500 font-normal mt-1">Predictive analysis based on historical win rates and current pipeline volume.</p>
             </div>
          </CardHeader>
          <CardContent className="p-6 min-h-[300px] flex items-center justify-center bg-slate-50/50">
             {/* We would use Recharts here, but placeholder for structure */}
             <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Interactive Chart Area</p>
                <p className="text-slate-400 text-sm mt-1">Sales velocity and revenue projection graph</p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-indigo-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20 pointer-events-none">
             <Sparkles className="h-48 w-48 text-indigo-200" />
          </div>
          <CardHeader className="relative z-10 pb-0">
             <div className="flex items-center gap-2 text-indigo-300 mb-2 font-medium text-sm">
               <Sparkles className="h-4 w-4" /> AI Business Intelligence
             </div>
             <CardTitle className="text-xl font-bold">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-4 space-y-4">
             <div className="space-y-3">
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Based on current data, your team is on track to <strong>exceed Q3 targets by 14%</strong>. 
                </p>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  However, lead conversion in the healthcare sector has dropped by 8% over the last 30 days. Recommend deploying the new "Healthcare Compliance" playbook.
                </p>
             </div>
             <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg text-sm">
               Explore AI Insights
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
