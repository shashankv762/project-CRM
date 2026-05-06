import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Phone, Mail, Calendar, MessageSquare, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  relatedId: string;
  relatedType: 'customer' | 'lead';
}

export function ActivityTimeline({ relatedId, relatedType }: ActivityTimelineProps) {
  const { data: activities, loading } = useCRMData('activities');
  const { user } = useAuth();
  
  const [newActivity, setNewActivity] = useState({ type: 'note', summary: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredActivities = activities
    .filter(a => a.relatedId === relatedId && a.relatedType === relatedType)
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newActivity.summary.trim()) return;
    
    setIsSubmitting(true);
    try {
      const docRef = doc(collection(db, 'activities'));
      await setDoc(docRef, {
        type: newActivity.type,
        summary: newActivity.summary,
        relatedId,
        relatedType,
        ownerId: user.uid,
        createdAt: Date.now()
      });
      setNewActivity({ type: 'note', summary: '' });
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'activities');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'note':
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold text-slate-800">Activity Timeline</h3>
      
      <form onSubmit={handleAddActivity} className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="flex gap-3">
          <div className="w-1/3">
            <Select value={newActivity.type} onValueChange={val => setNewActivity({...newActivity, type: val})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea 
            className="flex-1 min-h-[40px] h-10 resize-none py-2" 
            placeholder="Log an activity..."
            value={newActivity.summary}
            onChange={e => setNewActivity({...newActivity, summary: e.target.value})}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !newActivity.summary.trim()} size="sm">
            Log Activity
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500 text-center">Loading activities...</p>
        ) : filteredActivities.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4 border border-dashed rounded-lg">No activities yet.</p>
        ) : (
          <div className="relative border-l border-slate-200 ml-3 space-y-6">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="relative pl-6">
                <div className="absolute -left-3 top-1 bg-white p-1 rounded-full border border-slate-200 text-slate-500 shadow-sm">
                  {getIcon(activity.type)}
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-1">
                     <span className="font-medium text-sm capitalize text-slate-700">{activity.type}</span>
                     <span className="text-xs text-slate-500 flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       {new Date(activity.createdAt).toLocaleString()}
                     </span>
                   </div>
                   <p className="text-sm text-slate-600 whitespace-pre-wrap">{activity.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
