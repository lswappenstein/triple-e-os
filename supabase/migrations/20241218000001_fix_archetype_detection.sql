-- =====================================================
-- FIX ARCHETYPE DETECTION SYSTEM
-- =====================================================

-- Drop and recreate the archetype detection function with improved logic
CREATE OR REPLACE FUNCTION detect_archetypes_for_user(p_user_id UUID)
RETURNS TABLE(
  archetype_name TEXT,
  source_dimension TEXT,
  insight TEXT
) AS $$
DECLARE
  efficiency_avg FLOAT;
  effectiveness_avg FLOAT;
  excellence_avg FLOAT;
  overall_avg FLOAT;
  q4_score INTEGER;
  q5_score INTEGER;
  q7_score INTEGER;
  q10_score INTEGER;
  q13_score INTEGER;
  q14_score INTEGER;
  q16_score INTEGER;
  q17_score INTEGER;
  q19_score INTEGER;
  q20_score INTEGER;
  low_score_count INTEGER;
  total_responses INTEGER;
BEGIN
  -- Calculate dimension averages
  SELECT 
    COALESCE(AVG(CASE WHEN hcq.dimension = 'Efficiency' THEN hcr.response_value END), 0),
    COALESCE(AVG(CASE WHEN hcq.dimension = 'Effectiveness' THEN hcr.response_value END), 0),
    COALESCE(AVG(CASE WHEN hcq.dimension = 'Excellence' THEN hcr.response_value END), 0),
    COALESCE(AVG(hcr.response_value), 0),
    COUNT(*)
  INTO efficiency_avg, effectiveness_avg, excellence_avg, overall_avg, total_responses
  FROM health_check_responses hcr
  JOIN health_check_questions hcq ON hcr.question_id = hcq.id
  WHERE hcr.user_id = p_user_id;

  -- Don't detect archetypes if insufficient data (less than 15 responses)
  IF total_responses < 15 THEN
    RETURN;
  END IF;

  -- Get individual question scores
  SELECT COALESCE(response_value, 0) INTO q4_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 4;
  SELECT COALESCE(response_value, 0) INTO q5_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 5;
  SELECT COALESCE(response_value, 0) INTO q7_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 7;
  SELECT COALESCE(response_value, 0) INTO q10_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 10;
  SELECT COALESCE(response_value, 0) INTO q13_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 13;
  SELECT COALESCE(response_value, 0) INTO q14_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 14;
  SELECT COALESCE(response_value, 0) INTO q16_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 16;
  SELECT COALESCE(response_value, 0) INTO q17_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 17;
  SELECT COALESCE(response_value, 0) INTO q19_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 19;
  SELECT COALESCE(response_value, 0) INTO q20_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 20;

  -- Count how many scores are significantly low (≤ 2)
  SELECT COUNT(*) INTO low_score_count
  FROM health_check_responses hcr
  WHERE hcr.user_id = p_user_id AND hcr.response_value <= 2;

  -- More sophisticated archetype detection based on patterns, not just single low scores

  -- SHIFTING THE BURDEN: Low root cause analysis (Q4) + pattern of symptomatic fixes
  -- Only trigger if Q4 is very low (≤2) AND efficiency average is also low
  IF q4_score <= 2 AND efficiency_avg < 2.5 THEN
    archetype_name := 'Shifting the Burden';
    source_dimension := 'Efficiency';
    insight := 'Your organization shows a strong pattern of applying quick fixes rather than addressing root causes. This creates a cycle where problems keep recurring because fundamental issues remain unresolved.';
    RETURN NEXT;
  END IF;

  -- DRIFTING GOALS: Low standards maintenance (Q13) + effectiveness problems
  -- Only trigger if both Q13 is low AND effectiveness dimension is struggling
  IF q13_score <= 2 AND effectiveness_avg < 2.5 THEN
    archetype_name := 'Drifting Goals (Eroding Goals)';
    source_dimension := 'Effectiveness';
    insight := 'Performance standards are being compromised when challenges arise. This gradual erosion of expectations undermines long-term excellence and creates a cycle of declining performance.';
    RETURN NEXT;
  END IF;

  -- SUCCESS TO THE SUCCESSFUL: Resource allocation issues (Q7) + significant inequality pattern
  -- Only trigger if Q7 is very low AND there are other coordination issues
  IF q7_score <= 2 AND q5_score <= 2 THEN
    archetype_name := 'Success to the Successful';
    source_dimension := 'Efficiency';
    insight := 'Resource allocation appears unfair and coordination is poor, creating a reinforcing loop where successful areas get more resources while others struggle, widening the performance gap.';
    RETURN NEXT;
  END IF;

  -- FIXES THAT FAIL: Low root cause (Q4) + innovation/safety issues + pattern of unintended consequences
  -- More specific conditions to avoid false positives
  IF q4_score <= 2 AND (q16_score <= 2 OR q17_score <= 2) AND efficiency_avg < 2.8 THEN
    archetype_name := 'Fixes That Fail';
    source_dimension := 'Excellence';
    insight := 'Quick fixes are being applied without sufficient innovation or psychological safety to identify unintended consequences. This pattern suggests solutions may be creating new problems or making existing ones worse.';
    RETURN NEXT;
  END IF;

  -- LIMITS TO GROWTH: Multiple capability constraints + low adaptability
  -- Only trigger if multiple growth-related areas are constrained AND there's a clear pattern
  IF (q10_score <= 2 AND q14_score <= 2) OR (q19_score <= 2 AND excellence_avg < 2.5) THEN
    archetype_name := 'Limits to Growth';
    source_dimension := CASE 
      WHEN q10_score <= 2 THEN 'Effectiveness'
      WHEN q19_score <= 2 THEN 'Excellence'
      ELSE 'Effectiveness'
    END;
    insight := 'Growth and improvement are being constrained by fundamental limitations in capabilities or adaptability. These constraints are creating bottlenecks that prevent further progress.';
    RETURN NEXT;
  END IF;

  -- TRAGEDY OF THE COMMONS: Both coordination (Q5) AND shared purpose (Q20) are very low
  -- Requires both conditions to be met, not just one
  IF q5_score <= 2 AND q20_score <= 2 THEN
    archetype_name := 'Tragedy of the Commons';
    source_dimension := 'Excellence';
    insight := 'Poor coordination combined with lack of shared purpose suggests that teams are optimizing individually at the expense of collective good, potentially overusing shared resources or creating conflicting priorities.';
    RETURN NEXT;
  END IF;

  -- ACCIDENTAL ADVERSARIES: Coordination (Q5) + safety (Q17) problems + medium overall performance
  -- Only trigger if both are low AND there's evidence of team conflict patterns
  IF q5_score <= 2 AND q17_score <= 2 AND overall_avg > 2.0 AND overall_avg < 3.5 THEN
    archetype_name := 'Accidental Adversaries';
    source_dimension := 'Efficiency';
    insight := 'Poor coordination and lack of psychological safety suggest that well-meaning teams may be inadvertently creating problems for each other due to communication breakdowns and misunderstandings.';
    RETURN NEXT;
  END IF;

  -- FALLBACK: If someone has many very low scores (>= 6 scores of 2 or below) but no specific pattern
  -- This indicates general organizational dysfunction
  IF low_score_count >= 6 AND overall_avg < 2.5 THEN
    archetype_name := 'Multiple System Dysfunctions';
    source_dimension := CASE 
      WHEN efficiency_avg <= effectiveness_avg AND efficiency_avg <= excellence_avg THEN 'Efficiency'
      WHEN effectiveness_avg <= excellence_avg THEN 'Effectiveness'
      ELSE 'Excellence'
    END;
    insight := 'Your organization shows multiple areas of concern across different dimensions. This suggests systemic issues that may require a comprehensive improvement approach rather than targeted interventions.';
    RETURN NEXT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add quick win templates for the new fallback archetype
