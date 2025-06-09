-- Fix archetype detection to use most recent responses
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
  total_responses INTEGER;
  
  -- Individual question scores
  q4_score INTEGER;  -- Root cause problem solving
  q5_score INTEGER;  -- Cross-team coordination
  q7_score INTEGER;  -- Resource allocation
  q10_score INTEGER; -- Capabilities
  q12_score INTEGER; -- Meeting targets
  q13_score INTEGER; -- Upholding high standards
  q14_score INTEGER; -- Adaptability
  q16_score INTEGER; -- Continuous improvement
  q17_score INTEGER; -- Safety to speak up
  q18_score INTEGER; -- Team morale
  q19_score INTEGER; -- Development
  q20_score INTEGER; -- Shared purpose
BEGIN
  -- Calculate dimension averages using MOST RECENT response for each question
  WITH latest_responses AS (
    SELECT DISTINCT ON (question_id) 
      question_id, 
      response_value,
      hcq.dimension
    FROM health_check_responses hcr
    JOIN health_check_questions hcq ON hcr.question_id = hcq.id
    WHERE hcr.user_id = p_user_id
    ORDER BY question_id, hcr.created_at DESC
  )
  SELECT 
    COALESCE(AVG(CASE WHEN dimension = 'Efficiency' THEN response_value END), 0),
    COALESCE(AVG(CASE WHEN dimension = 'Effectiveness' THEN response_value END), 0),
    COALESCE(AVG(CASE WHEN dimension = 'Excellence' THEN response_value END), 0),
    COALESCE(AVG(response_value), 0),
    COUNT(*)
  INTO efficiency_avg, effectiveness_avg, excellence_avg, overall_avg, total_responses
  FROM latest_responses;

  -- Don't detect archetypes if insufficient data
  IF total_responses < 15 THEN
    RETURN;
  END IF;

  -- Get individual question scores using MOST RECENT responses
  SELECT COALESCE(response_value, 3) INTO q4_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 4 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q5_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 5 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q7_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 7 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q10_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 10 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q12_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 12 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q13_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 13 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q14_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 14 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q16_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 16 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q17_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 17 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q18_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 18 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q19_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 19 
  ORDER BY created_at DESC LIMIT 1;
  
  SELECT COALESCE(response_value, 3) INTO q20_score 
  FROM health_check_responses 
  WHERE user_id = p_user_id AND question_id = 20 
  ORDER BY created_at DESC LIMIT 1;

  -- SHIFTING THE BURDEN: Low Q4 + firefighting pattern
  IF q4_score <= 2 AND efficiency_avg < 3.0 THEN
    archetype_name := 'Shifting the Burden';
    source_dimension := 'Efficiency';
    insight := 'Your organization shows a pattern of applying quick fixes rather than addressing root causes. Problems are temporarily solved but keep recurring, suggesting reliance on symptomatic solutions.';
    RETURN NEXT;
  END IF;

  -- FIXES THAT FAIL: Low Q4 + (Low Q16 OR Low Q17) + unintended consequences
  IF q4_score <= 2 AND (q16_score <= 2 OR q17_score <= 2) AND efficiency_avg < 2.8 THEN
    archetype_name := 'Fixes That Fail';
    source_dimension := 'Excellence';
    insight := 'Quick fixes are being applied without sufficient innovation or safety to identify unintended consequences. Solutions may be creating new problems.';
    RETURN NEXT;
  END IF;

  -- DRIFTING GOALS: Low Q13 + paradox of meeting targets while lowering standards
  IF q13_score <= 2 AND (q12_score >= 3 OR effectiveness_avg < 2.8) THEN
    archetype_name := 'Drifting Goals (Eroding Goals)';
    source_dimension := 'Effectiveness';
    insight := 'Performance standards are being lowered when faced with challenges. Goals are reduced to make performance appear acceptable, creating declining expectations.';
    RETURN NEXT;
  END IF;

  -- SUCCESS TO THE SUCCESSFUL: Resource disparity + morale/purpose issues
  IF q7_score <= 2 AND (q18_score <= 2 OR q20_score <= 2) THEN
    archetype_name := 'Success to the Successful';
    source_dimension := 'Efficiency';
    insight := 'Resource allocation appears unfair, creating a reinforcing loop where successful areas get more resources while others struggle, widening performance gaps.';
    RETURN NEXT;
  END IF;

  -- LIMITS TO GROWTH: Capability constraints with dimension imbalances
  IF (q10_score <= 2 AND (effectiveness_avg - q10_score::FLOAT) > 1.0) OR
     (q19_score <= 2 AND (excellence_avg - q19_score::FLOAT) > 1.0) OR
     (q14_score <= 2 AND overall_avg > 2.5) THEN
    archetype_name := 'Limits to Growth';
    source_dimension := CASE 
      WHEN q10_score <= 2 THEN 'Effectiveness'
      WHEN q19_score <= 2 THEN 'Excellence'
      ELSE 'Effectiveness'
    END;
    insight := 'Growth is being constrained by fundamental limitations in capabilities, development, or adaptability. Initial success is stalling due to overlooked constraints.';
    RETURN NEXT;
  END IF;

  -- TRAGEDY OF THE COMMONS: Silos + shared resource exploitation
  IF q5_score <= 2 AND q20_score <= 2 AND overall_avg > 2.0 THEN
    archetype_name := 'Tragedy of the Commons';
    source_dimension := 'Excellence';
    insight := 'Departments operate in silos pursuing individual success at collective expense. Teams are overusing shared resources or competing for the same assets.';
    RETURN NEXT;
  END IF;

  -- ACCIDENTAL ADVERSARIES: Coordination breakdown + communication issues
  IF q5_score <= 2 AND q17_score <= 2 THEN
    archetype_name := 'Accidental Adversaries';
    source_dimension := 'Efficiency';
    insight := 'Teams that should collaborate are in conflict due to poor communication and lack of psychological safety. Actions are inadvertently hindering each other.';
    RETURN NEXT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 