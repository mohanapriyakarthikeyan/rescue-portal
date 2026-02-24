-- Fix overly permissive notifications insert policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create proper notification insert policy - only admins and the system can create notifications
CREATE POLICY "Admins can create notifications" ON public.notifications
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also allow users to receive notifications created for them (via trigger/function)
CREATE POLICY "Allow notification creation for user" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);