-- =====================================================
-- Triple eOS Backend - Complete Implementation
-- =====================================================
-- This migration creates a clean, comprehensive backend for Triple eOS
-- Includes: Health Check, Archetypes, Quick Wins, and Authentication

-- Clean up: Drop all existing tables to ensure clean state
DROP TABLE IF EXISTS quick_wins CASCADE;
DROP TABLE IF EXISTS archetypes CASCADE;
DROP TABLE IF EXISTS health_check_results CASCADE;
DROP TABLE IF EXISTS health_check_responses CASCADE;
DROP TABLE IF EXISTS health_check_questions CASCADE;
DROP TABLE IF EXISTS health_check_insights CASCADE;
DROP TABLE IF EXISTS archetype_detection_rules CASCADE;
DROP TABLE IF EXISTS system_archetypes CASCADE;
DROP TABLE IF EXISTS strategy_hypotheses CASCADE;
DROP TABLE IF EXISTS strategic_decisions CASCADE;
DROP TABLE IF EXISTS review_cycles CASCADE;
DROP TABLE IF EXISTS feedback_entries CASCADE;
DROP TABLE IF EXISTS learning_insights CASCADE;
DROP TABLE IF EXISTS system_checkpoints CASCADE;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Table: health_check_questions
-- Stores the survey questions for health check assessments
CREATE TABLE health_check_questions (
  id SERIAL PRIMARY KEY,
  dimension TEXT NOT NULL CHECK (dimension IN ('Efficiency', 'Effectiveness', 'Excellence')),
  category TEXT NOT NULL,
  text TEXT NOT NULL UNIQUE,
  tooltip TEXT
);

-- Table: health_check_responses
-- Stores individual user responses to health check questions
CREATE TABLE health_check_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('Efficiency', 'Effectiveness', 'Excellence')),
  question_id INTEGER NOT NULL REFERENCES health_check_questions(id) ON DELETE CASCADE,
  response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: health_check_results
-- Stores calculated scores and results for each dimension
CREATE TABLE health_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('Efficiency', 'Effectiveness', 'Excellence')),
  average_score FLOAT NOT NULL,
  color TEXT CHECK (color IN ('Green', 'Yellow', 'Red')),
  global_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: system_archetypes
-- Master table of all available system archetypes
CREATE TABLE system_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  typical_behavior TEXT NOT NULL,
  leverage_points TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: archetype_detection_rules
-- Rules for detecting when archetypes should be suggested
CREATE TABLE archetype_detection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID NOT NULL REFERENCES system_archetypes(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  conditions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: archetypes
-- User-specific detected archetypes based on their health check results
CREATE TABLE archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_name TEXT NOT NULL,
  source_dimension TEXT NOT NULL CHECK (source_dimension IN ('Efficiency', 'Effectiveness', 'Excellence')),
  insight TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: quick_wins
-- User's quick wins (both system-generated and user-created)
CREATE TABLE quick_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('system', 'user')),
  archetype TEXT,
  dimension TEXT NOT NULL CHECK (dimension IN ('Efficiency', 'Effectiveness', 'Excellence')),
  impact_level TEXT CHECK (impact_level IN ('Low', 'Medium', 'High')),
  status TEXT NOT NULL CHECK (status IN ('To Do', 'In Progress', 'Done')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: strategy_hypotheses
-- Strategic decision-making and hypothesis tracking for the Effectiveness phase
CREATE TABLE strategy_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Strategy Fields
  challenge_area TEXT NOT NULL,
  current_structure TEXT NOT NULL,
  mental_model TEXT,
  leverage_point TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  
  -- Tracking and Validation
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Testing', 'Validated', 'Discarded')) DEFAULT 'Draft',
  priority_level TEXT NOT NULL CHECK (priority_level IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  expected_outcome TEXT,
  owner_notes TEXT,
  reflection_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: strategic_decisions
-- Strategic Decision Cascade based on "Playing to Win" framework
CREATE TABLE strategic_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- The Five Cascading Choices
  winning_aspiration TEXT, -- What does winning look like for us?
  where_to_play TEXT,      -- Where will we compete?
  how_to_win TEXT,         -- How will we win there?
  capabilities TEXT,       -- What must we be great at?
  management_systems TEXT, -- What systems will support us?
  
  -- Supporting Evidence and Context
  context_summary TEXT,
  supporting_hypotheses TEXT[], -- References to validated strategy hypotheses
  coherence_notes TEXT,
  implementation_notes TEXT,
  
  -- Metadata
  version INTEGER DEFAULT 1, -- Allow for versioning of strategic decisions
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Review', 'Approved', 'Active', 'Archived')) DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: review_cycles
-- Main review loop cycles for tracking Excellence phase
CREATE TABLE review_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cycle Metadata
  cycle_name TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('Weekly', 'Monthly', 'Quarterly', 'Custom')) DEFAULT 'Monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Cycle Scores and Metrics
  efficiency_score FLOAT,
  effectiveness_score FLOAT,
  excellence_score FLOAT,
  overall_progress_score FLOAT,
  
  -- Review Summary
  key_learnings TEXT,
  major_changes TEXT,
  next_cycle_focus TEXT,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('Active', 'Completed', 'Archived')) DEFAULT 'Active',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: feedback_entries
