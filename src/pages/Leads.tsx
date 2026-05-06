import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Mail, Phone, Plus, MoreHorizontal, User as UserIcon, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { ActivityTimeline } from '../components/ActivityTimeline';

export default function Leads() {
  const { data: leads, loading } = useCRMData('leads');
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', source: '', status: 'new' });

  const [selectedLead, setSelectedLead] = useState<any>(null);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const docRef = doc(collection(db, 'leads'));
      const leadData: any = {
        ...newLead,
        ownerId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      if (newLead.status === 'contacted') {
        leadData.lastContacted = Date.now();
      }
      await setDoc(docRef, leadData);
      setIsAddOpen(false);
      setNewLead({ name: '', email: '', phone: '', company: '', source: '', status: 'new' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    if (!user) return;
    try {
      const updates: any = { status, updatedAt: Date.now() };
      if (status === 'contacted') {
        updates.lastContacted = Date.now();
      }
      await updateDoc(doc(db, 'leads', leadId), updates);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, 'leads');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Last Contacted', 'Added Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(l => [
        `"${l.name}"`,
        `"${l.email || ''}"`,
        `"${l.phone || ''}"`,
        `"${l.company || ''}"`,
        `"${l.source || ''}"`,
        `"${l.status}"`,
        `"${l.lastContacted ? new Date(l.lastContacted).toLocaleDateString() : ''}"`,
        `"${new Date(l.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    converted: 'bg-green-100 text-green-700',
    lost: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leads</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredLeads.length === 0}>
             <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddLead} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" placeholder="e.g., Website, Referral" value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="status">Initial Status</Label>
                 <Select value={newLead.status} onValueChange={val => setNewLead({...newLead, status: val})}>
                   <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="new">New</SelectItem>
                     <SelectItem value="contacted">Contacted</SelectItem>
                     <SelectItem value="qualified">Qualified</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <Button type="submit" className="w-full">Save Lead</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search leads..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No leads found</TableCell></TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedLead(lead)}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500">Added {new Date(lead.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        {lead.email && <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {lead.email}</span>}
                        {lead.phone && <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {lead.phone}</span>}
                        {!lead.email && !lead.phone && <span className="text-slate-400 italic">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{lead.company || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{lead.source || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[lead.status] || statusColors.new}`}>
                          {lead.status}
                        </span>
                        {lead.lastContacted && (
                          <span className="text-[10px] text-slate-500 whitespace-nowrap hidden sm:inline-block mt-1">
                            Contacted: {new Date(lead.lastContacted).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          {['new', 'contacted', 'qualified', 'converted', 'lost'].map(status => (
                             <DropdownMenuItem key={status} onClick={() => updateLeadStatus(lead.id, status)} className="capitalize">
                               {status}
                             </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedLead && (
            <div className="space-y-6 pb-6">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                     <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl flex items-center gap-2">
                      {selectedLead.name}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[selectedLead.status] || statusColors.new}`}>
                        {selectedLead.status}
                      </span>
                    </SheetTitle>
                    <p className="text-sm text-slate-500 flex gap-2">
                       {selectedLead.company && <span>{selectedLead.company}</span>}
                       {selectedLead.company && selectedLead.source && <span>•</span>}
                       {selectedLead.source && <span>{selectedLead.source}</span>}
                    </p>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                   <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contact Info</h3>
                   {selectedLead.email && (
                     <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">{selectedLead.email}</a>
                     </div>
                   )}
                   {selectedLead.phone && (
                     <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">{selectedLead.phone}</a>
                     </div>
                   )}
                   {!selectedLead.email && !selectedLead.phone && (
                     <p className="text-sm text-slate-500 italic">No contact information available.</p>
                   )}
                 </div>
                 
                 <ActivityTimeline relatedId={selectedLead.id} relatedType="lead" />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
