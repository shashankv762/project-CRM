import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search, Mail, Phone, Building, User as UserIcon, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { ActivityTimeline } from '../components/ActivityTimeline';

export default function Customers() {
  const { data: customers, loading } = useCRMData('customers');
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', company: '' });
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const docRef = doc(collection(db, 'customers'));
      await setDoc(docRef, {
        ...newCustomer,
        status: 'active',
        ownerId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setIsAddOpen(false);
      setNewCustomer({ name: '', email: '', phone: '', company: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'customers');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Added Date'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(c => [
        `"${c.name}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.company || ''}"`,
        `"${c.status}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredCustomers.length === 0}>
             <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={newCustomer.company} onChange={e => setNewCustomer({...newCustomer, company: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Save Customer</Button>
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
                placeholder="Search customers..."
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
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No customers found</TableCell></TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedCustomer(customer)}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{customer.name}</div>
                      <div className="text-xs text-slate-500">Added {new Date(customer.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        {customer.email && <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {customer.email}</span>}
                        {customer.phone && <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {customer.phone}</span>}
                        {!customer.email && !customer.phone && <span className="text-slate-400 italic">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.company && (
                         <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building className="h-4 w-4 text-slate-400" />
                          {customer.company}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {customer.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedCustomer && (
            <div className="space-y-6 pb-6">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                     <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedCustomer.name}</SheetTitle>
                    <p className="text-sm text-slate-500">{selectedCustomer.company || 'No Company'}</p>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                   <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contact Info</h3>
                   {selectedCustomer.email && (
                     <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${selectedCustomer.email}`} className="text-blue-600 hover:underline">{selectedCustomer.email}</a>
                     </div>
                   )}
                   {selectedCustomer.phone && (
                     <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <a href={`tel:${selectedCustomer.phone}`} className="text-blue-600 hover:underline">{selectedCustomer.phone}</a>
                     </div>
                   )}
                   {!selectedCustomer.email && !selectedCustomer.phone && (
                     <p className="text-sm text-slate-500 italic">No contact information available.</p>
                   )}
                 </div>
                 
                 <ActivityTimeline relatedId={selectedCustomer.id} relatedType="customer" />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
