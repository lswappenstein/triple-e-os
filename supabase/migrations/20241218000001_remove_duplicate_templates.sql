-- Remove duplicate quick win templates
-- Keep only the oldest record for each archetype_name + title combination

WITH ranked_templates AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY archetype_name, title 
      ORDER BY created_at ASC
    ) as rn
  FROM quick_win_templates
)
DELETE FROM quick_win_templates 
WHERE id IN (
  SELECT id 
  FROM ranked_templates 
  WHERE rn > 1
);

-- Verify the cleanup
SELECT 
  'After cleanup:' as status,
  COUNT(*) as total_templates,
  COUNT(DISTINCT CONCAT(archetype_name, '|', title)) as unique_templates
FROM quick_win_templates; 