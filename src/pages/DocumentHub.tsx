import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, UploadCloud, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function DocumentHub() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // This would fetch from the actual API endpoint we'll create later
  useEffect(() => {
    // Simulated load
    setTimeout(() => {
      setDocuments([
        { id: '1', title: 'Enterprise SLA Agreement', type: 'contract', author: 'System', date: new Date().toLocaleDateString(), status: 'signed' },
        { id: '2', title: 'Q3 Sales Playbook', type: 'internal', author: 'Sarah Jenkins', date: new Date().toLocaleDateString(), status: 'active' },
        { id: '3', title: 'Acme Corp Proposal', type: 'proposal', author: 'JD', date: new Date().toLocaleDateString(), status: 'pending' },
      ]);
    }, 500);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            Document & Contract Hub
          </h1>
          <p className="text-slate-500 mt-2">
            Secure enterprise repository for proposals, contracts, e-signatures, and collateral.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
           <UploadCloud className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
             placeholder="Search document title or content using Semantic AI..." 
             className="pl-9"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter: All Types</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <Card key={doc.id} className="border-slate-200 shadow-sm hover:shadow transition">
             <CardContent className="p-5 flex gap-4">
               <div className="h-10 w-10 shrink-0 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
                  <FileText className="h-5 w-5" />
               </div>
               <div className="flex-1 min-w-0">
                 <h3 className="text-slate-900 font-semibold truncate">{doc.title}</h3>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{doc.type}</span>
                   <span className="text-xs text-slate-400">• {doc.date}</span>
                 </div>
                 <div className="mt-4 flex items-center justify-between">
                   <span className="text-xs text-slate-500">By {doc.author}</span>
                   {doc.status === 'signed' ? (
                     <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                       <CheckCircle2 className="h-3 w-3" /> Signed
                     </span>
                   ) : doc.status === 'pending' ? (
                     <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                       <AlertCircle className="h-3 w-3" /> Pending Sig
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                       Active
                     </span>
                   )}
                 </div>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
