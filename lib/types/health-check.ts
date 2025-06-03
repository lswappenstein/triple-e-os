export type Dimension = 'Efficiency' | 'Effectiveness' | 'Excellence';
export type Color = 'green' | 'yellow' | 'red';
export type InsightType = 'Quick Win' | 'Archetype Hint' | 'Strategy Suggestion';

export interface HealthCheckQuestion {
  id: string;
  dimension: Dimension;
  category: string;
  text: string;
  tooltip: string;
  created_at: string;
}

export interface HealthCheckResponse {
  id: string;
  org_id: string;
  user_id: string;
  question_id: string;
  response_value: number;
  comment?: string;
  created_at: string;
}

export interface HealthCheckResult {
  id: string;
  org_id: string;
  dimension: Dimension;
  average_score: number;
  color: Color;
  top_insights: string[];
  created_at: string;
}

export interface HealthCheckInsight {
  id: string;
  org_id: string;
  insight_type: InsightType;
  content: string;
  source_dimension: Dimension;
  created_at: string;
}

export interface HealthCheckSummary {
  results: HealthCheckResult[];
  insights: HealthCheckInsight[];
  global_score: number;
  global_color: Color;
} 