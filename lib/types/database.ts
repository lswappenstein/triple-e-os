export type AssessmentStatus = 'draft' | 'submitted' | 'reviewed'
export type ArchetypeCategory = 'behavioral' | 'structural' | 'transformational'
export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'implemented'
export type ReviewType = 'weekly' | 'monthly' | 'quarterly' | 'annual'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  organization_id: string | null
  role: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface HealthCheckTemplate {
  id: string
  organization_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface HealthCheckQuestion {
  id: string
  template_id: string
  question: string
  category: string
  weight: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface HealthCheckAssessment {
  id: string
  template_id: string
  organization_id: string
  assessor_id: string
  status: AssessmentStatus
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface HealthCheckResponse {
  id: string
  assessment_id: string
  question_id: string
  score: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface SystemArchetype {
  id: string
  organization_id: string
  name: string
  description: string | null
  category: ArchetypeCategory
  identified_by: string | null
  identified_at: string
  status: string
  created_at: string
  updated_at: string
}

export interface QuickWin {
  id: string
  organization_id: string
  title: string
  description: string | null
  impact_score: number
  effort_score: number
  status: string
  assigned_to: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface StrategyMapNode {
  id: string
  organization_id: string
  title: string
  description: string | null
  perspective: string
  parent_id: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface Decision {
  id: string
  organization_id: string
  title: string
  description: string | null
  status: DecisionStatus
  decided_by: string | null
  decided_at: string | null
  implementation_date: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  organization_id: string
  type: ReviewType
  start_date: string
  end_date: string
  summary: string | null
  conducted_by: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface ReviewItem {
  id: string
  review_id: string
  item_type: string
  item_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      health_check_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      health_check_questions: {
        Row: {
          id: string
          template_id: string
          question: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          question: string
          description?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          question?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      health_check_assessments: {
        Row: {
          id: string
          template_id: string
          organization_id: string
          created_by: string | null
          status: string
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          organization_id: string
          created_by?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          organization_id?: string
          created_by?: string | null
          status?: string
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_check_responses: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          response_value: number
          comment: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_id: string
          response_value: number
          comment?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_id?: string
          response_value?: number
          comment?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      system_archetypes: {
        Row: {
          id: string
          name: string
          description: string | null
          organization_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          organization_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          organization_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quick_wins: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          organization_id: string
          created_by: string | null
          assigned_to: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          organization_id: string
          created_by?: string | null
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          organization_id?: string
          created_by?: string | null
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      strategy_map_nodes: {
        Row: {
          id: string
          title: string
          description: string | null
          perspective: string
          organization_id: string
          parent_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          perspective: string
          organization_id: string
          parent_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          perspective?: string
          organization_id?: string
          parent_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      decisions: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          organization_id: string
          created_by: string | null
          decided_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          organization_id: string
          created_by?: string | null
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          organization_id?: string
          created_by?: string | null
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      decision_reviews: {
        Row: {
          id: string
          decision_id: string
          review_text: string
          effectiveness_rating: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          decision_id: string
          review_text: string
          effectiveness_rating?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          decision_id?: string
          review_text?: string
          effectiveness_rating?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>
      }
      review_items: {
        Row: ReviewItem
        Insert: Omit<ReviewItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ReviewItem, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assessment_status: AssessmentStatus
      archetype_category: ArchetypeCategory
      decision_status: DecisionStatus
      review_type: ReviewType
    }
  }
} 