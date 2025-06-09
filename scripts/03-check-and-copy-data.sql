-- First, let's check if we have any data in the current database
SELECT 'recepten' as table_name, COUNT(*) as count FROM recepten
UNION ALL
SELECT 'ingredienten' as table_name, COUNT(*) as count FROM ingredienten  
UNION ALL
SELECT 'bijgerechten' as table_name, COUNT(*) as count FROM bijgerechten;

-- If the counts are 0, we need to add the data again
-- Let's add the same sample data directly to this database
