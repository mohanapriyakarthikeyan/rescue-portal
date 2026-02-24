import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { 
  AlertTriangle, 
  Menu, 
  X, 
  User, 
  LogOut,
  Home,
  HandHeart,
  Shield,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'volunteer':
        return '/volunteer';
      case 'victim':
        return '/victim';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">
              Rescue<span className="text-primary">Portal</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-link flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
            {!user && (
              <>
                <Link to="/auth?tab=signup&role=victim" className="nav-link flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Need Help
                </Link>
                <Link to="/auth?tab=signup&role=volunteer" className="nav-link flex items-center gap-2">
                  <HandHeart className="w-4 h-4" />
                  Volunteer
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden sm:block">{profile?.full_name || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link to="/auth?tab=login">Sign In</Link>
                </Button>
                <Button variant="emergency" asChild>
                  <Link to="/auth?tab=signup&role=victim">
                    <AlertTriangle className="w-4 h-4" />
                    Get Help Now
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/" className="nav-link flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Home className="w-4 h-4" />
                Home
              </Link>
              {!user && (
                <>
                  <Link to="/auth?tab=signup&role=victim" className="nav-link flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <AlertTriangle className="w-4 h-4" />
                    Need Help
                  </Link>
                  <Link to="/auth?tab=signup&role=volunteer" className="nav-link flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <HandHeart className="w-4 h-4" />
                    Volunteer
                  </Link>
                  <Link to="/auth?tab=login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
