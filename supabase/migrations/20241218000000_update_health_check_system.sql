-- =====================================================
-- Triple eOS Health Check System Update
-- Based on Comprehensive Research Report
-- =====================================================
-- This migration updates the health check system with:
-- - 20 research-based questions (7 Efficiency, 8 Effectiveness, 5 Excellence)
-- - 7 proven system archetypes from systems thinking literature
-- - Enhanced detection logic based on question patterns
-- - Research-backed quick wins for each archetype

-- Drop existing data to ensure clean update
DELETE FROM quick_wins WHERE source = 'system';
DELETE FROM archetypes;
DELETE FROM archetype_detection_rules;
DELETE FROM system_archetypes;
DELETE FROM health_check_questions;

-- =====================================================
-- UPDATED HEALTH CHECK QUESTIONS (20 Questions)
-- =====================================================

-- Insert the 20 research-based questions
INSERT INTO health_check_questions (id, dimension, category, text, tooltip) VALUES
-- EFFICIENCY QUESTIONS (7 questions)
(1, 'Efficiency', 'Process', 'Our work processes are streamlined and free of unnecessary delays or inefficiencies.', 'Assesses process efficiency and whether workflows suffer from bottlenecks or waste.'),
(2, 'Efficiency', 'Resource', 'We have the tools and technology we need to do our jobs efficiently.', 'Checks whether employees feel supported by adequate tools and systems.'),
(3, 'Efficiency', 'Structure', 'Roles and responsibilities are clearly defined, avoiding duplication of effort.', 'Gauges role clarity and structure to ensure work isn''t redundantly done.'),
(4, 'Efficiency', 'Problem Solving', 'When problems or issues arise, we address the root causes rather than applying quick fixes.', 'Measures the organization''s problem-solving approach - symptoms vs root causes.'),
(5, 'Efficiency', 'Coordination', 'Different departments and teams coordinate well with each other to get things done.', 'Evaluates cross-departmental collaboration and information flow.'),
(6, 'Efficiency', 'Decision Making', 'Decisions are made quickly and effectively, without excessive bureaucracy.', 'Assesses organizational agility and whether hierarchical delays slow down work.'),
(7, 'Efficiency', 'Resource Allocation', 'Resources (people, budget, time) are allocated to the right priorities and not wasted on low-value activities.', 'Checks if the organization is efficient in resource utilization.'),

-- EFFECTIVENESS QUESTIONS (8 questions)
(8, 'Effectiveness', 'Strategy Clarity', 'Everyone in the organization clearly understands our vision, strategy, and top priorities.', 'Determines if there is a shared understanding of direction.'),
(9, 'Effectiveness', 'Execution Planning', 'We have translated our strategic goals into concrete plans with clear milestones and accountabilities.', 'Checks execution planning and actionable initiatives.'),
(10, 'Effectiveness', 'Capabilities', 'We have the right people, skills, and capabilities in place to achieve our strategy.', 'Assesses talent and capability alignment with strategy.'),
(11, 'Effectiveness', 'Organizational Design', 'Our organizational structure and processes enable us to execute our strategy without needless obstacles.', 'Evaluates if the org design fits the strategy.'),
(12, 'Effectiveness', 'Goal Achievement', 'We consistently meet or exceed the important performance targets we set for ourselves.', 'Directly measures effectiveness in terms of goal achievement.'),
(13, 'Effectiveness', 'Standards', 'We uphold high standards for performance and do not lower our goals when challenges arise.', 'Tests for the Eroding/Drifting Goals archetype.'),
(14, 'Effectiveness', 'Adaptability', 'We respond quickly to changes in the market or external environment to stay on track with our goals.', 'Assesses adaptability and external orientation.'),
(15, 'Effectiveness', 'External Orientation', 'We actively seek feedback from customers or stakeholders and use it to improve our products, services, or processes.', 'Measures external orientation and continuous improvement.'),

-- EXCELLENCE QUESTIONS (5 questions)
(16, 'Excellence', 'Innovation', 'Our culture encourages continuous improvement and innovation in how we work.', 'Evaluates how much the organization emphasizes learning and new ideas.'),
(17, 'Excellence', 'Psychological Safety', 'Employees at all levels feel safe to speak up with concerns or new ideas (without fear of blame or ridicule).', 'Measures psychological safety and open communication.'),
(18, 'Excellence', 'Recognition', 'Great work is regularly recognized and celebrated in our organization.', 'Checks for recognition, a key driver of engagement and excellence.'),
(19, 'Excellence', 'Development', 'We invest in developing our people''s skills and provide opportunities for growth and learning.', 'Assesses the organization''s commitment to talent development.'),
(20, 'Excellence', 'Purpose', 'There is a strong sense of shared purpose and values; everyone knows why their work matters.', 'Measures mission alignment and inspiration.');

