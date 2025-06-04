import { createHealthCheckService } from '@/lib/services/health-check'
import { successResponse, errorResponse, validateRequiredFields } from '@/lib/utils/api'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const healthCheckService = await createHealthCheckService()
    const questions = await healthCheckService.getQuestions(id)
    return successResponse(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return errorResponse('Failed to fetch questions')
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const validationError = validateRequiredFields(body, ['question', 'category', 'order_index'])
    if (validationError) {
      return errorResponse(validationError)
    }

    const healthCheckService = await createHealthCheckService()
    const question = await healthCheckService.createQuestion({
      ...body,
      template_id: id,
    })

    return successResponse(question, 'Question created successfully')
  } catch (error) {
    console.error('Error creating question:', error)
    return errorResponse('Failed to create question')
  }
} 