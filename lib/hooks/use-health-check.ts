import useSWR from 'swr'
import { Database } from '@/lib/types/database'
import { ApiResponse } from '@/lib/utils/api'

type Template = Database['public']['Tables']['health_check_templates']['Row']
type Question = Database['public']['Tables']['health_check_questions']['Row']

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const data: ApiResponse<T> = await response.json()
  if (data.error) throw new Error(data.error)
  return data.data as T
}

async function poster<T>(url: string, data: any): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const result: ApiResponse<T> = await response.json()
  if (result.error) throw new Error(result.error)
  return result.data as T
}

async function putter<T>(url: string, data: any): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const result: ApiResponse<T> = await response.json()
  if (result.error) throw new Error(result.error)
  return result.data as T
}

async function deleter(url: string): Promise<void> {
  const response = await fetch(url, {
    method: 'DELETE',
  })
  const result: ApiResponse<null> = await response.json()
  if (result.error) throw new Error(result.error)
}

export function useTemplates() {
  const { data, error, mutate } = useSWR<Template[]>(
    '/api/health-checks/templates',
    fetcher
  )

  return {
    templates: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export function useTemplate(id: string) {
  const { data, error, mutate } = useSWR<Template>(
    `/api/health-checks/templates/${id}`,
    fetcher
  )

  return {
    template: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export function useTemplateQuestions(templateId: string) {
  const { data, error, mutate } = useSWR<Question[]>(
    `/api/health-checks/templates/${templateId}/questions`,
    fetcher
  )

  return {
    questions: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export const healthCheckApi = {
  async createTemplate(data: Partial<Template>): Promise<Template> {
    return poster<Template>('/api/health-checks/templates', data)
  },

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    return putter<Template>(`/api/health-checks/templates/${id}`, data)
  },

  async deleteTemplate(id: string): Promise<void> {
    return deleter(`/api/health-checks/templates/${id}`)
  },

  async createQuestion(templateId: string, data: Partial<Question>): Promise<Question> {
    return poster<Question>(`/api/health-checks/templates/${templateId}/questions`, data)
  },

  async updateQuestion(templateId: string, questionId: string, data: Partial<Question>): Promise<Question> {
    return putter<Question>(`/api/health-checks/templates/${templateId}/questions/${questionId}`, data)
  },

  async deleteQuestion(templateId: string, questionId: string): Promise<void> {
    return deleter(`/api/health-checks/templates/${templateId}/questions/${questionId}`)
  },
} 