-- System for collecting feedback across all modules
CREATE TABLE feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL,
  
  -- Feedback Content
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('Manual', 'System_Generated', 'Health_Check', 'Quick_Win', 'Strategy', 'General')),
  category TEXT NOT NULL CHECK (category IN ('Process', 'People', 'Purpose', 'System', 'External')),
  module_source TEXT CHECK (module_source IN ('health_check', 'archetypes', 'quick_wins', 'strategy_map', 'decisions', 'review_loop')),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  
  -- Action Tracking
  requires_action BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  action_status TEXT CHECK (action_status IN ('Pending', 'In_Progress', 'Completed', 'Dismissed')),
  
  -- Metadata
  tags TEXT[],
  priority_level TEXT CHECK (priority_level IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: learning_insights
-- Accumulated insights and patterns from the review process
CREATE TABLE learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL,
  
  -- Insight Content
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('System_Pattern', 'Strategic_Learning', 'Process_Improvement', 'Cultural_Shift', 'External_Factor')),
  
  -- Source and Evidence
  source_modules TEXT[], -- Which modules contributed to this insight
  supporting_evidence TEXT,
  confidence_level TEXT CHECK (confidence_level IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  
  -- Impact and Actions
  potential_impact TEXT CHECK (potential_impact IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  recommended_actions TEXT,
  implementation_status TEXT CHECK (implementation_status IN ('Identified', 'Planning', 'Implementing', 'Completed', 'Abandoned')) DEFAULT 'Identified',
  
  -- Learning Classification
  applies_to_dimension TEXT CHECK (applies_to_dimension IN ('Efficiency', 'Effectiveness', 'Excellence', 'All')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: system_checkpoints
-- Track specific checkpoints and KPIs across the Triple E dimensions
CREATE TABLE system_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL,
  
  -- Checkpoint Definition
  checkpoint_name TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('Efficiency', 'Effectiveness', 'Excellence')),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('Quantitative', 'Qualitative', 'Binary')),
  
  -- Measurement
  target_value TEXT,
  actual_value TEXT,
  measurement_unit TEXT,
  measurement_method TEXT,
  
  -- Status and Progress
  status TEXT NOT NULL CHECK (status IN ('On_Track', 'At_Risk', 'Behind', 'Exceeded', 'Not_Measured')) DEFAULT 'Not_Measured',
  progress_percentage FLOAT CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Context
  checkpoint_description TEXT,
  notes TEXT,
  related_quick_win_id UUID REFERENCES quick_wins(id) ON DELETE SET NULL,
  related_hypothesis_id UUID REFERENCES strategy_hypotheses(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE health_check_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_checkpoints ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- health_check_questions: Readable by all authenticated users
CREATE POLICY "Authenticated users can read questions" ON health_check_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- health_check_responses: Users can only access their own responses
CREATE POLICY "Users can manage their own responses" ON health_check_responses
  USING (user_id = auth.uid());

-- health_check_results: Users can only access their own results
CREATE POLICY "Users can manage their own results" ON health_check_results
  USING (user_id = auth.uid());

-- system_archetypes: Readable by all authenticated users
CREATE POLICY "Authenticated users can read system archetypes" ON system_archetypes
  FOR SELECT USING (auth.role() = 'authenticated');

-- archetype_detection_rules: Readable by all authenticated users
CREATE POLICY "Authenticated users can read detection rules" ON archetype_detection_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- archetypes: Users can only access their own detected archetypes
CREATE POLICY "Users can manage their own archetypes" ON archetypes
  USING (user_id = auth.uid());

-- quick_wins: Users can only access their own quick wins
CREATE POLICY "Users can manage their own quick wins" ON quick_wins
  USING (user_id = auth.uid());

-- strategy_hypotheses: Users can only access their own strategy hypotheses
CREATE POLICY "Users can manage their own strategy hypotheses" ON strategy_hypotheses
  USING (user_id = auth.uid());

-- strategic_decisions: Users can only access their own strategic decisions
CREATE POLICY "Users can manage their own strategic decisions" ON strategic_decisions
  USING (user_id = auth.uid());

-- review_cycles: Users can only access their own review cycles
CREATE POLICY "Users can manage their own review cycles" ON review_cycles
  USING (user_id = auth.uid());

-- feedback_entries: Users can only access their own feedback entries
CREATE POLICY "Users can manage their own feedback entries" ON feedback_entries
  USING (user_id = auth.uid());

-- learning_insights: Users can only access their own learning insights
CREATE POLICY "Users can manage their own learning insights" ON learning_insights
  USING (user_id = auth.uid());

-- system_checkpoints: Users can only access their own system checkpoints
CREATE POLICY "Users can manage their own system checkpoints" ON system_checkpoints
  USING (user_id = auth.uid());

-- =====================================================
-- SEED DATA
-- =====================================================

-- Seed health_check_questions (20 questions across 3 dimensions)
INSERT INTO health_check_questions (dimension, category, text, tooltip) VALUES
-- Efficiency Questions (7 questions)
('Efficiency', 'Process', 'Our processes are clearly documented and easy to follow.', 'Documentation and clarity of processes.'),
('Efficiency', 'Process', 'We regularly review and optimize our workflows.', 'Continuous improvement of workflows.'),
('Efficiency', 'Process', 'We use automation to reduce manual work.', 'Automation and technology use.'),
('Efficiency', 'Resource', 'Resources are allocated efficiently.', 'Resource allocation.'),
('Efficiency', 'Bottleneck', 'Bottlenecks are quickly identified and resolved.', 'Bottleneck management.'),
('Efficiency', 'Lean', 'We minimize waste and unnecessary steps.', 'Lean practices.'),
('Efficiency', 'Risk', 'We have contingency plans for key risks.', 'Risk management.'),

-- Effectiveness Questions (7 questions)
('Effectiveness', 'Goals', 'Our team consistently achieves its goals.', 'Goal achievement.'),
('Effectiveness', 'Metrics', 'We have clear metrics to measure success.', 'Success metrics.'),
('Effectiveness', 'Decision Making', 'Decision-making is data-driven and timely.', 'Decision-making process.'),
('Effectiveness', 'Adaptability', 'We adapt quickly to changes in the market.', 'Adaptability.'),
('Effectiveness', 'Roles', 'Roles and responsibilities are well defined.', 'Role clarity.'),
('Effectiveness', 'Communication', 'Communication is clear and effective.', 'Communication quality.'),
('Effectiveness', 'Strategy', 'Our strategy is well understood by all.', 'Strategic alignment.'),

-- Excellence Questions (6 questions)
('Excellence', 'Innovation', 'We encourage innovation and new ideas.', 'Culture of innovation.'),
('Excellence', 'Feedback', 'Feedback is regularly collected and acted upon.', 'Feedback mechanisms.'),
('Excellence', 'Learning', 'We invest in professional development.', 'Learning and growth.'),
('Excellence', 'Quality', 'Quality standards are consistently met.', 'Quality assurance.'),
('Excellence', 'Recognition', 'We celebrate achievements and recognize contributions.', 'Recognition and celebration.'),
('Excellence', 'Benchmarking', 'We benchmark against industry best practices.', 'Benchmarking.');

-- Seed system_archetypes
INSERT INTO system_archetypes (name, description, symptoms, typical_behavior, leverage_points) VALUES
(
  'Shifting the Burden',
  'A pattern where quick fixes are used to address symptoms rather than solving the underlying problem, leading to increased dependency on symptomatic solutions.',
  ARRAY[
    'Increasing reliance on quick fixes',
    'Problems keep recurring',
    'Growing dependency on symptomatic solutions',
    'Underlying problems worsen over time'
  ],
  'The organization tends to address symptoms rather than root causes, leading to a cycle of temporary fixes that don''t solve the underlying issues.',
  ARRAY[
    'Identify and address root causes',
    'Build capacity for fundamental solutions',
    'Reduce dependency on symptomatic fixes',
    'Create feedback loops that reinforce long-term solutions'
  ]
),
(
  'Erosion of Goals',
  'A pattern where goals or standards are gradually lowered in response to performance gaps, leading to a decline in overall performance.',
  ARRAY[
    'Goals are consistently not met',
    'Standards are gradually lowered',
    'Performance gaps persist',
    'Declining expectations over time'
  ],
  'When faced with performance gaps, the organization lowers its goals rather than improving performance, leading to a gradual decline in standards.',
  ARRAY[
    'Maintain clear, non-negotiable goals',
    'Address performance gaps directly',
    'Build capacity to meet original goals',
    'Create accountability for maintaining standards'
  ]
),
(
  'Fixes that Fail',
  'A pattern where solutions implemented to solve a problem actually make it worse in the long run, often due to unintended consequences.',
  ARRAY[
    'Problems worsen after fixes',
    'Unintended consequences emerge',
    'Solutions create new problems',
    'Short-term improvements followed by long-term decline'
  ],
  'The organization implements solutions that appear to work in the short term but actually make the problem worse in the long run.',
  ARRAY[
    'Consider long-term consequences',
    'Look for unintended side effects',
    'Implement solutions that address root causes',
    'Monitor for delayed negative effects'
  ]
);

-- Seed archetype_detection_rules
INSERT INTO archetype_detection_rules (archetype_id, rule_name, rule_description, conditions) VALUES
(
  (SELECT id FROM system_archetypes WHERE name = 'Shifting the Burden'),
  'Low Decision Making and Learning',
  'Detects Shifting the Burden when decision-making and learning capabilities are weak',
  '{
    "conditions": {
      "and": [
        {"dimension": "Effectiveness", "category": "Decision Making", "score": {"lt": 3}},
        {"dimension": "Excellence", "category": "Learning", "score": {"lt": 3}}
      ]
    }
  }'
),
(
  (SELECT id FROM system_archetypes WHERE name = 'Erosion of Goals'),
  'Low Process and Goals',
  'Detects Erosion of Goals when process optimization and goal achievement are weak',
  '{
    "conditions": {
      "and": [
        {"dimension": "Efficiency", "category": "Process", "score": {"lt": 3}},
        {"dimension": "Effectiveness", "category": "Goals", "score": {"lt": 3}}
      ]
    }
  }'
),
(
  (SELECT id FROM system_archetypes WHERE name = 'Fixes that Fail'),
  'High Innovation but Low Process',
  'Detects Fixes that Fail when there is high innovation but poor process management',
  '{
    "conditions": {
      "and": [
        {"dimension": "Excellence", "category": "Innovation", "score": {"gt": 3}},
        {"dimension": "Efficiency", "category": "Process", "score": {"lt": 3}}
      ]
    }
  }'
);

