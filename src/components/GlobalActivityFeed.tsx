import React from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { Phone, Mail, Calendar, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GlobalActivityFeed() {
  const { data: activities, loading } = useCRMData('activities');

  const recent = [...activities].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'meeting': return <Calendar className="h-3 w-3" />;
      case 'system': return <ArrowRight className="h-3 w-3" />;
      case 'note':
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => (
           <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              <div className="space-y-2 flex-1">
                 <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                 <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              </div>
           </div>
        ))}
     </div>;
  }

  if (recent.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-4 border border-dashed rounded-lg">No recent activity.</p>;
  }

  return (
    <div className="relative border-l border-slate-200 ml-3 space-y-6">
      {recent.map((activity) => {
        let linkTarget = '/';
        if (activity.entityType === 'company') linkTarget = '/companies';
        if (activity.entityType === 'contact') linkTarget = '/contacts';
        if (activity.entityType === 'deal') linkTarget = '/pipeline';
        if (activity.entityType === 'lead') linkTarget = '/leads';
        
        return (
          <div key={activity.id} className="relative pl-6">
            <div className="absolute -left-2.5 top-1 bg-white p-1 rounded-full border border-slate-200 text-slate-500 shadow-sm">
              {getIcon(activity.type)}
            </div>
            <div>
               <div className="flex items-center gap-2 mb-0.5">
                 <span className="font-medium text-sm text-slate-900">
                    {activity.title || (activity.type === 'note' ? 'Added a note' : `Created a ${activity.type}`)}
                 </span>
                 <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                   <Clock className="h-3 w-3" />
                   {new Date(activity.createdAt).toLocaleDateString()}
                 </span>
               </div>
               <p className="text-sm text-slate-600 line-clamp-2">{activity.content}</p>
               {activity.entityType && (
                  <Link to={linkTarget} className="text-xs text-indigo-600 hover:underline mt-1 inline-block capitalize">
                    View in {activity.entityType}s &rarr;
                  </Link>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
