-- Quick check to see if labs table exists and has the right structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'labs'
ORDER BY ordinal_position;

