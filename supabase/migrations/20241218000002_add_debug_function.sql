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