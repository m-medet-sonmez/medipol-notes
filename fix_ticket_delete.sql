-- Add DELETE policy for admins on support_tickets table
CREATE POLICY "Admins can delete tickets" ON public.support_tickets FOR DELETE USING (public.is_admin());
