-- Fix RLS policies for courses table
-- The table currently only has a SELECT policy, missing admin policies for INSERT/UPDATE/DELETE

-- Add admin policies for courses table
CREATE POLICY "Admins can insert courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update courses" 
ON public.courses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete courses" 
ON public.courses 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);