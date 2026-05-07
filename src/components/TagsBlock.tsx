import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Plus, X, Tag as TagIcon } from 'lucide-react';

interface TagsProps {
  entityId: string;
  entityType: 'company' | 'contact' | 'lead' | 'deal';
}

export function TagsBlock({ entityId, entityType }: TagsProps) {
  const [tags, setTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTags();
  }, [entityId, entityType]);

  const loadTags = async () => {
    try {
      const [entityTags, globalTags] = await Promise.all([
        apiFetch(`/tags/links?entityId=${entityId}&entityType=${entityType}`),
        apiFetch(`/tags`)
      ]);
      setTags(entityTags);
      setAllTags(globalTags);
    } catch (e) {
      console.error(e);
    }
  };

  const linkTag = async (tagId: string) => {
    try {
      await apiFetch(`/tags/links`, {
        method: 'POST',
        body: JSON.stringify({ tagId, entityId, entityType })
      });
      loadTags();
    } catch (e) {
      console.error(e);
    }
  };

  const createAndLinkTag = async () => {
    if (!search.trim()) return;
    try {
      const newTag = await apiFetch(`/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: search, color: '#e2e8f0' })
      });
      await linkTag(newTag.id);
      setSearch('');
    } catch (e) {
      console.error(e);
    }
  };

  const unlinkTag = async (tagId: string) => {
    try {
      await apiFetch(`/tags/links?tagId=${tagId}&entityId=${entityId}&entityType=${entityType}`, {
        method: 'DELETE'
      });
      loadTags();
    } catch (e) {
      console.error(e);
    }
  };

  const availableTags = allTags.filter(t => !tags.find(myT => myT.id === t.id));
  const filteredAvailable = availableTags.filter(t => t.name.includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
       <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-slate-500" /> Tags
       </h3>
       <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
          {tags.map(tag => (
             <Badge key={tag.id} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 font-medium flex items-center gap-1">
                {tag.name}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => unlinkTag(tag.id)} />
             </Badge>
          ))}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs rounded-full bg-slate-50 border-dashed border-slate-300 text-slate-500">
                 <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
               <Input 
                 placeholder="Search or create..." 
                 className="h-8 text-xs mb-2" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 onKeyDown={e => {
                   if(e.key === 'Enter') createAndLinkTag();
                 }}
               />
               <div className="space-y-1 max-h-48 overflow-y-auto">
                 {filteredAvailable.map(tag => (
                   <div 
                     key={tag.id} 
                     className="px-2 py-1.5 text-xs hover:bg-slate-100 cursor-pointer rounded"
                     onClick={() => { linkTag(tag.id); setOpen(false); setSearch(''); }}
                   >
                     {tag.name}
                   </div>
                 ))}
                 {search.trim() && !filteredAvailable.find(t => t.name === search.toLowerCase().trim()) && (
                   <div 
                     className="px-2 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 cursor-pointer rounded flex items-center font-medium"
                     onClick={() => { createAndLinkTag(); setOpen(false); }}
                   >
                     <Plus className="h-3 w-3 mr-1" /> Create "{search}"
                   </div>
                 )}
               </div>
            </PopoverContent>
          </Popover>
       </div>
    </div>
  );
}
