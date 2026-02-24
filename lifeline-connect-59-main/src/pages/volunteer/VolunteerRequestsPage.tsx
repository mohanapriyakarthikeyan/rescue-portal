import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { EmergencyTypeIcon } from '@/components/EmergencyTypeIcon';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Phone, Clock, Navigation, CheckCircle, Loader2 } from 'lucide-react';
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
}

export default function VolunteerRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('help_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (data) setRequests(data as HelpRequest[]);
      setLoading(false);
    };
    fetchRequests();

    const channel = supabase
      .channel('pending-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, fetchRequests)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const acceptRequest = async (requestId: string) => {
    setAccepting(requestId);
    const { error } = await supabase
      .from('help_requests')
      .update({ status: 'in_progress', assigned_volunteer_id: user?.id })
      .eq('id', requestId);
    
    if (error) toast.error('Failed to accept request');
    else toast.success('Request accepted! Navigate to the victim.');
    setAccepting(null);
  };

  const openNavigation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Nearby Requests</h1>
          <p className="text-muted-foreground">Accept and respond to emergency requests</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : requests.length === 0 ? (
          <Card className="card-elevated"><CardContent className="py-16 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">All Clear</h3>
            <p className="text-muted-foreground">No pending requests at the moment</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="card-elevated">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <EmergencyTypeIcon type={request.emergency_type} size="lg" />
                      <div>
                        <CardTitle className="text-lg">{request.victim_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(request.created_at), 'h:mm a')}
                        </CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.description && <p className="text-muted-foreground">{request.description}</p>}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{request.location_address}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{request.phone}</span></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="emergency" onClick={() => acceptRequest(request.id)} disabled={accepting === request.id}>
                      {accepting === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Accept Request
                    </Button>
                    <Button variant="outline" onClick={() => openNavigation(request.latitude, request.longitude)}>
                      <Navigation className="w-4 h-4" /> Navigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
