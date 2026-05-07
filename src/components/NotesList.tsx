import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { apiFetch } from '../lib/api';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageSquare, Plus, FileText, Send } from 'lucide-react';

interface NotesListProps {
  relatedId: string;
  relatedType: 'company' | 'contact' | 'lead' | 'deal' | 'task';
}

export function NotesList({ relatedId, relatedType }: NotesListProps) {
  const { data: notes, loading } = useCRMData('notes');
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');

  const relatedNotes = notes
    .filter(n => n[`${relatedType}Id`] === relatedId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const payload: any = { content };
      payload[`${relatedType}Id`] = relatedId;
      
      await apiFetch('/crm/notes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setContent('');
      setIsAdding(false);
      // Let standard flow reload the page or trigger SWR/React Query mutate
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
     return <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" /> Notes
         </h3>
         {!isAdding && (
           <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => setIsAdding(true)}>
             <Plus className="mr-1 h-3 w-3" /> Add Note
           </Button>
         )}
      </div>

      {isAdding && (
         <form onSubmit={handleAddNote} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
           <Textarea 
             autoFocus
             placeholder="Type your note here..." 
             className="min-h-[80px] text-sm bg-white border-slate-200 focus-visible:ring-indigo-500"
             value={content}
             onChange={e => setContent(e.target.value)}
           />
           <div className="flex justify-end gap-2">
             <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
             <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="mr-2 h-3 w-3" /> Save Note
             </Button>
           </div>
         </form>
      )}

      <div className="space-y-3">
        {relatedNotes.length === 0 && !isAdding ? (
           <p className="text-sm text-slate-500 italic py-2">No notes added yet.</p>
        ) : (
          relatedNotes.map(note => (
            <div key={note.id} className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50 flex gap-3 text-sm">
               <div className="shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-orange-400" />
               </div>
               <div>
                 <div className="text-slate-700 whitespace-pre-wrap">{note.content}</div>
                 <div className="text-[10px] text-slate-400 mt-2">
                   {new Date(note.createdAt).toLocaleString()}
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
