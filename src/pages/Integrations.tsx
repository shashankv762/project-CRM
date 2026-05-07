import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mail, Calendar, CheckCircle2, AlertCircle, Key, Webhook, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiFetch } from '../lib/api';
import { Input } from '../components/ui/input';

export default function Integrations() {
  const [syncedEmail, setSyncedEmail] = useState(false);
  const [syncedCalendar, setSyncedCalendar] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '' });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const data = await apiFetch('/webhooks');
      setWebhooks(data);
    } catch(e) {
      console.error(e);
    }
  };

  const createWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) return;
    try {
      await apiFetch('/webhooks', {
        method: 'POST',
        body: JSON.stringify({ ...newWebhook, events: ['deal.created', 'deal.updated'] })
      });
      setNewWebhook({ name: '', url: '' });
      loadWebhooks();
    } catch(e) { console.error(e); }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await apiFetch(`/webhooks/${id}`, { method: 'DELETE' });
      loadWebhooks();
    } catch(e) { console.error(e); }
  };

  const handleEmailSync = () => setSyncedEmail(!syncedEmail);
  const handleCalendarSync = () => setSyncedCalendar(!syncedCalendar);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Integrations & Developer
        </h1>
        <p className="text-slate-500 mt-2">
          Connect tools, manage webhooks, and generate API keys for the Aegix public API.
        </p>
      </div>

      <Tabs defaultValue="apps" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apps">Connected Apps</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm relative overflow-hidden">
              {syncedEmail && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Google Workspace / Gmail</CardTitle>
                    <CardDescription>Two-way email sync & compose</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Automatically track client communication, let AI draft replies, and keep your inbox in sync with CRM contacts.
                </p>
                {syncedEmail ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Connected
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEmailSync} className="text-red-600 border-red-200">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleEmailSync} className="w-full bg-blue-600 hover:bg-blue-700">Connect Gmail</Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm relative overflow-hidden">
              {syncedCalendar && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Google Calendar</CardTitle>
                    <CardDescription>Meeting sync & scheduling</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Sync meetings with your pipeline, auto-generate meeting links, and let AI summarize post-meeting action items.
                </p>
                {syncedCalendar ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Connected
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCalendarSync} className="text-red-600 border-red-200">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleCalendarSync} className="w-full bg-orange-600 hover:bg-orange-700">Connect Calendar</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" /> Webhooks</CardTitle>
                <CardDescription>Listen to realtime events from your CRM to trigger external actions.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-4 mb-6 pt-2 border-t">
                 <h4 className="font-medium text-sm">Add New Webhook</h4>
                 <div className="flex gap-4">
                   <Input placeholder="Webhook Name (e.g. Zapier Deal Listener)" value={newWebhook.name} onChange={e => setNewWebhook({...newWebhook, name: e.target.value})} className="max-w-xs" />
                   <Input placeholder="Endpoint URL (https://...)" value={newWebhook.url} onChange={e => setNewWebhook({...newWebhook, url: e.target.value})} />
                   <Button onClick={createWebhook} className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" /> Add</Button>
                 </div>
               </div>

               {webhooks.length > 0 ? (
                 <div className="space-y-3">
                   {webhooks.map((w) => (
                     <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
                       <div>
                         <p className="font-medium text-slate-900">{w.name}</p>
                         <p className="text-xs text-slate-500 font-mono mt-1">{w.url}</p>
                         <div className="flex gap-2 mt-2">
                            {JSON.parse(w.events || '[]').map((e: string) => <span key={e} className="text-[10px] bg-slate-200 text-slate-600 px-2 rounded">{e}</span>)}
                         </div>
                       </div>
                       <Button variant="ghost" size="sm" onClick={() => deleteWebhook(w.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-slate-500">No webhooks configured yet.</p>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> API Keys</CardTitle>
                 <CardDescription>Manage keys for programmatic access to the Aegix API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" /> Generate API Key</Button>
                 <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 mt-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      API requests must authenticating using the Authorization header with a Bearer token.
                      Generating a new key will display the secret only once.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
