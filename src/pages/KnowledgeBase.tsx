import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Search, Folder, ChevronRight, Plus } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'Standard Operating Procedures', count: 14 },
    { name: 'Sales Playbooks', count: 8 },
    { name: 'Product Documentation', count: 32 },
    { name: 'Onboarding & Training', count: 5 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            Knowledge Base
          </h1>
          <p className="text-slate-500 mt-2">
            Centralized hub for team documentation, battle cards, and best practices.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
           <Plus className="h-4 w-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <Input 
             placeholder="Search across all playbooks and documentation..." 
             className="pl-12 py-6 text-lg rounded-xl bg-white shadow-sm border-slate-200"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {categories.map((cat, i) => (
            <Card key={i} className="border-slate-200 hover:border-indigo-300 transition-colors shadow-sm cursor-pointer group">
               <CardContent className="p-6">
                 <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Folder className="h-6 w-6" />
                 </div>
                 <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                 <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-slate-500">{cat.count} articles</p>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                 </div>
               </CardContent>
            </Card>
         ))}
      </div>

      <div className="mt-8 flex-1">
         <h2 className="text-lg font-semibold text-slate-900 mb-4">Recently Updated</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
               { title: 'Enterprise Objection Handling Guide', cat: 'Sales Playbooks', date: '2 days ago' },
               { title: 'Q3 Product Roadmap Summary', cat: 'Product Documentation', date: '5 days ago' },
               { title: 'New Sales Rep Onboarding Checklist', cat: 'Onboarding', date: '1 week ago' },
               { title: 'How to use Aegix AI Insights', cat: 'Standard Operating Procedures', date: '2 weeks ago' }
            ].map((article, i) => (
               <Card key={i} className="hover:bg-slate-50 transition cursor-pointer border-slate-200 shadow-sm">
                 <CardContent className="p-5 flex items-start justify-between">
                    <div>
                       <h4 className="font-semibold text-slate-800 text-base">{article.title}</h4>
                       <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{article.cat}</span>
                          <span className="text-slate-400">Updated {article.date}</span>
                       </div>
                    </div>
                 </CardContent>
               </Card>
            ))}
         </div>
      </div>
    </div>
  );
}
