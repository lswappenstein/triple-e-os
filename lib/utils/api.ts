import { NextResponse } from 'next/server'

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    data,
    message,
  })
}

export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      error,
    },
    { status }
  )
}

export function unauthorizedResponse(): NextResponse<ApiResponse<never>> {
  return errorResponse('Unauthorized', 401)
}

export function notFoundResponse(resource: string): NextResponse<ApiResponse<never>> {
  return errorResponse(`${resource} not found`, 404)
}

export function validateRequiredFields(data: Record<string, any>, fields: string[]): string | null {
  const missingFields = fields.filter(field => !data[field])
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`
  }
  return null
} 