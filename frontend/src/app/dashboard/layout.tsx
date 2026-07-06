'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  FileText, 
  Mic, 
  Terminal, 
  Shield, 
  LogOut, 
  Bell, 
  User as UserIcon,
  Menu,
  X,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Authenticated Check Guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setCheckingAuth(false);
      fetchNotifications();
    }
  }, [isAuthenticated, router]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/analytics/notifications');
      setNotifications(response.data.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/analytics/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'ATS Resume', path: '/dashboard/resume', icon: FileText },
    { name: 'Mock Interview', path: '/dashboard/mock', icon: Mic },
    { name: 'Coding Arena', path: '/dashboard/coding', icon: Terminal },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-white/5 bg-[#090d16] px-6 py-4 flex justify-between items-center z-40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          <span className="font-outfit font-extrabold tracking-wide text-white">AURA</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-[#090d16]/95 z-40 transform transition-transform duration-300 md:relative md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-full flex flex-col justify-between p-6">
          <div className="space-y-8">
            {/* Logo */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center font-bold text-white text-lg">
                A
              </div>
              <span className="font-outfit font-extrabold tracking-wide text-white text-xl">AURA</span>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-[#8b5cf6] text-white shadow-lg shadow-violet-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Admin Panel Link */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/dashboard/admin' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          {/* User profile footer */}
          <div className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8b5cf6] font-bold">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="text-sm font-bold text-white block truncate">{user?.name}</span>
                <span className="text-xs text-gray-500 block truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-gray-400 hover:text-red-400 text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Header */}
        <header className="border-b border-white/5 bg-[#090d16]/30 px-6 py-4 flex justify-between items-center relative z-30">
          <h1 className="font-outfit text-xl font-bold text-white capitalize">
            {pathname === '/dashboard' ? 'Overview' : pathname?.split('/').pop()?.replace('-', ' ')}
          </h1>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-card bg-[#090d16]/95 border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                  <h3 className="text-sm font-bold text-white mb-3">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">No notifications yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-2.5 rounded-lg border text-xs transition-colors ${n.isRead ? 'bg-transparent border-white/5' : 'bg-white/5 border-violet-500/20'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`font-bold ${n.isRead ? 'text-gray-400' : 'text-white'}`}>{n.title}</span>
                            {!n.isRead && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                className="text-[10px] font-semibold text-[#a78bfa] hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-gray-400 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Indicator */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center text-white font-bold">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 sm:p-8 relative">
          <div className="absolute top-0 left-0 w-64 h-64 radial-glow pointer-events-none opacity-20" />
          {children}
        </main>
      </div>
    </div>
  );
}
