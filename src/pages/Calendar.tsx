import React, { useState } from 'react';
import { useCRMData } from '../hooks/useCRMData';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';

export default function Calendar() {
  const { data: tasks, loading } = useCRMData('tasks');
  const { data: deals } = useCRMData('deals');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayItems = (day: number) => {
    const items = [];
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Find Tasks
    const dayTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const tDate = new Date(t.dueDate);
      return tDate.toDateString() === checkDate.toDateString();
    });
    dayTasks.forEach(t => items.push({ ...t, itemType: 'task' }));

    // Find Deals
    const dayDeals = deals.filter(d => {
      if (!d.expectedCloseAt) return false;
      const dDate = new Date(d.expectedCloseAt);
      return dDate.toDateString() === checkDate.toDateString();
    });
    dayDeals.forEach(d => items.push({ ...d, itemType: 'deal' }));

    return items;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading calendar...</div>;
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
           <CalendarIcon className="h-8 w-8 text-indigo-600" />
           Calendar
        </h1>
        <div className="flex items-center gap-4 bg-white px-2 py-1 rounded-lg border border-slate-200">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
          <span className="text-sm font-semibold text-slate-800 w-32 justify-center flex">
             {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 min-h-[600px]">
        <CardContent className="p-0 flex flex-col h-full bg-slate-50">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
            {weekdays.map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/50 p-2 min-h-24"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const items = getDayItems(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              return (
                <div key={day} className={`border-r border-b border-slate-200 p-2 min-h-28 overflow-hidden hover:bg-slate-50 transition-colors ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                       {day}
                     </span>
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                    {items.map((item: any, idx) => (
                      item.itemType === 'task' ? (
                        <div key={`task-${item.id}-${idx}`} className="text-[11px] leading-tight flex items-start gap-1 p-1 bg-blue-50 border border-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-100">
                           {item.status === 'completed' ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500 mt-px" /> : <Clock className="h-3 w-3 shrink-0 text-blue-400 mt-px" />}
                           <span className="truncate">{item.title}</span>
                        </div>
                      ) : (
                        <div key={`deal-${item.id}-${idx}`} className="text-[11px] leading-tight flex items-start gap-1 p-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded cursor-pointer hover:bg-emerald-100">
                           <span className="font-semibold text-emerald-600 shrink-0">$</span>
                           <span className="truncate">Close: {item.title}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
