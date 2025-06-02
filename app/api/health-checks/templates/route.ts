import { createHealthCheckService } from '@/lib/services/health-check'
import { successResponse, errorResponse, validateRequiredFields } from '@/lib/utils/api'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('No organization found', 404)
    }

    const healthCheckService = await createHealthCheckService()
    const templates = await healthCheckService.getTemplates(profile.organization_id)
    return successResponse(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return errorResponse('Failed to fetch templates')
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errorResponse('Unauthorized', 401)

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('No organization found', 404)
    }

    const body = await request.json()
    const validationError = validateRequiredFields(body, ['name'])
    if (validationError) {
      return errorResponse(validationError)
    }

    const healthCheckService = await createHealthCheckService()
    const template = await healthCheckService.createTemplate({
      ...body,
      organization_id: profile.organization_id,
    })

    return successResponse(template, 'Template created successfully')
  } catch (error) {
    console.error('Error creating template:', error)
    return errorResponse('Failed to create template')
  }
} 