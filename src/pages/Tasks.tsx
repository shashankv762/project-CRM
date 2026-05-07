import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { apiFetch } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, CheckCircle2, Clock, Phone, Mail, Calendar, Target, Building2, User, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

export default function Tasks() {
  const { data: tasks, loading } = useCRMData('tasks');
  const { data: deals } = useCRMData('deals');
  const { data: contacts } = useCRMData('contacts');
  const { data: companies } = useCRMData('companies');
  const { data: leads } = useCRMData('leads');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', type: 'todo', relatedType: 'none', relatedId: 'none' });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).getTime() : Date.now(),
        status: 'pending'
      };

      if (newTask.relatedType !== 'none' && newTask.relatedId !== 'none') {
        payload[`${newTask.relatedType}Id`] = newTask.relatedId;
      }

      await apiFetch('/crm/tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setIsAddOpen(false);
      setNewTask({ title: '', description: '', dueDate: '', type: 'todo', relatedType: 'none', relatedId: 'none' });
      window.location.reload(); 
    } catch (error: any) {
       console.error("Failed to create task:", error.message);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await apiFetch(`/crm/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      window.location.reload();
    } catch (error: any) {
       console.error("Failed to update task:", error.message);
    }
  };

  const handleUpdateDueDate = async (taskId: string, newDueDateString: string) => {
    if (!newDueDateString) return;
    try {
      await apiFetch(`/crm/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ dueDate: new Date(newDueDateString).getTime() })
      });
      // Optionally reload or state update
    } catch (error: any) {
       console.error("Failed to update due date:", error.message);
    }
  };

  const formatForDateInput = (timestamp: number) => {
    const d = new Date(timestamp);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').sort((a, b) => a.dueDate - b.dueDate);
  const completedTasks = tasks.filter(t => t.status === 'completed').sort((a, b) => b.updatedAt - a.updatedAt);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Task Type</Label>
                <Select value={newTask.type} onValueChange={val => setNewTask({...newTask, type: val})}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To-Do</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" required value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relatedType">Related To</Label>
                <Select value={newTask.relatedType} onValueChange={val => setNewTask({...newTask, relatedType: val, relatedId: 'none'})}>
                  <SelectTrigger id="relatedType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newTask.relatedType !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="relatedId">Select {newTask.relatedType}</Label>
                  <Select value={newTask.relatedId} onValueChange={val => setNewTask({...newTask, relatedId: val})}>
                    <SelectTrigger id="relatedId"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select...</SelectItem>
                      {newTask.relatedType === 'deal' && deals.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                      {newTask.relatedType === 'contact' && contacts.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}
                      {newTask.relatedType === 'company' && companies.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      {newTask.relatedType === 'lead' && leads.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name} {l.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full">Save Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" /> Pending ({pendingTasks.length})
          </h2>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-slate-500 italic text-sm">All caught up!</p>
            ) : (
              pendingTasks.map(task => (
                <Card key={task.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex gap-4 items-start">
                    <Checkbox className="mt-1 border-slate-300" 
                      checked={false} 
                      onCheckedChange={() => toggleTaskStatus(task.id, task.status)} 
                    />
                    <div className="flex-1 space-y-1">
                       <h3 className="font-medium text-slate-900 leading-none">{task.title}</h3>
                       <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                         <span className="flex items-center gap-1">
                           {getTaskIcon(task.type)}
                           <span className="capitalize">{task.type}</span>
                         </span>
                         <span className="flex items-center gap-1">
                           <span>Due:</span>
                           <Input 
                             type="date"
                             className="h-6 text-xs px-2 py-0 border-transparent hover:border-slate-200 w-[110px] bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-300"
                             value={formatForDateInput(task.dueDate)}
                             onChange={(e) => handleUpdateDueDate(task.id, e.target.value)}
                           />
                         </span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Completed ({completedTasks.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {completedTasks.slice(0, 10).map(task => (
                <Card key={task.id}>
                  <CardContent className="p-4 flex gap-4 items-start">
                    <Checkbox className="mt-1" 
                      checked={true} 
                      onCheckedChange={() => toggleTaskStatus(task.id, task.status)} 
                    />
                    <div className="flex-1 space-y-1">
                       <h3 className="font-medium text-slate-500 line-through leading-none">{task.title}</h3>
                       <div className="flex items-center gap-3 text-sm text-slate-400 mt-2">
                         <span className="flex items-center gap-1">
                           {getTaskIcon(task.type)}
                           <span className="capitalize">{task.type}</span>
                         </span>
                         <span>Completed: {new Date(task.updatedAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
            {completedTasks.length > 10 && <p className="text-sm text-slate-500 text-center pt-2">Showing latest 10 completed tasks</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
