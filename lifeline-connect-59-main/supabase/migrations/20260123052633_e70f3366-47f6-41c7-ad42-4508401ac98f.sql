-- Create enum types for user roles and request statuses
CREATE TYPE public.user_role AS ENUM ('victim', 'volunteer', 'admin');
CREATE TYPE public.request_status AS ENUM ('pending', 'in_progress', 'rescued', 'cancelled');
CREATE TYPE public.emergency_type AS ENUM ('flood', 'fire', 'earthquake', 'medical', 'trapped', 'other');

-- Create profiles table for all users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'victim',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role-based access (security best practice)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create volunteer_profiles table for volunteer-specific data
CREATE TABLE public.volunteer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    skills TEXT[] DEFAULT '{}',
    availability TEXT DEFAULT 'available',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_address TEXT,
    is_active BOOLEAN DEFAULT true,
    total_rescues INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_requests table for victim requests
CREATE TABLE public.help_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    victim_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    victim_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    emergency_type emergency_type NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_address TEXT,
    photo_url TEXT,
    status request_status DEFAULT 'pending',
    assigned_volunteer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rescue_updates table for tracking rescue progress
CREATE TABLE public.rescue_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.help_requests(id) ON DELETE CASCADE NOT NULL,
    volunteer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status request_status NOT NULL,
    notes TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role on signup" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Volunteer profiles policies
CREATE POLICY "Volunteers can view own profile" ON public.volunteer_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Volunteers can update own profile" ON public.volunteer_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Volunteers can insert own profile" ON public.volunteer_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all volunteer profiles" ON public.volunteer_profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active volunteers" ON public.volunteer_profiles
FOR SELECT USING (is_active = true);

-- Help requests policies
CREATE POLICY "Victims can view own requests" ON public.help_requests
FOR SELECT USING (auth.uid() = victim_id);

CREATE POLICY "Victims can create requests" ON public.help_requests
FOR INSERT WITH CHECK (auth.uid() = victim_id);

CREATE POLICY "Victims can update own requests" ON public.help_requests
FOR UPDATE USING (auth.uid() = victim_id);

CREATE POLICY "Volunteers can view assigned requests" ON public.help_requests
FOR SELECT USING (auth.uid() = assigned_volunteer_id);

CREATE POLICY "Volunteers can view pending requests" ON public.help_requests
FOR SELECT USING (
    public.has_role(auth.uid(), 'volunteer') 
    AND status = 'pending'
);

CREATE POLICY "Volunteers can update assigned requests" ON public.help_requests
FOR UPDATE USING (auth.uid() = assigned_volunteer_id);

CREATE POLICY "Admins can manage all requests" ON public.help_requests
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Rescue updates policies
CREATE POLICY "Users can view updates for their requests" ON public.rescue_updates
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.help_requests 
        WHERE id = request_id 
        AND (victim_id = auth.uid() OR assigned_volunteer_id = auth.uid())
    )
);

CREATE POLICY "Volunteers can create updates" ON public.rescue_updates
FOR INSERT WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "Admins can view all updates" ON public.rescue_updates
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_volunteer_profiles_updated_at
BEFORE UPDATE ON public.volunteer_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_requests_updated_at
BEFORE UPDATE ON public.help_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for help_requests and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rescue_updates;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('rescue-photos', 'rescue-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view rescue photos" ON storage.objects
FOR SELECT USING (bucket_id = 'rescue-photos');

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'rescue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE USING (bucket_id = 'rescue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);