INSERT INTO quick_win_templates (archetype_name, title, description, impact_level, effort_level, timeframe) VALUES

-- Multiple System Dysfunctions Quick Wins
('Multiple System Dysfunctions', 'Establish Weekly Leadership Alignment', 'Create a weekly 30-minute leadership meeting focused solely on identifying and removing the biggest organizational blocker. This creates a systematic approach to tackling multiple issues.', 'High', 'Low', 'Immediate'),
('Multiple System Dysfunctions', 'Implement Stop-Start-Continue Retrospective', 'Run a company-wide retrospective to identify what to stop doing, what to start doing, and what to continue. Focus on the top 3 items from each category for immediate action.', 'High', 'Medium', 'Short-term'),
('Multiple System Dysfunctions', 'Create Cross-functional Problem-solving Team', 'Form a rotating team with representatives from each department to tackle systemic issues. Give them authority to make recommendations and a budget for small improvements.', 'Medium', 'Medium', 'Short-term');

-- =====================================================
-- DEBUG FUNCTION FOR ARCHETYPE DETECTION
-- =====================================================

-- Function to debug archetype detection - shows all calculations
CREATE OR REPLACE FUNCTION debug_archetype_detection(p_user_id UUID)
RETURNS TABLE(
  metric TEXT,
  value FLOAT,
  threshold FLOAT,
  passes_condition BOOLEAN
) AS $$
DECLARE
  efficiency_avg FLOAT;
  effectiveness_avg FLOAT;
  excellence_avg FLOAT;
  overall_avg FLOAT;
  low_score_count INTEGER;
  total_responses INTEGER;
  q4_score INTEGER;
  q5_score INTEGER;
  q7_score INTEGER;
  q10_score INTEGER;
  q13_score INTEGER;
  q14_score INTEGER;
  q16_score INTEGER;
  q17_score INTEGER;
  q19_score INTEGER;
  q20_score INTEGER;
