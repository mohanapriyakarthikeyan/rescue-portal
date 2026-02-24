import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Users, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and coordinate rescue operations</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-elevated"><CardContent className="pt-6 flex items-center gap-4"><AlertTriangle className="w-8 h-8 text-warning" /><div><div className="text-2xl font-bold">0</div><p className="text-sm text-muted-foreground">Pending</p></div></CardContent></Card>
          <Card className="card-elevated"><CardContent className="pt-6 flex items-center gap-4"><Clock className="w-8 h-8 text-primary" /><div><div className="text-2xl font-bold">0</div><p className="text-sm text-muted-foreground">In Progress</p></div></CardContent></Card>
          <Card className="card-elevated"><CardContent className="pt-6 flex items-center gap-4"><CheckCircle className="w-8 h-8 text-success" /><div><div className="text-2xl font-bold">0</div><p className="text-sm text-muted-foreground">Rescued</p></div></CardContent></Card>
          <Card className="card-elevated"><CardContent className="pt-6 flex items-center gap-4"><Users className="w-8 h-8 text-secondary" /><div><div className="text-2xl font-bold">0</div><p className="text-sm text-muted-foreground">Volunteers</p></div></CardContent></Card>
        </div>

        <Card className="card-elevated">
          <CardHeader><CardTitle>Live Activity</CardTitle></CardHeader>
          <CardContent className="py-8 text-center text-muted-foreground">
            Real-time updates will appear here as requests come in
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
