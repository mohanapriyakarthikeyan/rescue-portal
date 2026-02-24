import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { 
  AlertTriangle, 
  HandHeart, 
  Shield, 
  MapPin, 
  Clock, 
  Users,
  CheckCircle2,
  ArrowRight,
  Phone,
  Heart
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user, profile } = useAuth();

  const getDashboardLink = () => {
    if (!profile) return '/auth';
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'volunteer': return '/volunteer';
      default: return '/victim';
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section text-secondary-foreground py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Emergency Response System Active
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Rapid Disaster Response & 
              <span className="text-primary"> Victim Support</span>
            </h1>
            <p className="text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
              Connecting those in need with trained volunteers. Fast, reliable, and coordinated emergency assistance when every second counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button variant="emergency" size="xl" asChild>
                  <Link to={getDashboardLink()}>
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="emergency" size="xl" asChild>
                    <Link to="/auth?tab=signup&role=victim">
                      <AlertTriangle className="w-5 h-5" />
                      Request Help Now
                    </Link>
                  </Button>
                  <Button variant="hero" size="xl" asChild>
                    <Link to="/auth?tab=signup&role=volunteer">
                      <HandHeart className="w-5 h-5" />
                      Become a Volunteer
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform connects victims with nearby volunteers through real-time coordination
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Victim Card */}
            <div className="card-elevated p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Request Help</h3>
              <p className="text-muted-foreground mb-6">
                Submit your emergency request with location and details. Track status in real-time.
              </p>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  GPS location detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Photo upload support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Real-time status updates
                </li>
              </ul>
            </div>

            {/* Volunteer Card */}
            <div className="card-elevated p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-success/20 transition-colors">
                <HandHeart className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Volunteer Response</h3>
              <p className="text-muted-foreground mb-6">
                View nearby requests, accept missions, and help those in need in your area.
              </p>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Nearby request alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Navigation integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Mission status updates
                </li>
              </ul>
            </div>

            {/* Admin Card */}
            <div className="card-elevated p-8 text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Coordination Hub</h3>
              <p className="text-muted-foreground mb-6">
                Live dashboard for administrators to monitor and coordinate rescue operations.
              </p>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Interactive live map
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Volunteer assignment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Analytics dashboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Always Available</p>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-primary mb-2">&lt;5min</div>
              <p className="text-muted-foreground">Response Time</p>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Active Volunteers</p>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Lives Helped</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-secondary-foreground/80 mb-10 max-w-2xl mx-auto">
            Whether you need help or want to help others, join our community today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="emergency" size="xl" asChild>
              <Link to="/auth?tab=signup&role=victim">
                <Phone className="w-5 h-5" />
                I Need Help
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
              <Link to="/auth?tab=signup&role=volunteer">
                <Heart className="w-5 h-5" />
                I Want to Help
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">RescuePortal</span>
            </div>
            <p className="text-background/60 text-sm">
              © 2024 Rescue Coordination Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
