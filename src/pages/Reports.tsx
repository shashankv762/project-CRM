import React from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const { data: deals, loading: dealsLoading } = useCRMData('deals');
  const { data: leads, loading: leadsLoading } = useCRMData('leads');

  // Win rate calc
  const wonDeals = deals.filter(d => d.stage === 'closed_won');
  const lostDeals = deals.filter(d => d.stage === 'closed_lost');
  const totalCompletedDeals = wonDeals.length + lostDeals.length;
  const winRate = totalCompletedDeals > 0 ? Math.round((wonDeals.length / totalCompletedDeals) * 100) : 0;

  // Pipeline by stage
  const pipelineStages = ['prospect', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const pipelineData = pipelineStages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    return {
      name: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
    };
  });

  // Leads by status
  const leadStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
  const leadData = leadStatuses.map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: leads.filter(l => l.status === status).length
  })).filter(d => d.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (dealsLoading || leadsLoading) {
    return <div className="flex h-full items-center justify-center">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Overall Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{winRate}%</div>
            <p className="text-sm text-slate-500 mt-2">Based on {totalCompletedDeals} completed deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Total Deals Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              ${deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-slate-500 mt-2">All stages combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Lead Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%
            </div>
            <p className="text-sm text-slate-500 mt-2">Leads converted to active customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Value Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                  <Tooltip formatter={(value) => [`$${value}`, "Value"]} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {leadData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Leads"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-sm">No lead data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
