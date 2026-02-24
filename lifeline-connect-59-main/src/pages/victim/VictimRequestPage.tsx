import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { EmergencyTypeIcon } from '@/components/EmergencyTypeIcon';

type EmergencyType = 'flood' | 'fire' | 'earthquake' | 'medical' | 'trapped' | 'other';

export default function VictimRequestPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    emergencyType: '' as EmergencyType,
    description: '',
    latitude: 0,
    longitude: 0,
    address: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name,
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        
        // Reverse geocoding would go here in production
        setFormData(prev => ({ 
          ...prev, 
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
        }));
        setGettingLocation(false);
        toast.success('Location detected');
      },
      (error) => {
        setGettingLocation(false);
        toast.error('Unable to get your location. Please enter it manually.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emergencyType) {
      toast.error('Please select an emergency type');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please provide your location');
      return;
    }

    setLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('rescue-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('rescue-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // Create help request
      const { error } = await supabase.from('help_requests').insert({
        victim_id: user?.id,
        victim_name: formData.name,
        phone: formData.phone,
        emergency_type: formData.emergencyType,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        location_address: formData.address,
        photo_url: photoUrl,
      });

      if (error) throw error;

      toast.success('Help request submitted successfully!');
      navigate('/victim/my-requests');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const emergencyTypes: { value: EmergencyType; label: string }[] = [
    { value: 'flood', label: 'Flood' },
    { value: 'fire', label: 'Fire' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'trapped', label: 'Trapped/Stuck' },
    { value: 'other', label: 'Other Emergency' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Request Help</h1>
          <p className="text-muted-foreground">Fill out this form to request emergency assistance</p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Emergency Request Form
            </CardTitle>
            <CardDescription>
              Please provide accurate information to help us assist you faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              {/* Emergency Type */}
              <div className="space-y-2">
                <Label>Type of Emergency *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, emergencyType: type.value }))}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.emergencyType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <EmergencyTypeIcon type={type.value} size="lg" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your situation and what help you need..."
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your address or use GPS"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    GPS
                  </Button>
                </div>
                {formData.latitude !== 0 && (
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Photo (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="photo" className="cursor-pointer">
                    {photoFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span>{photoFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="w-8 h-8" />
                        <span>Click to upload a photo</span>
                        <span className="text-sm">Helps responders understand the situation</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button type="submit" variant="emergency" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Help Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
