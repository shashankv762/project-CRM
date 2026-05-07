import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, 
  Users, 
  UserPlus, 
  Target, 
  CheckSquare, 
  FileText,
  LogOut,
  Menu,
  Briefcase,
  Sparkles,
  Command
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart },
  { name: 'AI Center', href: '/ai-center', icon: Sparkles },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Leads', href: '/leads', icon: UserPlus },
  { name: 'Pipeline', href: '/pipeline', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export default function Layout() {
  const { user, logOut } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);

  // Quick listener for CMD+K to simulate command center
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const NavItems = () => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.name}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white h-full relative z-10">
        <div className="p-6 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">
              <WorkflowIcon className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Aegix</span>
          </div>
        </div>
        
        {/* Global Command Bar Hint */}
        <div className="p-4">
          <button 
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
          >
            <span className="flex items-center gap-2"><Command className="h-4 w-4"/> AI Command</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          <NavItems />
        </div>
        <div className="p-4 border-t bg-slate-50/50">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="flex items-center gap-3 w-full hover:bg-slate-100 p-2 rounded-lg transition-colors text-left text-sm border border-transparent hover:border-slate-200" />}>
              <Avatar className="h-9 w-9 border border-indigo-100 shadow-sm">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-slate-900 truncate">{user?.displayName}</p>
                <p className="text-slate-500 truncate text-xs">{user?.email}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={logOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b z-10 relative">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-md text-white">
              <WorkflowIcon className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-900">Aegix</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCmdOpen(true)} className="text-slate-500">
              <Sparkles className="h-5 w-5" />
            </Button>
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="text-slate-500" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                 <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="p-6 flex items-center gap-3 border-b">
                  <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <WorkflowIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold text-slate-900 tracking-tight">Aegix</span>
                </div>
                <div className="py-4 px-3 space-y-1">
                  <NavItems />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                   <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={logOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                   </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* Global Command Center Overlay */}
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setCmdOpen(false)}>
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-100">
                <Sparkles className="h-5 w-5 text-indigo-500 mr-3 shrink-0" />
                <input 
                  autoFocus 
                  placeholder="Ask Aegix AI or search your CRM..." 
                  className="w-full bg-transparent border-none text-lg text-slate-900 focus:outline-none focus:ring-0 placeholder:text-slate-400"
                />
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-500">
                  ESC
                </kbd>
              </div>
              <div className="p-2">
                 <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Actions</div>
                 <NavLink to="/ai-center" onClick={() => setCmdOpen(false)} className="w-full flex items-center px-3 py-3 hover:bg-slate-50 rounded-lg text-left text-sm text-slate-700 transition">
                   <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded mr-3"><FileText className="h-4 w-4" /></span>
                   Draft a follow-up email to recently contacted leads
                 </NavLink>
                 <NavLink to="/ai-center" onClick={() => setCmdOpen(false)} className="w-full flex items-center px-3 py-3 hover:bg-slate-50 rounded-lg text-left text-sm text-slate-700 transition">
                   <span className="bg-blue-100 text-blue-700 p-1.5 rounded mr-3"><Target className="h-4 w-4" /></span>
                   Analyze my pipeline forecast for this month
                 </NavLink>
                 <NavLink to="/ai-center" onClick={() => setCmdOpen(false)} className="w-full flex items-center px-3 py-3 hover:bg-slate-50 rounded-lg text-left text-sm text-slate-700 transition">
                   <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded mr-3"><Users className="h-4 w-4" /></span>
                   Find customers at risk of churn
                 </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="8" x="3" y="3" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      <rect width="8" height="8" x="13" y="13" rx="2" />
    </svg>
  );
}