-- =====================================================
-- UPDATED SYSTEM ARCHETYPES (7 Research-Based)
-- =====================================================

INSERT INTO system_archetypes (name, description, symptoms, typical_behavior, leverage_points) VALUES
(
  'Shifting the Burden',
  'The organization relies on short-term fixes (symptomatic solutions) and neglects the underlying issues, becoming trapped in a cycle where problems keep recurring.',
  ARRAY[
    'Problems keep recurring despite fixes',
    'Heavy reliance on quick fixes and band-aids', 
    'Root cause analysis is rarely done',
    'Fire-fighting becomes the norm',
    'Team feels like they are always in crisis mode'
  ],
  'When faced with a problem, the organization applies a quick fix that makes the symptom go away temporarily. This relieves pressure to address the fundamental solution, so the underlying problem persists and resurfaces repeatedly.',
  ARRAY[
    'Strengthen fundamental solution capability',
    'Temporarily limit access to symptomatic solutions',
    'Invest time in root cause analysis',
    'Create incentives for prevention over quick fixes',
    'Track recurring problems to highlight the pattern'
  ]
),
(
  'Fixes That Fail', 
  'Quick fixes are applied to solve problems but these solutions actually make the original problem worse in the long run due to unintended consequences.',
  ARRAY[
    'Solutions create new problems',
    'Fixes work initially but problems worsen later',
    'Unintended consequences are common',
    'Same fixes are applied repeatedly despite side effects',
    'Short-term improvements followed by long-term decline'
  ],
  'The organization implements solutions that appear to work in the short term but actually make the problem worse in the long run. The delay between the fix and its negative consequences makes the connection hard to see.',
  ARRAY[
    'Look for unintended consequences before implementing fixes',
    'Consider long-term effects in solution design',
    'Implement solutions that address root causes',
    'Monitor downstream effects of fixes',
    'Use pre-mortems to anticipate failure modes'
  ]
),
(
  'Drifting Goals (Eroding Goals)',
  'Performance standards or targets are gradually lowered to close the gap between desired and actual performance, leading to a downward spiral of expectations.',
  ARRAY[
    'Goals are frequently lowered or adjusted downward',
    'Quality standards are compromised under pressure',
    'Performance expectations drift lower over time',
    'Achievement of mediocre results is celebrated',
    'Original ambitious targets are forgotten'
  ],
  'When actual performance falls short of goals, instead of working to improve performance, the organization lowers the goal to match current performance. This becomes a habit that leads to gradual erosion of standards.',
  ARRAY[
    'Anchor goals to external standards or values',
    'Provide support to improve performance rather than lower goals',
    'Make goal erosion visible and unacceptable',
    'Tie goals to external commitments or benchmarks',
    'Create accountability for maintaining standards'
  ]
),
(
  'Success to the Successful',
  'Reinforcing loops favor those already succeeding while starving others of resources, creating an unfair system where the rich get richer and others struggle to compete.',
  ARRAY[
    'Resources consistently flow to already successful units',
    'Struggling teams receive less support over time',
    'Performance gaps widen between units',
    'Success becomes increasingly concentrated',
    'Unsuccessful units lose motivation and capability'
  ],
  'Once one entity gains an advantage, the system channels more resources to it because it appears to be the best bet for success. This reinforces its advantage while others fall further behind, creating a self-perpetuating cycle.',
  ARRAY[
    'Ensure more balanced resource allocation',
    'Create independent success paths for different units',
    'Share knowledge and capabilities across units',
    'Adjust allocation criteria to include potential not just past performance',
    'Break up overly concentrated advantages'
  ]
),
(
  'Limits to Growth',
  'A reinforcing growth process eventually hits a limiting constraint, causing growth to stall or reverse unless the constraint is identified and addressed.',
  ARRAY[
    'Growth has plateaued or is slowing',
    'Performance improvements have stalled',
    'Capacity constraints are becoming apparent',
    'Success strategies no longer work as well',
    'Team feels stuck despite continued efforts'
  ],
  'Initial growth creates optimism and more investment in the growth strategy. However, an unaddressed limiting factor eventually constrains further growth, causing the growth engine to sputter despite continued effort.',
  ARRAY[
    'Identify and address the limiting constraint',
    'Stop investing in areas that have hit limits',
    'Develop new capacity in constrained areas',
    'Shift strategy when limits are reached',
    'Anticipate limits before they halt growth'
  ]
),
(
  'Tragedy of the Commons',
  'Multiple actors exploit a shared resource for individual gain, resulting in the depletion of the resource to everyone''s detriment.',
  ARRAY[
    'Shared resources are overused or strained',
    'Teams compete for common resources',
    'No one feels responsible for resource sustainability',
    'Individual optimization hurts collective performance',
    'Common areas or services are degraded'
  ],
  'Each actor uses the shared resource to maximize their individual benefit. Since the cost is shared among all users but the benefit accrues to the individual, everyone has an incentive to overuse the resource, leading to its depletion.',
  ARRAY[
    'Create rules or quotas for shared resource use',
    'Make resource usage visible to all users',
    'Establish governance for shared resources',
    'Align individual incentives with collective good',
    'Create shared accountability for resource health'
  ]
),
(
  'Accidental Adversaries',
  'Partners or units that should collaborate end up in conflict due to unintended consequences of their actions, creating a cycle of actions that undermine each other.',
  ARRAY[
    'Well-meaning teams create problems for each other',
    'Actions intended to help one area hurt another',
    'Lack of coordination leads to conflicting efforts',
    'Teams blame each other for problems',
    'Communication breakdowns are common'
  ],
  'Each party takes actions that make perfect sense from their perspective but unintentionally undermine their partner. This creates a vicious cycle where each party''s response to problems makes things worse for the other.',
  ARRAY[
    'Improve communication and coordination',
    'Understand each other''s constraints and needs',
    'Create shared goals and metrics',
    'Map the system to see unintended effects',
    'Design win-win solutions that benefit both parties'
  ]
);

