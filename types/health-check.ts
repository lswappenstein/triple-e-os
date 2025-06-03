export interface Question {
  id: string;
  dimension: string;
  category: string;
  text: string;
  tooltip?: string;
}

export interface Response {
  questionId: string;
  score: number;
  comment?: string;
}

export interface HealthCheckResult {
  id: string;
  user_id: string;
  responses: Response[];
  scores: {
    [key: string]: number;
  };
  created_at: string;
} 