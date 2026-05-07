import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { apiFetch } from '../lib/api';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search, Mail, Phone, Building, User as UserIcon, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { NotesList } from '../components/NotesList';
import { TagsBlock } from '../components/TagsBlock';
import { AIToolkit } from '../components/AIToolkit';

export default function Companies() {
  const { data: companies, loading } = useCRMData('companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', email: '', phone: '', company: '' });
  
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyData: any = {
        name: newCompany.name,
        status: 'active',
      };

      if (newCompany.email.trim()) companyData.email = newCompany.email.trim();
      if (newCompany.phone.trim()) companyData.phone = newCompany.phone.trim();
      if (newCompany.company.trim()) companyData.company = newCompany.company.trim();

      await apiFetch('/crm/companies', {
        method: 'POST',
        body: JSON.stringify(companyData)
      });
      setIsAddOpen(false);
      setNewCompany({ name: '', email: '', phone: '', company: '' });
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to create company:", error.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Added Date'];
    const csvContent = [
      headers.join(','),
      ...filteredCompanies.map(c => [
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
    link.setAttribute('download', 'companies_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Companies</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV} disabled={filteredCompanies.length === 0}>
             <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Company
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompany} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={newCompany.company} onChange={e => setNewCompany({...newCompany, company: e.target.value})} />
                </div>
                <Button type="submit" className="w-full">Save Company</Button>
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
                placeholder="Search companies..."
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
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No companies found</TableCell></TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedCompany(company)}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-500">Added {new Date(company.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        {company.email && <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {company.email}</span>}
                        {company.phone && <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {company.phone}</span>}
                        {!company.email && !company.phone && <span className="text-slate-400 italic">No contact info</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.company && (
                         <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building className="h-4 w-4 text-slate-400" />
                          {company.company}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {company.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedCompany && (
            <div className="space-y-6 pb-6">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                     <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedCompany.name}</SheetTitle>
                    <p className="text-sm text-slate-500">{selectedCompany.company || 'No Company'}</p>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                   <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contact Info</h3>
                   {selectedCompany.email && (
                     <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${selectedCompany.email}`} className="text-blue-600 hover:underline">{selectedCompany.email}</a>
                     </div>
                   )}
                   {selectedCompany.phone && (
                     <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <a href={`tel:${selectedCompany.phone}`} className="text-blue-600 hover:underline">{selectedCompany.phone}</a>
                     </div>
                   )}
                   {!selectedCompany.email && !selectedCompany.phone && (
                     <p className="text-sm text-slate-500 italic">No contact information available.</p>
                   )}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100">
                   <AIToolkit entityId={selectedCompany.id} entityType="company" />
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100">
                   <TagsBlock entityId={selectedCompany.id} entityType="company" />
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100">
                   <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-4">Activity History</h3>
                   <ActivityTimeline relatedId={selectedCompany.id} relatedType="company" />
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                   <NotesList relatedId={selectedCompany.id} relatedType="company" />
                 </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