-- =====================================================
-- ENHANCED ARCHETYPE DETECTION RULES
-- =====================================================

INSERT INTO archetype_detection_rules (archetype_id, rule_name, rule_description, conditions) VALUES
-- Shifting the Burden: Low Q4 (root cause problem solving) 
(
  (SELECT id FROM system_archetypes WHERE name = 'Shifting the Burden'),
  'Poor Root Cause Problem Solving',
  'Detects Shifting the Burden when root cause problem solving is weak',
  '{
    "conditions": {
      "and": [
        {"question_id": 4, "score": {"lt": 3}}
      ]
    }
  }'
),

-- Drifting Goals: Low Q13 (upholding high standards)
(
  (SELECT id FROM system_archetypes WHERE name = 'Drifting Goals (Eroding Goals)'),
  'Lowering Standards Under Pressure',
  'Detects Drifting Goals when standards are lowered instead of improving performance',
  '{
    "conditions": {
      "and": [
        {"question_id": 13, "score": {"lt": 3}}
      ]
    }
  }'
),

-- Fixes That Fail: Low Q4 (root causes) AND low Q16 or Q17 (innovation/safety)
(
  (SELECT id FROM system_archetypes WHERE name = 'Fixes That Fail'),
  'Quick Fixes with Poor Innovation',
  'Detects Fixes that Fail when quick fixes are used without innovation or safety to report problems',
  '{
    "conditions": {
      "and": [
        {"question_id": 4, "score": {"lt": 3}},
        {"or": [
          {"question_id": 16, "score": {"lt": 3}},
          {"question_id": 17, "score": {"lt": 3}}
        ]}
      ]
    }
  }'
),

-- Success to the Successful: Low Q7 (resource allocation) 
(
  (SELECT id FROM system_archetypes WHERE name = 'Success to the Successful'),
  'Unfair Resource Distribution',
  'Detects Success to the Successful when resource allocation is perceived as unfair',
  '{
    "conditions": {
      "and": [
        {"question_id": 7, "score": {"lt": 3}}
      ]
    }
  }'
),

-- Limits to Growth: Low Q10 (capabilities) OR low Q19 (development) OR low Q14 (adaptability)
(
  (SELECT id FROM system_archetypes WHERE name = 'Limits to Growth'),
  'Capability or Adaptability Constraints',
  'Detects Limits to Growth when capabilities, development, or adaptability are constrained',
  '{
    "conditions": {
      "or": [
        {"question_id": 10, "score": {"lt": 3}},
        {"question_id": 19, "score": {"lt": 3}},
        {"question_id": 14, "score": {"lt": 3}}
      ]
    }
  }'
),

