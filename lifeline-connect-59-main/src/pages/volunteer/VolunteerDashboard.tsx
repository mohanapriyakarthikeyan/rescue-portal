import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { HandHeart, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function VolunteerDashboard() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome, {profile?.full_name}</h1>
          <p className="text-muted-foreground">Ready to help those in need</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated"><CardContent className="pt-6"><div className="text-2xl font-bold">0</div><p className="text-sm text-muted-foreground">Total Rescues</p></CardContent></Card>
          <Card className="card-elevated"><CardContent className="pt-6"><div className="text-2xl font-bold text-warning">0</div><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
          <Card className="card-elevated"><CardContent className="pt-6"><div className="text-2xl font-bold text-success">0</div><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
          <Card className="card-elevated"><CardContent className="pt-6"><div className="text-2xl font-bold text-primary">Available</div><p className="text-sm text-muted-foreground">Status</p></CardContent></Card>
        </div>

        <Card className="card-elevated p-8 text-center">
          <HandHeart className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">You're Ready to Help</h2>
          <p className="text-muted-foreground">Check "Nearby Requests" to see people who need assistance</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
