import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markNotificationRead, globalSearch } from '../services/api';
import type { Notification } from '../types';
import {
  IconDashboard, IconInventory, IconBilling, IconPatients, IconSuppliers,
  IconAccounting, IconReports, IconAdmin, IconSearch, IconBell, IconMoon,
  IconSun, IconMenu, IconLogout, IconPill, IconPlus, IconClose
} from './icons';

export type PageKey = 'dashboard' | 'inventory' | 'billing' | 'patients' | 'suppliers' | 'accounting' | 'reports' | 'admin';

const navItems: { key: PageKey; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { key: 'inventory', label: 'Inventory', icon: IconInventory },
  { key: 'billing', label: 'Billing & POS', icon: IconBilling },
  { key: 'patients', label: 'Patients', icon: IconPatients },
  { key: 'suppliers', label: 'Suppliers', icon: IconSuppliers },
  { key: 'accounting', label: 'Accounting', icon: IconAccounting },
  { key: 'reports', label: 'Reports', icon: IconReports },
  { key: 'admin', label: 'Admin', icon: IconAdmin },
];

interface AppLayoutProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: React.ReactNode;
}

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ type: string; id: string; label: string; sub: string }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Load notifications
  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    const updated = await getNotifications();
    setNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDark = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }, [dark]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setSearchOpen(false); return; }
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

  // Close mobile menu on navigate
  const handleNav = (page: PageKey) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`glass-sidebar flex flex-col border-r border-border transition-all duration-300 shrink-0
          ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-[240px]' : 'hidden lg:flex'}
          ${sidebarOpen ? 'lg:w-[240px]' : 'lg:w-[68px]'}`}
      >
        <div className="flex h-14 items-center gap-3 border-b border-border px-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <IconPill className="h-4 w-4 text-primary-foreground" />
          </div>
          {(sidebarOpen || mobileMenuOpen) && <span className="text-lg font-bold text-foreground tracking-tight">PureRx</span>}
          {mobileMenuOpen && (
            <button onClick={() => setMobileMenuOpen(false)} className="ml-auto lg:hidden btn-secondary !p-1.5">
              <IconClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(item => {
            const active = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`sidebar-link w-full text-left ${active ? 'sidebar-link-active' : ''}`}
                title={!sidebarOpen && !mobileMenuOpen ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(sidebarOpen || mobileMenuOpen) && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <button onClick={logout} className="sidebar-link w-full text-left" title={!sidebarOpen ? 'Logout' : undefined}>
            <IconLogout className="h-5 w-5 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex h-14 items-center gap-2 sm:gap-4 border-b border-border bg-card px-3 sm:px-6 shrink-0">
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(true)} className="btn-secondary !p-2 lg:hidden">
            <IconMenu className="h-5 w-5" />
          </button>
          {/* Desktop sidebar toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-secondary !p-2 hidden lg:flex">
            <IconMenu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-lg hidden sm:block">
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

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            <button onClick={toggleDark} className="btn-secondary !p-2" title="Toggle theme">
              {dark ? <IconSun className="h-4 w-4 sm:h-5 sm:w-5" /> : <IconMoon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="btn-secondary !p-2 relative">
                <IconBell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-destructive text-[9px] sm:text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50">
                  <div className="p-3 sm:p-4 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
                    ) : notifications.map(n => (
                      <button
                        key={n.id}
                        className={`flex w-full flex-col gap-1 p-3 sm:p-4 text-left border-b border-border last:border-0 transition-colors hover:bg-muted ${!n.isRead ? 'bg-accent/30' : ''}`}
                        onClick={() => handleMarkRead(n.id)}
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
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-border">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold shrink-0">
                {user?.name?.[0] ?? 'A'}
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - smooth scrolling */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* FABs */}
      <button onClick={() => onNavigate('billing')} className="fab" style={{ bottom: '5rem', right: '1rem' }}>
        <IconPlus className="h-4 w-4" />
        <span className="hidden sm:inline">New Bill</span>
      </button>
      <button
        onClick={() => onNavigate('inventory')}
        className="fab"
        style={{ bottom: '1.5rem', right: '1rem', background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.15)' }}
      >
        <IconPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Stock</span>
      </button>
    </div>
  );
}