-- Tragedy of the Commons: Low Q5 (coordination) AND low Q20 (shared purpose)
(
  (SELECT id FROM system_archetypes WHERE name = 'Tragedy of the Commons'),
  'Poor Coordination and Shared Purpose',
  'Detects Tragedy of the Commons when coordination and shared purpose are weak',
  '{
    "conditions": {
      "and": [
        {"question_id": 5, "score": {"lt": 3}},
        {"question_id": 20, "score": {"lt": 3}}
      ]
    }
  }'
),

-- Accidental Adversaries: Low Q5 (coordination) AND low Q17 (safety to speak up)
(
  (SELECT id FROM system_archetypes WHERE name = 'Accidental Adversaries'),
  'Poor Coordination and Communication Safety',
  'Detects Accidental Adversaries when coordination is poor and people don''t feel safe speaking up',
  '{
    "conditions": {
      "and": [
        {"question_id": 5, "score": {"lt": 3}},
        {"question_id": 17, "score": {"lt": 3}}
      ]
    }
  }'
);

-- =====================================================
-- IMPROVED ARCHETYPE DETECTION FUNCTION
-- =====================================================

-- Enhanced function to detect archetypes based on research patterns
CREATE OR REPLACE FUNCTION detect_archetypes_for_user(p_user_id UUID)
RETURNS TABLE(
  archetype_name TEXT,
  source_dimension TEXT,
  insight TEXT
) AS $$
DECLARE
  rule_record RECORD;
  condition_met BOOLEAN;
  q4_score INTEGER;
  q13_score INTEGER;
  q16_score INTEGER;
  q17_score INTEGER;
  q7_score INTEGER;
  q10_score INTEGER;
  q19_score INTEGER;
  q14_score INTEGER;
  q5_score INTEGER;
  q20_score INTEGER;
BEGIN
  -- Get scores for key questions
  SELECT COALESCE(response_value, 0) INTO q4_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 4;
  SELECT COALESCE(response_value, 0) INTO q13_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 13;
  SELECT COALESCE(response_value, 0) INTO q16_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 16;
  SELECT COALESCE(response_value, 0) INTO q17_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 17;
  SELECT COALESCE(response_value, 0) INTO q7_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 7;
  SELECT COALESCE(response_value, 0) INTO q10_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 10;
  SELECT COALESCE(response_value, 0) INTO q19_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 19;
  SELECT COALESCE(response_value, 0) INTO q14_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 14;
  SELECT COALESCE(response_value, 0) INTO q5_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 5;
  SELECT COALESCE(response_value, 0) INTO q20_score FROM health_check_responses WHERE user_id = p_user_id AND question_id = 20;

  -- Check each archetype based on research patterns
  
  -- Shifting the Burden: Q4 < 3
  IF q4_score < 3 THEN
    archetype_name := 'Shifting the Burden';
    source_dimension := 'Efficiency';
    insight := 'Your organization tends to apply quick fixes rather than addressing root causes. This creates a cycle where problems keep recurring because the fundamental issues are never resolved.';
    RETURN NEXT;
  END IF;
  
  -- Drifting Goals: Q13 < 3
  IF q13_score < 3 THEN
    archetype_name := 'Drifting Goals (Eroding Goals)';
    source_dimension := 'Effectiveness';
    insight := 'Performance standards are being lowered when challenges arise rather than working to improve performance. This leads to a gradual erosion of excellence over time.';
    RETURN NEXT;
  END IF;
  
  -- Fixes That Fail: Q4 < 3 AND (Q16 < 3 OR Q17 < 3)
  IF q4_score < 3 AND (q16_score < 3 OR q17_score < 3) THEN
    archetype_name := 'Fixes That Fail';
    source_dimension := 'Excellence';
    insight := 'Quick fixes are being applied without sufficient innovation or psychological safety to identify unintended consequences. Solutions may be making problems worse in the long run.';
    RETURN NEXT;
  END IF;
  
  -- Success to the Successful: Q7 < 3
  IF q7_score < 3 THEN
    archetype_name := 'Success to the Successful';
    source_dimension := 'Efficiency';
    insight := 'Resources appear to be allocated unfairly, potentially creating a reinforcing loop where successful areas get more resources while others are starved of support.';
    RETURN NEXT;
  END IF;
  
  -- Limits to Growth: Q10 < 3 OR Q19 < 3 OR Q14 < 3
  IF q10_score < 3 OR q19_score < 3 OR q14_score < 3 THEN
    archetype_name := 'Limits to Growth';
    source_dimension := CASE 
      WHEN q10_score < 3 THEN 'Effectiveness'
      WHEN q19_score < 3 THEN 'Excellence'
      ELSE 'Effectiveness'
    END;
    insight := 'Growth or improvement may be hitting constraints due to limited capabilities, insufficient development, or poor adaptability. These limits need to be addressed to resume progress.';
    RETURN NEXT;
  END IF;
  
  -- Tragedy of the Commons: Q5 < 3 AND Q20 < 3
  IF q5_score < 3 AND q20_score < 3 THEN
    archetype_name := 'Tragedy of the Commons';
    source_dimension := 'Excellence';
    insight := 'Poor coordination and lack of shared purpose suggest that shared resources may be overused or that teams are optimizing individually at the expense of collective good.';
    RETURN NEXT;
  END IF;
  
  -- Accidental Adversaries: Q5 < 3 AND Q17 < 3
  IF q5_score < 3 AND q17_score < 3 THEN
    archetype_name := 'Accidental Adversaries';
    source_dimension := 'Efficiency';
    insight := 'Poor coordination combined with lack of psychological safety suggests that well-meaning teams may be creating unintended problems for each other due to communication breakdowns.';
    RETURN NEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED RESEARCH-BASED QUICK WINS FOR EACH ARCHETYPE