-- =====================================================
-- FUNCTIONS FOR ARCHETYPE DETECTION
-- =====================================================

-- Function to detect archetypes based on health check responses
CREATE OR REPLACE FUNCTION detect_archetypes_for_user(p_user_id UUID)
RETURNS TABLE(
  archetype_name TEXT,
  source_dimension TEXT,
  insight TEXT
) AS $$
DECLARE
  rule_record RECORD;
  condition_met BOOLEAN;
BEGIN
  -- Loop through all detection rules
  FOR rule_record IN 
    SELECT 
      sa.name as archetype_name,
      sa.description,
      adr.conditions,
      adr.rule_description
    FROM archetype_detection_rules adr
    JOIN system_archetypes sa ON adr.archetype_id = sa.id
  LOOP
    -- Check if conditions are met for this rule
    -- This is a simplified version - in production you'd want more sophisticated JSON condition evaluation
    condition_met := TRUE;
    
    -- For now, return the archetype if any low scores exist in relevant areas
    IF rule_record.archetype_name = 'Shifting the Burden' THEN
      SELECT COUNT(*) > 0 INTO condition_met
      FROM health_check_responses hcr
      JOIN health_check_questions hcq ON hcr.question_id = hcq.id
      WHERE hcr.user_id = p_user_id 
        AND ((hcq.dimension = 'Effectiveness' AND hcq.category = 'Decision Making' AND hcr.response_value < 3)
             OR (hcq.dimension = 'Excellence' AND hcq.category = 'Learning' AND hcr.response_value < 3));
    END IF;
    
    IF rule_record.archetype_name = 'Erosion of Goals' THEN
      SELECT COUNT(*) > 0 INTO condition_met
      FROM health_check_responses hcr
      JOIN health_check_questions hcq ON hcr.question_id = hcq.id
      WHERE hcr.user_id = p_user_id 
        AND ((hcq.dimension = 'Efficiency' AND hcq.category = 'Process' AND hcr.response_value < 3)
             OR (hcq.dimension = 'Effectiveness' AND hcq.category = 'Goals' AND hcr.response_value < 3));
    END IF;
    
    IF rule_record.archetype_name = 'Fixes that Fail' THEN
      SELECT COUNT(*) > 0 INTO condition_met
      FROM health_check_responses hcr
      JOIN health_check_questions hcq ON hcr.question_id = hcq.id
      WHERE hcr.user_id = p_user_id 
        AND hcq.dimension = 'Excellence' AND hcq.category = 'Innovation' AND hcr.response_value > 3
        AND EXISTS (
          SELECT 1 FROM health_check_responses hcr2
          JOIN health_check_questions hcq2 ON hcr2.question_id = hcq2.id
          WHERE hcr2.user_id = p_user_id 
            AND hcq2.dimension = 'Efficiency' AND hcq2.category = 'Process' AND hcr2.response_value < 3
        );
    END IF;
    
    -- If conditions are met, return this archetype
    IF condition_met THEN
      archetype_name := rule_record.archetype_name;
      source_dimension := CASE 
        WHEN rule_record.archetype_name = 'Shifting the Burden' THEN 'Effectiveness'
        WHEN rule_record.archetype_name = 'Erosion of Goals' THEN 'Efficiency'
        WHEN rule_record.archetype_name = 'Fixes that Fail' THEN 'Excellence'
        ELSE 'Efficiency'
      END;
      insight := rule_record.description || ' - ' || rule_record.rule_description;
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for better query performance
CREATE INDEX idx_health_check_responses_user_id ON health_check_responses(user_id);
CREATE INDEX idx_health_check_responses_question_id ON health_check_responses(question_id);
CREATE INDEX idx_health_check_results_user_id ON health_check_results(user_id);
CREATE INDEX idx_archetypes_user_id ON archetypes(user_id);
CREATE INDEX idx_quick_wins_user_id ON quick_wins(user_id);
CREATE INDEX idx_quick_wins_status ON quick_wins(status);
CREATE INDEX idx_strategy_hypotheses_user_id ON strategy_hypotheses(user_id);
CREATE INDEX idx_strategic_decisions_user_id ON strategic_decisions(user_id);
CREATE INDEX idx_review_cycles_user_id ON review_cycles(user_id);
CREATE INDEX idx_feedback_entries_user_id ON feedback_entries(user_id);
CREATE INDEX idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX idx_system_checkpoints_user_id ON system_checkpoints(user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quick_wins table
CREATE TRIGGER update_quick_wins_last_updated
    BEFORE UPDATE ON quick_wins
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for strategy_hypotheses table
CREATE TRIGGER update_strategy_hypotheses_last_updated
    BEFORE UPDATE ON strategy_hypotheses
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for strategic_decisions table
CREATE TRIGGER update_strategic_decisions_last_updated
    BEFORE UPDATE ON strategic_decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for review_cycles table
CREATE TRIGGER update_review_cycles_last_updated
    BEFORE UPDATE ON review_cycles
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for feedback_entries table
CREATE TRIGGER update_feedback_entries_last_updated
    BEFORE UPDATE ON feedback_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for learning_insights table
CREATE TRIGGER update_learning_insights_last_updated
    BEFORE UPDATE ON learning_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- Trigger for system_checkpoints table
CREATE TRIGGER update_system_checkpoints_last_updated
    BEFORE UPDATE ON system_checkpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column(); 