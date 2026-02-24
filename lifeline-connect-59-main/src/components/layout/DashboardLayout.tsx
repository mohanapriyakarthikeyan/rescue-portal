import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Home,
  Users,
  Map,
  BarChart3,
  Settings,
  LogOut,
  HandHeart,
  ClipboardList,
  Bell,
  MapPin,
  User,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const victimLinks = [
  { to: '/victim', icon: Home, label: 'Dashboard' },
  { to: '/victim/request', icon: AlertTriangle, label: 'Request Help' },
  { to: '/victim/my-requests', icon: ClipboardList, label: 'My Requests' },
];

const volunteerLinks = [
  { to: '/volunteer', icon: Home, label: 'Dashboard' },
  { to: '/volunteer/requests', icon: MapPin, label: 'Nearby Requests' },
  { to: '/volunteer/my-rescues', icon: HandHeart, label: 'My Rescues' },
  { to: '/volunteer/profile', icon: User, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', icon: Home, label: 'Dashboard' },
  { to: '/admin/requests', icon: ClipboardList, label: 'All Requests' },
  { to: '/admin/map', icon: Map, label: 'Live Map' },
  { to: '/admin/volunteers', icon: Users, label: 'Volunteers' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = profile?.role === 'admin' 
    ? adminLinks 
    : profile?.role === 'volunteer' 
      ? volunteerLinks 
      : victimLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground hidden lg:flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">
              Rescue<span className="text-sidebar-primary">Portal</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'hover:bg-sidebar-accent text-sidebar-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name}</p>
              <p className="text-sm text-sidebar-foreground/70 capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">RescuePortal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>

        {/* Mobile Navigation */}
        <nav className="lg:hidden h-16 bg-card border-t border-border flex items-center justify-around px-2">
          {links.slice(0, 4).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{link.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
