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
      health_check_questions: {
        Row: {
          id: string
          dimension: string
          category: string
          text: string
          tooltip: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dimension: string
          category: string
          text: string
          tooltip?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dimension?: string
          category?: string
          text?: string
          tooltip?: string | null
          created_at?: string
        }
      }
      health_check_responses: {
        Row: {
          id: string
          user_id: string
          responses: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          responses: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          responses?: Json
          created_at?: string
        }
      }
      health_check_results: {
        Row: {
          id: string
          user_id: string
          response_id: string
          scores: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          response_id: string
          scores: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          response_id?: string
          scores?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 