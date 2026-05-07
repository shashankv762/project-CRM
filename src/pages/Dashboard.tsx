import React from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Target, CheckSquare, DollarSign, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlobalActivityFeed } from '../components/GlobalActivityFeed';

export default function Dashboard() {
  const { data: deals, loading: dealsLoading } = useCRMData('deals');
  const { data: leads, loading: leadsLoading } = useCRMData('leads');
  const { data: tasks, loading: tasksLoading } = useCRMData('tasks');
  const { data: companies, loading: companiesLoading } = useCRMData('companies');

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const wonDeals = deals.filter(d => d.stage === 'closed_won');
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  
  // Group deals by stage for chart
  const pipelineStages = ['prospect', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const pipelineData = pipelineStages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    return {
      name: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
      count: stageDeals.length
    };
  });

  const loading = dealsLoading || leadsLoading || tasksLoading || companiesLoading;

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  // Derive "Smart AI Insights" locally
  const upcomingTasks = pendingTasks.filter(t => t.dueDate < Date.now() + 86400000 * 3).length;
  const highValueDeals = deals.filter(d => d.stage === 'negotiation' && d.value > 5000);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      {/* AI Insight Bar */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white shadow-sm overflow-hidden">
         <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100/50 text-indigo-600 rounded-xl">
                 <Sparkles className="h-6 w-6" />
              </div>
              <div>
                 <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Aegix Intelligence Summary</h2>
                 <p className="text-sm text-slate-600 mt-1">
                   You have <strong className="text-indigo-700">{upcomingTasks} upcoming tasks</strong> in the next 3 days. 
                   There are <strong className="text-indigo-700">{highValueDeals.length} high-value deals in negotiation</strong>. 
                   Focusing your effort on closing those deals could yield <strong>${highValueDeals.reduce((a, b) => a + Number(b.value), 0).toLocaleString()}</strong> in immediate revenue.
                 </p>
              </div>
            </div>
            <Link to="/ai-center" className="shrink-0 whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
               Ask AI
            </Link>
         </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500">From {wonDeals.length} closed deals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Leads</CardTitle>
            <Target className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => l.status !== 'converted' && l.status !== 'lost').length}</div>
            <p className="text-xs text-slate-500">In the pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Companies</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-slate-500">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-slate-500">Action items to complete</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pipeline Value by Stage</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Value"]}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <GlobalActivityFeed />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
