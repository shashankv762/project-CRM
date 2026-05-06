import React from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Target, CheckSquare, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { data: deals, loading: dealsLoading } = useCRMData('deals');
  const { data: leads, loading: leadsLoading } = useCRMData('leads');
  const { data: tasks, loading: tasksLoading } = useCRMData('tasks');
  const { data: customers, loading: customersLoading } = useCRMData('customers');

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

  const loading = dealsLoading || leadsLoading || tasksLoading || customersLoading;

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

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
            <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
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
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.slice(0, 5).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No pending tasks</p>
              ) : (
                pendingTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
