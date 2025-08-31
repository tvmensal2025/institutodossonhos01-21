-- Allow authenticated users to create courses
DROP POLICY IF EXISTS "Everyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Admins can create courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;

-- Create proper RLS policies for courses table
CREATE POLICY "Everyone can view published courses" 
ON courses 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Authenticated users can create courses" 
ON courses 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update courses" 
ON courses 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete courses" 
ON courses 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create course modules
DROP POLICY IF EXISTS "Everyone can view course modules" ON course_modules;
DROP POLICY IF EXISTS "Authenticated users can create course modules" ON course_modules;

CREATE POLICY "Everyone can view course modules" 
ON course_modules 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create course modules" 
ON course_modules 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update course modules" 
ON course_modules 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete course modules" 
ON course_modules 
FOR DELETE 
USING (auth.uid() IS NOT NULL);