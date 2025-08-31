-- Add RLS policy for taco_foods table to fix security linter warning
-- Enable RLS on taco_foods table
ALTER TABLE taco_foods ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to TACO nutritional data
CREATE POLICY "TACO foods are viewable by everyone" ON taco_foods
    FOR SELECT USING (true);