import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markNotificationRead, globalSearch } from '../services/api';
import {
  IconDashboard, IconInventory, IconBilling, IconPatients, IconSuppliers,
  IconAccounting, IconReports, IconAdmin, IconSearch, IconBell, IconMoon,
  IconSun, IconMenu, IconLogout, IconPill, IconPlus
} from './icons';

const navItems = [
  { to: '/dashboard' as const, label: 'Dashboard', icon: IconDashboard },
  { to: '/inventory' as const, label: 'Inventory', icon: IconInventory },
  { to: '/billing' as const, label: 'Billing & POS', icon: IconBilling },
  { to: '/patients' as const, label: 'Patients', icon: IconPatients },
  { to: '/suppliers' as const, label: 'Suppliers', icon: IconSuppliers },
  { to: '/accounting' as const, label: 'Accounting', icon: IconAccounting },
  { to: '/reports' as const, label: 'Reports', icon: IconReports },
  { to: '/admin' as const, label: 'Admin', icon: IconAdmin },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ type: string; id: string; label: string; sub: string }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDark = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }, [dark]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const res = await globalSearch(searchQuery);
      setSearchResults(res);
      setSearchOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`glass-sidebar flex flex-col border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-[240px]' : 'w-[68px]'}`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <IconPill className="h-5 w-5 text-primary-foreground" />
          </div>
          {sidebarOpen && <span className="text-lg font-bold text-foreground tracking-tight">PureRx</span>}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button onClick={logout} className="sidebar-link w-full text-left" title={!sidebarOpen ? 'Logout' : undefined}>
            <IconLogout className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-secondary !p-2">
            <IconMenu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-lg">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search medicines, bills, patients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field !pl-10"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map(r => (
                  <button
                    key={`${r.type}-${r.id}`}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  >
                    <span className="badge badge-info text-xs">{r.type}</span>
                    <span className="text-sm font-medium text-foreground">{r.label}</span>
                    <span className="text-xs text-muted-foreground">{r.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button onClick={toggleDark} className="btn-secondary !p-2" title="Toggle theme">
              {dark ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="btn-secondary !p-2 relative">
                <IconBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                    ) : notifications.map(n => (
                      <button
                        key={n.id}
                        className={`flex w-full flex-col gap-1 p-4 text-left border-b border-border last:border-0 transition-colors hover:bg-muted ${!n.isRead ? 'bg-accent/30' : ''}`}
                        onClick={() => markReadMut.mutate(n.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'}`}>
                            {n.type}
                          </span>
                          <span className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleDateString()}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{n.title}</span>
                        <span className="text-xs text-muted-foreground">{n.message}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {user?.name?.[0] ?? 'A'}
              </div>
              {sidebarOpen && (
                <div className="hidden xl:block">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* FABs */}
      <Link to="/billing" className="fab" style={{ bottom: '6rem', right: '1.5rem' }}>
        <IconPlus className="h-4 w-4" />
        New Bill
      </Link>
      <Link to="/inventory" className="fab" style={{ bottom: '2rem', right: '1.5rem', background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.15)' }}>
        <IconPlus className="h-4 w-4" />
        Add Stock
      </Link>
    </div>
  );
}
