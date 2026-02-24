import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Clock, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface HelpRequest {
  id: string;
  emergency_type: string;
  status: 'pending' | 'in_progress' | 'rescued' | 'cancelled';
  created_at: string;
}

export default function VictimDashboard() {
  const { profile } = useAuth();
  const [recentRequests, setRecentRequests] = useState<HelpRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, rescued: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('help_requests')
        .select('id, emergency_type, status, created_at')
        .eq('victim_id', profile?.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentRequests(data as HelpRequest[]);
        setStats({
          total: data.length,
          pending: data.filter(r => r.status === 'pending').length,
          inProgress: data.filter(r => r.status === 'in_progress').length,
          rescued: data.filter(r => r.status === 'rescued').length,
        });
      }
    };

    if (profile) fetchData();
  }, [profile]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Welcome, {profile?.full_name}</h1>
            <p className="text-muted-foreground">Manage your help requests and track their status</p>
          </div>
          <Button variant="emergency" size="lg" asChild>
            <Link to="/victim/request">
              <Plus className="w-5 h-5" />
              Request Help
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{stats.rescued}</div>
              <p className="text-sm text-muted-foreground">Rescued</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="card-elevated">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Your latest help requests</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/victim/my-requests">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium capitalize">{request.emergency_type} Emergency</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(request.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