BEGIN
  -- Calculate dimension averages
  SELECT 
    COALESCE(AVG(CASE WHEN hcq.dimension = 'Efficiency' THEN hcr.response_value END), 0),
    COALESCE(AVG(CASE WHEN hcq.dimension = 'Effectiveness' THEN hcr.response_value END), 0),
    COALESCE(AVG(CASE WHEN hcq.dimension = 'Excellence' THEN hcr.response_value END), 0),
    COALESCE(AVG(hcr.response_value), 0),
    COUNT(*)
  INTO efficiency_avg, effectiveness_avg, excellence_avg, overall_avg, total_responses
  FROM health_check_responses hcr
  JOIN health_check_questions hcq ON hcr.question_id = hcq.id
  WHERE hcr.user_id = p_user_id;

  -- Get individual question scores
  SELECT COALESCE(response_value, 0) INTO q4_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 4;
  SELECT COALESCE(response_value, 0) INTO q5_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 5;
  SELECT COALESCE(response_value, 0) INTO q7_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 7;
  SELECT COALESCE(response_value, 0) INTO q10_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 10;
  SELECT COALESCE(response_value, 0) INTO q13_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 13;
  SELECT COALESCE(response_value, 0) INTO q14_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 14;
  SELECT COALESCE(response_value, 0) INTO q16_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 16;
  SELECT COALESCE(response_value, 0) INTO q17_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 17;
  SELECT COALESCE(response_value, 0) INTO q19_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 19;
  SELECT COALESCE(response_value, 0) INTO q20_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 20;

  -- Count low scores
  SELECT COUNT(*) INTO low_score_count
  FROM health_check_responses hcr
  WHERE hcr.user_id = p_user_id AND hcr.response_value <= 2;

  -- Return debug information
  RETURN QUERY VALUES
    ('Total Responses', total_responses::FLOAT, 15.0, total_responses >= 15),
    ('Efficiency Average', efficiency_avg, 2.5, efficiency_avg < 2.5),
    ('Effectiveness Average', effectiveness_avg, 2.5, effectiveness_avg < 2.5),
    ('Excellence Average', excellence_avg, 2.5, excellence_avg < 2.5),
    ('Overall Average', overall_avg, 2.5, overall_avg < 2.5),
    ('Low Score Count', low_score_count::FLOAT, 6.0, low_score_count >= 6),
    ('Q4 Root Cause', q4_score::FLOAT, 2.0, q4_score <= 2),
    ('Q5 Coordination', q5_score::FLOAT, 2.0, q5_score <= 2),
    ('Q7 Resource Allocation', q7_score::FLOAT, 2.0, q7_score <= 2),
    ('Q10 Capabilities', q10_score::FLOAT, 2.0, q10_score <= 2),
    ('Q13 Standards', q13_score::FLOAT, 2.0, q13_score <= 2),
    ('Q14 Adaptability', q14_score::FLOAT, 2.0, q14_score <= 2),
    ('Q16 Innovation', q16_score::FLOAT, 2.0, q16_score <= 2),
    ('Q17 Psychological Safety', q17_score::FLOAT, 2.0, q17_score <= 2),
    ('Q19 Development', q19_score::FLOAT, 2.0, q19_score <= 2),
    ('Q20 Shared Purpose', q20_score::FLOAT, 2.0, q20_score <= 2);

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 