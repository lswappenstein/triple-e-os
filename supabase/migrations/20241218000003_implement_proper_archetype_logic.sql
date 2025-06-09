-- =====================================================
-- IMPLEMENT PROPER ARCHETYPE DETECTION LOGIC
-- Based on research-backed diagnostic patterns
-- =====================================================

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
  
  -- Pattern detection variables
  has_firefighting_pattern BOOLEAN := FALSE;
  has_resource_disparity BOOLEAN := FALSE;
  has_capability_constraint BOOLEAN := FALSE;
  has_coordination_breakdown BOOLEAN := FALSE;
BEGIN
  -- Calculate dimension averages and total responses
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
  SELECT COALESCE(response_value, 3) INTO q4_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 4;
  SELECT COALESCE(response_value, 3) INTO q5_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 5;
  SELECT COALESCE(response_value, 3) INTO q7_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 7;
  SELECT COALESCE(response_value, 3) INTO q10_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 10;
  SELECT COALESCE(response_value, 3) INTO q12_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 12;
  SELECT COALESCE(response_value, 3) INTO q13_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 13;
  SELECT COALESCE(response_value, 3) INTO q14_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 14;
  SELECT COALESCE(response_value, 3) INTO q16_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 16;
  SELECT COALESCE(response_value, 3) INTO q17_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 17;
  SELECT COALESCE(response_value, 3) INTO q18_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 18;
  SELECT COALESCE(response_value, 3) INTO q19_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 19;
  SELECT COALESCE(response_value, 3) INTO q20_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 20;

  -- Detect patterns for more sophisticated archetype identification
  
  -- Pattern: Firefighting (repeated short-term fixes)
  has_firefighting_pattern := (q4_score <= 2 AND efficiency_avg < 3.0);
  
  -- Pattern: Resource disparity (some areas under-resourced)
  has_resource_disparity := (q7_score <= 2 AND (q18_score <= 2 OR q20_score <= 2));
  
  -- Pattern: Capability constraints limiting growth
  has_capability_constraint := (q10_score <= 2 OR q19_score <= 2 OR q14_score <= 2);
  
  -- Pattern: Coordination breakdown between teams
  has_coordination_breakdown := (q5_score <= 2 AND q17_score <= 2);

  -- =====================================================
  -- ARCHETYPE DETECTION BASED ON DIAGNOSTIC PATTERNS
  -- =====================================================

  -- SHIFTING THE BURDEN
  -- Low Q4 (root-cause problem solving) + firefighting pattern
  IF q4_score <= 2 AND has_firefighting_pattern THEN
    archetype_name := 'Shifting the Burden';
    source_dimension := 'Efficiency';
    insight := 'Your organization shows a pattern of applying quick fixes rather than addressing root causes. Problems are temporarily solved but keep recurring, suggesting reliance on symptomatic solutions instead of fundamental fixes.';
    RETURN NEXT;
  END IF;

  -- FIXES THAT FAIL
  -- Low Q4 + (Low Q16 OR Low Q17) + evidence of unintended consequences
  IF q4_score <= 2 AND (q16_score <= 2 OR q17_score <= 2) AND efficiency_avg < 2.8 THEN
    archetype_name := 'Fixes That Fail';
    source_dimension := 'Excellence';
    insight := 'Quick fixes are being applied without sufficient innovation or psychological safety to identify unintended consequences. Short-term solutions may be creating new problems or making existing ones worse.';
    RETURN NEXT;
  END IF;

  -- DRIFTING GOALS (ERODING GOALS)
  -- Low Q13 (upholding high standards) - direct signal of lowering standards
  -- Paradox: Q12 might be average/high while Q13 is low (targets met because they were reduced)
  IF q13_score <= 2 AND (q12_score >= 3 OR effectiveness_avg < 2.8) THEN
    archetype_name := 'Drifting Goals (Eroding Goals)';
    source_dimension := 'Effectiveness';
    insight := 'Performance standards are being lowered when faced with challenges rather than making real improvements. Goals or quality standards are frequently reduced to make performance appear acceptable, creating a cycle of declining expectations.';
    RETURN NEXT;
  END IF;

  -- SUCCESS TO THE SUCCESSFUL
  -- Resource allocation disparity (Low Q7) + evidence of "rich get richer" pattern
  IF has_resource_disparity AND q7_score <= 2 THEN
    archetype_name := 'Success to the Successful';
    source_dimension := 'Efficiency';
    insight := 'Resource allocation appears unfair, with some areas feeling under-resourced while others receive preferential treatment. This creates a reinforcing loop where successful areas get more resources while others struggle, widening performance gaps.';
    RETURN NEXT;
  END IF;

  -- LIMITS TO GROWTH
  -- Growth stalled due to capability constraints - one dimension lagging significantly
  -- Q10 (capabilities) OR Q19 (development) much lower, OR Q14 (adaptability) low
  IF has_capability_constraint AND (
    (q10_score <= 2 AND (effectiveness_avg - q10_score) > 1.0) OR
    (q19_score <= 2 AND (excellence_avg - q19_score) > 1.0) OR
    (q14_score <= 2 AND overall_avg > 2.5)
  ) THEN
    archetype_name := 'Limits to Growth';
    source_dimension := CASE 
      WHEN q10_score <= 2 THEN 'Effectiveness'
      WHEN q19_score <= 2 THEN 'Excellence'
      ELSE 'Effectiveness'
    END;
    insight := 'Growth and improvement are being constrained by fundamental limitations in capabilities, development, or adaptability. Initial success is stalling due to overlooked constraints that need to be addressed to resume progress.';
    RETURN NEXT;
  END IF;

  -- TRAGEDY OF THE COMMONS
  -- Low Q5 (coordination) + Low Q20 (shared purpose) = silos exploiting shared resources
  IF q5_score <= 2 AND q20_score <= 2 AND overall_avg > 2.0 THEN
    archetype_name := 'Tragedy of the Commons';
    source_dimension := 'Excellence';
    insight := 'Departments operate in silos pursuing their own success at the expense of others. Poor coordination and lack of shared purpose suggest teams are overusing shared resources or competing for the same assets, leading to collective harm.';
    RETURN NEXT;
  END IF;

  -- ACCIDENTAL ADVERSARIES
  -- Low Q5 (coordination) + Low Q17 (safety to speak up) = unintended conflict between partners
  IF has_coordination_breakdown AND q5_score <= 2 AND q17_score <= 2 THEN
    archetype_name := 'Accidental Adversaries';
    source_dimension := 'Efficiency';
    insight := 'Teams that should collaborate are ending up in conflict due to poor communication and lack of psychological safety. One group''s actions are inadvertently hindering another, creating unintended rivalry and finger-pointing.';
    RETURN NEXT;
  END IF;

  -- FALLBACK: Multiple issues but no clear single archetype
  -- This handles cases where there are problems but they don't fit a specific pattern
  IF overall_avg < 2.5 AND (
    (q4_score <= 2 AND q13_score <= 2) OR
    (q5_score <= 2 AND q7_score <= 2 AND q17_score <= 2)
  ) THEN
    archetype_name := 'Multiple System Dysfunctions';
    source_dimension := CASE 
      WHEN efficiency_avg <= effectiveness_avg AND efficiency_avg <= excellence_avg THEN 'Efficiency'
      WHEN effectiveness_avg <= excellence_avg THEN 'Effectiveness'
      ELSE 'Excellence'
    END;
    insight := 'Your organization shows multiple systemic issues across different areas. This suggests complex organizational challenges that may require a comprehensive improvement approach addressing several interconnected problems simultaneously.';
    RETURN NEXT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 