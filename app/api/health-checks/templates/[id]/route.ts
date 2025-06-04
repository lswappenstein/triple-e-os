import { createHealthCheckService } from '@/lib/services/health-check'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/utils/api'
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
    const template = await healthCheckService.getTemplate(id)
    
    if (!template) {
      return notFoundResponse('Template')
    }

    return successResponse(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return errorResponse('Failed to fetch template')
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const healthCheckService = await createHealthCheckService()
    const template = await healthCheckService.updateTemplate(id, body)

    return successResponse(template, 'Template updated successfully')
  } catch (error) {
    console.error('Error updating template:', error)
    return errorResponse('Failed to update template')
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const healthCheckService = await createHealthCheckService()
    await healthCheckService.deleteTemplate(id)

    return successResponse(null, 'Template deleted successfully')
  } catch (error) {
    console.error('Error deleting template:', error)
    return errorResponse('Failed to delete template')
  }
} 