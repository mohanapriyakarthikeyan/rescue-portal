import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { EmergencyTypeIcon } from '@/components/EmergencyTypeIcon';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Clock, MapPin, Phone, User, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface HelpRequest {
  id: string;
  victim_name: string;
  phone: string;
  emergency_type: 'flood' | 'fire' | 'earthquake' | 'medical' | 'trapped' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  location_address: string;
  status: 'pending' | 'in_progress' | 'rescued' | 'cancelled';
  created_at: string;
  assigned_volunteer_id: string | null;
}

export default function VictimMyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('victim_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data as HelpRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('victim-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `victim_id=eq.${user?.id}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">My Requests</h1>
            <p className="text-muted-foreground">Track the status of your help requests</p>
          </div>
          <Button variant="outline" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No Requests Yet</h3>
              <p className="text-muted-foreground mb-6">You haven't submitted any help requests</p>
              <Button variant="emergency" asChild>
                <a href="/victim/request">Request Help Now</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="card-elevated">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <EmergencyTypeIcon type={request.emergency_type} size="lg" />
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {request.emergency_type.replace('_', ' ')} Emergency
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.description && (
                    <p className="text-muted-foreground">{request.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{request.location_address || `${request.latitude}, ${request.longitude}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{request.phone}</span>
                    </div>
                  </div>
                  
                  {request.assigned_volunteer_id && (
                    <div className="mt-4 p-4 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2 text-success">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Volunteer Assigned</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        A volunteer has been assigned and is on their way
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