-- =====================================================

-- Create a table to store quick win templates for each archetype
CREATE TABLE IF NOT EXISTS quick_win_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_level TEXT NOT NULL CHECK (impact_level IN ('Low', 'Medium', 'High')),
  effort_level TEXT NOT NULL CHECK (effort_level IN ('Low', 'Medium', 'High')),
  timeframe TEXT NOT NULL CHECK (timeframe IN ('Immediate', 'Short-term', 'Medium-term')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Insert quick win templates for each archetype (3 per archetype)
INSERT INTO quick_win_templates (archetype_name, title, description, impact_level, effort_level, timeframe) VALUES

-- Shifting the Burden Quick Wins
('Shifting the Burden', 'Launch a Root-Cause Task Force', 'For a chronic issue that people keep "band-aiding," form a small cross-functional team to find and address its root cause using techniques like 5 Whys. Even a pilot fix to one problem can break the habit of reflexively using symptomatic cures.', 'High', 'Medium', 'Short-term'),
('Shifting the Burden', 'Implement a Quick Fix Moratorium', 'Identify one quick fix that the team habitually uses and pause it for one cycle. Force the team to confront the underlying cause. By removing the crutch of the symptomatic solution, you create pressure that makes the real problem unavoidable.', 'High', 'Low', 'Immediate'),
('Shifting the Burden', 'Pair Every Quick Fix with Prevention Owner', 'When a symptomatic fix must be applied, assign someone to also plan a longer-term remedy. This keeps focus on the fundamental solution even as you treat symptoms, gradually building capability to solve root issues.', 'Medium', 'Low', 'Immediate'),

-- Drifting Goals Quick Wins  
('Drifting Goals (Eroding Goals)', 'Publicly Reaffirm a Key Goal', 'Choose an important target that has been threatened and have leadership explicitly restate commitment to it, including the bigger purpose it serves. Reanchoring the goal to an external rationale makes it "non-negotiable."', 'High', 'Low', 'Immediate'),
('Drifting Goals (Eroding Goals)', 'Provide Short-term Support Instead of Lowering Targets', 'If a team is falling behind a goal, instead of cutting the goal, offer a burst of help on the condition that the goal remains. This demonstrates confidence that the target is achievable with effort.', 'High', 'Medium', 'Short-term'),
('Drifting Goals (Eroding Goals)', 'Tie Internal Goal to External Benchmark', 'Commit to a customer-facing quality guarantee or industry certification. External commitments create natural accountability - you can''t quietly lower the goal without public notice.', 'High', 'Medium', 'Short-term'),

-- Fixes That Fail Quick Wins
('Fixes That Fail', 'Review Recent Fix Side Effects', 'Gather the team involved in a recent major workaround and list any new problems that emerged from it. Pick one manageable side-effect and solve it while keeping the original benefit.', 'High', 'Low', 'Immediate'),
('Fixes That Fail', 'Institute Pre-mortems for Quick Fixes', 'When a quick solution is proposed, take an hour with the team to imagine it''s 6 months later and the fix failed. Brainstorm why and add safeguards to prevent those outcomes.', 'Medium', 'Low', 'Immediate'),
('Fixes That Fail', 'Track Long-term Metrics After Fixes', 'Choose a relevant long-term metric to watch after implementing a fix. If it starts worsening, acknowledge that the fix may be backfiring and adjust course.', 'High', 'Low', 'Immediate'),

-- Success to the Successful Quick Wins
('Success to the Successful', 'Share Spotlight on Small Project', 'Identify a project always handled by the "star" team and reassign it (or a portion) to a less favored team, along with adequate support. This gives the other team a chance to build capability and credibility.', 'High', 'Medium', 'Short-term'),
('Success to the Successful', 'Create Cross-team Mentorship', 'Pair members of the high-performing group with those of a struggling group in a mentorship or joint task force. This leverages the success of one to lift the other.', 'Medium', 'Low', 'Immediate'),
('Success to the Successful', 'Adjust Resource Allocation Criteria', 'Add a criterion that considers potential or need, not just past performance. Allocate a bit extra to an initiative that underperformed but has high future promise.', 'High', 'Low', 'Immediate'),

-- Limits to Growth Quick Wins
('Limits to Growth', 'Identify and Elevate the Bottleneck', 'Convene a quick brainstorming: "What is our biggest bottleneck to growing X right now?" Take an immediate action to elevate that constraint slightly, even if temporarily.', 'High', 'Medium', 'Short-term'),
('Limits to Growth', 'Stop Low-value Activities', 'Identify a low-value project or report and pause it for a trial period. Reallocate that freed capacity to the constrained area to immediately boost capacity where it''s needed most.', 'Medium', 'Low', 'Immediate'),
('Limits to Growth', 'Signal Recognition of the Limit', 'Present data on the plateau and state "we suspect a limiting factor at play." This legitimizes conversations about underlying constraints and often leads to creative solutions.', 'Medium', 'Low', 'Immediate'),

-- Tragedy of the Commons Quick Wins
('Tragedy of the Commons', 'Establish Simple Usage Rules', 'Quickly implement a rule for the shared resource - each team gets a fixed allocation per quarter. This immediately curbs over-exploitation and encourages careful planning.', 'High', 'Low', 'Immediate'),
('Tragedy of the Commons', 'Increase Usage Transparency', 'Create a public dashboard showing each team''s consumption of the shared resource and outcomes. Making usage visible introduces social regulation effects.', 'Medium', 'Low', 'Immediate'),
('Tragedy of the Commons', 'Convene a Commons Council', 'Get representatives of each team that uses the shared resource together for a one-time meeting to agree on practices to reduce strain, such as staggering usage or sharing surplus.', 'Medium', 'Low', 'Immediate'),

-- Accidental Adversaries Quick Wins
('Accidental Adversaries', 'Map the Joint Process', 'Arrange a facilitated meeting with the two teams at odds to map out how each of their actions affects the other. This often reveals that hostile actions were driven by misunderstood constraints.', 'High', 'Medium', 'Short-term'),
('Accidental Adversaries', 'Establish Shared Goal', 'Identify an overarching objective that both sides benefit from and set a short-term target for that metric. A win-win loop needs to be reinforced to counter the vicious cycle.', 'High', 'Low', 'Immediate'),
('Accidental Adversaries', 'Exchange Empathy Data', 'Have each side share one piece of information about their pressures or constraints that they think the other side doesn''t appreciate. This can profoundly shift attitudes from blame to empathy.', 'Medium', 'Low', 'Immediate');

-- =====================================================
-- ENHANCED QUICK WIN GENERATION FUNCTION
-- =====================================================

-- Function to generate quick wins based on detected archetypes
CREATE OR REPLACE FUNCTION generate_quick_wins_for_archetypes(p_user_id UUID, p_archetypes TEXT[])
RETURNS TABLE(
  title TEXT,
  description TEXT,
  impact_level TEXT,
  effort_level TEXT,
  timeframe TEXT,
  archetype_name TEXT
) AS $$
DECLARE
  archetype TEXT;
BEGIN
  -- For each detected archetype, return its quick wins
  FOREACH archetype IN ARRAY p_archetypes
  LOOP
    RETURN QUERY
    SELECT 
      qwt.title,
      qwt.description,
      qwt.impact_level,
      qwt.effort_level,
      qwt.timeframe,
      qwt.archetype_name
    FROM quick_win_templates qwt
    WHERE qwt.archetype_name = archetype;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset the sequence for health_check_questions to start from 21
SELECT setval('health_check_questions_id_seq', 21, false); 