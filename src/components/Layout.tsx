import React from 'react';
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
  Briefcase
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Leads', href: '/leads', icon: UserPlus },
  { name: 'Pipeline', href: '/pipeline', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export default function Layout() {
  const { user, logOut } = useAuth();

  const NavItems = () => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-blue-50 text-blue-700' 
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white h-full">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">NovaCRM</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavItems />
        </div>
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="flex items-center gap-3 w-full hover:bg-slate-50 p-2 rounded-lg transition-colors text-left text-sm" />}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-slate-900 truncate">{user?.displayName}</p>
                <p className="text-slate-500 truncate">{user?.email}</p>
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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md text-white">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-900">NovaCRM</span>
          </div>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6 flex items-center gap-3 border-b">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-slate-900">NovaCRM</span>
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
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
