import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, MoreVertical, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

const stages = [
  { id: 'prospect', title: 'Prospect' },
  { id: 'proposal', title: 'Proposal' },
  { id: 'negotiation', title: 'Negotiation' },
  { id: 'closed_won', title: 'Closed Won' },
  { id: 'closed_lost', title: 'Closed Lost' }
];

export default function Pipeline() {
  const { data: deals, loading } = useCRMData('deals');
  const { data: customers } = useCRMData('customers');
  const { user } = useAuth();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', customerId: '', value: '', stage: 'prospect', probability: '' });

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const docRef = doc(collection(db, 'deals'));
      await setDoc(docRef, {
        title: newDeal.title,
        customerId: newDeal.customerId,
        value: Number(newDeal.value) || 0,
        stage: newDeal.stage,
        probability: Number(newDeal.probability) || 0,
        ownerId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setIsAddOpen(false);
      setNewDeal({ title: '', customerId: '', value: '', stage: 'prospect', probability: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'deals');
    }
  };

  const updateStage = async (dealId: string, stage: string) => {
    try {
      await updateDoc(doc(db, 'deals', dealId), { stage, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'deals');
    }
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Pipeline</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
            <Plus className="mr-2 h-4 w-4" /> Add Deal
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDeal} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deal Title</Label>
                <Input id="title" required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="customer">Customer</Label>
                 <Select value={newDeal.customerId} onValueChange={val => setNewDeal({...newDeal, customerId: val})}>
                   <SelectTrigger id="customer"><SelectValue placeholder="Select Customer" /></SelectTrigger>
                   <SelectContent>
                     {customers.map(c => (
                       <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value ($)</Label>
                  <Input id="value" type="number" required value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input id="probability" type="number" max="100" min="0" value={newDeal.probability} onChange={e => setNewDeal({...newDeal, probability: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                 <Label htmlFor="stage">Initial Stage</Label>
                 <Select value={newDeal.stage} onValueChange={val => setNewDeal({...newDeal, stage: val})}>
                   <SelectTrigger id="stage"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                   </SelectContent>
                 </Select>
              </div>
              <Button type="submit" className="w-full">Save Deal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const totalValue = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
            return (
              <div key={stage.id} className="flex flex-col w-80 bg-slate-50 rounded-lg shrink-0">
                <div className="p-4 border-b bg-slate-100/50 rounded-t-lg">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-slate-700">{stage.title}</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full border border-slate-300">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">${totalValue.toLocaleString()}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageDeals.map(deal => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-slate-900 leading-tight">{deal.title}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" className="h-6 w-6 p-0 -mt-1 -mr-2 text-slate-400 hover:text-slate-600" />}>
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                               {stages.map(s => (
                                 <DropdownMenuItem key={s.id} disabled={s.id === deal.stage} onClick={() => updateStage(deal.id, s.id)}>
                                   Move to {s.title}
                                 </DropdownMenuItem>
                               ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-slate-500">{getCustomerName(deal.customerId)}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center text-sm font-semibold text-slate-700">
                            <DollarSign className="h-3 w-3 mr-0.5 text-slate-400" />
                            {Number(deal.value).toLocaleString()}
                          </div>
                          {deal.probability ? (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                              {deal.probability}%
                            </span>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
