import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { apiFetch } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Download, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { NotesList } from '../components/NotesList';
import { TagsBlock } from '../components/TagsBlock';
import { AIToolkit } from '../components/AIToolkit';

export default function Contacts() {
  const { data: contacts, loading } = useCRMData('contacts');
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const filteredContacts = contacts.filter(c => 
    c.firstName.toLowerCase().includes(search.toLowerCase()) || 
    c.lastName.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contactData: any = {
        firstName: newContact.firstName,
        lastName: newContact.lastName,
      };
      if (newContact.email.trim()) contactData.email = newContact.email.trim();
      if (newContact.phone.trim()) contactData.phone = newContact.phone.trim();
      if (newContact.jobTitle.trim()) contactData.jobTitle = newContact.jobTitle.trim();

      await apiFetch('/crm/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to create contact:", error.message);
    }
  };

  const exportToCSV = () => {
    if (!filteredContacts.length) return;
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Created At'];
    const rows = filteredContacts.map(c => [
      c.firstName,
      c.lastName,
      c.email || '',
      c.phone || '',
      c.jobTitle || '',
      new Date(c.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contacts_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between z-10 sticky top-0 bg-slate-50 py-2 -mt-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contacts</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredContacts.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Contact
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                    <Input id="firstName" required value={newContact.firstName} onChange={e => setNewContact({...newContact, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                    <Input id="lastName" required value={newContact.lastName} onChange={e => setNewContact({...newContact, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <Input id="phone" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="jobTitle" className="text-sm font-medium">Job Title</label>
                  <Input id="jobTitle" value={newContact.jobTitle} onChange={e => setNewContact({...newContact, jobTitle: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Save Contact</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4 bg-white rounded-t-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search contacts..."
                className="pl-9 bg-slate-50 border-transparent focus:bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Job Title</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No contacts found. Add one to get started.</TableCell></TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No contacts match your search.</TableCell></TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedContact(contact)}>
                      <TableCell>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{contact.firstName} {contact.lastName}</TableCell>
                      <TableCell className="text-slate-500">{contact.email || '-'}</TableCell>
                      <TableCell className="text-slate-500">{contact.phone || '-'}</TableCell>
                      <TableCell className="text-slate-500">{contact.jobTitle || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedContact && (
            <div className="space-y-6 mt-4">
               <SheetHeader>
                 <div className="flex items-center gap-4">
                   <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-2xl">
                     {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                   </div>
                   <div>
                    <SheetTitle className="text-xl">{selectedContact.firstName} {selectedContact.lastName}</SheetTitle>
                    <p className="text-sm text-slate-500">{selectedContact.jobTitle || 'No Title'}</p>
                   </div>
                 </div>
               </SheetHeader>
               
               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Contact Details</h3>
                 <div className="grid grid-cols-1 gap-3 text-sm">
                   {selectedContact.email && (
                     <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-medium mb-1">Email</span>
                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">{selectedContact.email}</a>
                     </div>
                   )}
                   {selectedContact.phone && (
                     <div className="flex flex-col">
                        <span className="text-slate-500 text-xs font-medium mb-1">Phone</span>
                        <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">{selectedContact.phone}</a>
                     </div>
                   )}
                   {!selectedContact.email && !selectedContact.phone && (
                     <p className="text-slate-400 italic">No contact information provided.</p>
                   )}
                 </div>
               </div>

               <div className="space-y-4 pt-4 border-t">
                 <AIToolkit entityId={selectedContact.id} entityType="contact" />
               </div>

               <div className="space-y-4 pt-4 border-t">
                 <TagsBlock entityId={selectedContact.id} entityType="contact" />
               </div>

               <div className="space-y-4 pt-4 border-t">
                 <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Activity History</h3>
                 <ActivityTimeline relatedId={selectedContact.id} relatedType="contact" />
               </div>

               <div className="space-y-4 pt-4 border-t">
                 <NotesList relatedId={selectedContact.id} relatedType="contact" />
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
