import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

export type HealthCheckService = {
  getTemplates(organizationId: string): Promise<Database['public']['Tables']['health_check_templates']['Row'][]>
  getTemplate(id: string): Promise<Database['public']['Tables']['health_check_templates']['Row'] | null>
  createTemplate(data: Database['public']['Tables']['health_check_templates']['Insert']): Promise<Database['public']['Tables']['health_check_templates']['Row']>
  updateTemplate(id: string, data: Database['public']['Tables']['health_check_templates']['Update']): Promise<Database['public']['Tables']['health_check_templates']['Row']>
  deleteTemplate(id: string): Promise<void>
  getQuestions(templateId: string): Promise<Database['public']['Tables']['health_check_questions']['Row'][]>
  createQuestion(data: Database['public']['Tables']['health_check_questions']['Insert']): Promise<Database['public']['Tables']['health_check_questions']['Row']>
  updateQuestion(id: string, data: Database['public']['Tables']['health_check_questions']['Update']): Promise<Database['public']['Tables']['health_check_questions']['Row']>
  deleteQuestion(id: string): Promise<void>
  getAssessments(organizationId: string): Promise<Database['public']['Tables']['health_check_assessments']['Row'][]>
  getAssessment(id: string): Promise<Database['public']['Tables']['health_check_assessments']['Row'] | null>
  createAssessment(data: Database['public']['Tables']['health_check_assessments']['Insert']): Promise<Database['public']['Tables']['health_check_assessments']['Row']>
  updateAssessment(id: string, data: Database['public']['Tables']['health_check_assessments']['Update']): Promise<Database['public']['Tables']['health_check_assessments']['Row']>
  deleteAssessment(id: string): Promise<void>
  getResponses(assessmentId: string): Promise<Database['public']['Tables']['health_check_responses']['Row'][]>
  createResponse(data: Database['public']['Tables']['health_check_responses']['Insert']): Promise<Database['public']['Tables']['health_check_responses']['Row']>
  updateResponse(id: string, data: Database['public']['Tables']['health_check_responses']['Update']): Promise<Database['public']['Tables']['health_check_responses']['Row']>
}

export async function createHealthCheckService(): Promise<HealthCheckService> {
  const supabase = await createClient()

  return {
    async getTemplates(organizationId: string) {
      const { data, error } = await supabase
        .from('health_check_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async getTemplate(id: string) {
      const { data, error } = await supabase
        .from('health_check_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async createTemplate(data) {
      const { data: template, error } = await supabase
        .from('health_check_templates')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return template
    },

    async updateTemplate(id, data) {
      const { data: template, error } = await supabase
        .from('health_check_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return template
    },

    async deleteTemplate(id) {
      const { error } = await supabase
        .from('health_check_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    },

    async getQuestions(templateId: string) {
      const { data, error } = await supabase
        .from('health_check_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index', { ascending: true })

      if (error) throw error
      return data
    },

    async createQuestion(data) {
      const { data: question, error } = await supabase
        .from('health_check_questions')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return question
    },

    async updateQuestion(id, data) {
      const { data: question, error } = await supabase
        .from('health_check_questions')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return question
    },

    async deleteQuestion(id) {
      const { error } = await supabase
        .from('health_check_questions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },

    async getAssessments(organizationId: string) {
      const { data, error } = await supabase
        .from('health_check_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async getAssessment(id: string) {
      const { data, error } = await supabase
        .from('health_check_assessments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async createAssessment(data) {
      const { data: assessment, error } = await supabase
        .from('health_check_assessments')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return assessment
    },

    async updateAssessment(id, data) {
      const { data: assessment, error } = await supabase
        .from('health_check_assessments')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return assessment
    },

    async deleteAssessment(id) {
      const { error } = await supabase
        .from('health_check_assessments')
        .delete()
        .eq('id', id)

      if (error) throw error
    },

    async getResponses(assessmentId: string) {
      const { data, error } = await supabase
        .from('health_check_responses')
        .select('*')
        .eq('assessment_id', assessmentId)

      if (error) throw error
      return data
    },

    async createResponse(data) {
      const { data: response, error } = await supabase
        .from('health_check_responses')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return response
    },

    async updateResponse(id, data) {
      const { data: response, error } = await supabase
        .from('health_check_responses')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return response
    },
  }
} 