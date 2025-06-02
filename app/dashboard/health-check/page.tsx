'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/auth-context'

interface Template {
  id: string
  organization_id: string
  name: string
  description: string | null
}

interface Question {
  id: string
  category: string
  order_index: number
}

const dimensions = [
  { id: 'purpose', name: 'Purpose & Vision', questions: [
    'Our organization has a clear and compelling purpose that guides decision-making.',
    'All team members understand how their work contributes to our purpose.',
    'Our vision for the future is well-defined and communicated.',
  ]},
  { id: 'processes', name: 'Processes & Systems', questions: [
    'Our core processes are well-documented and standardized.',
    'We regularly review and improve our processes.',
    'Our systems support efficient workflow and collaboration.',
  ]},
  { id: 'decisions', name: 'Decision Making', questions: [
    'Decision-making processes are clear and transparent.',
    'We make decisions based on data and evidence.',
    'Teams have appropriate autonomy in decision-making.',
  ]},
  { id: 'culture', name: 'Culture & People', questions: [
    'Our culture supports continuous learning and improvement.',
    'People feel empowered to suggest and implement changes.',
    'We have strong collaboration across teams and departments.',
  ]},
  { id: 'strategy', name: 'Strategy & Execution', questions: [
    'We have a clear strategy that guides our priorities.',
    'Our strategy is adaptable to changing conditions.',
    'We effectively execute on our strategic initiatives.',
  ]},
  { id: 'customers', name: 'Customer Focus', questions: [
    "We deeply understand our customers' needs.",
    'Customer feedback drives our improvements.',
    'Our solutions effectively address customer problems.',
  ]},
]

export default function HealthCheckPage() {
  const [currentDimension, setCurrentDimension] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [questionIds, setQuestionIds] = useState<Record<string, string>>({})
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const initializeTemplate = async () => {
      if (!user) return

      try {
        // First try to get or create the user's profile and organization
        let organizationId: string

        // Try to get existing profile
        const { data: existingProfile, error: profileQueryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // Create organization first
          const orgName = user.email ? user.email.split('@')[0] + "'s Organization" : 'My Organization'
          console.log('Creating new organization:', orgName)
          
          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: orgName
            })
            .select()
            .single()

          if (orgError) {
            console.error('Organization creation error:', orgError)
            throw new Error(`Failed to create organization: ${orgError.message}`)
          }

          if (!newOrg) {
            throw new Error('Organization creation returned no data')
          }

          console.log('Created organization:', newOrg)

          // Create profile
          const { data: newProfile, error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name,
              organization_id: newOrg.id
            })
            .select()
            .single()

          if (createProfileError) {
            console.error('Profile creation error:', createProfileError)
            throw new Error(`Failed to create user profile: ${createProfileError.message}`)
          }

          if (!newProfile) {
            throw new Error('Profile creation returned no data')
          }

          organizationId = newOrg.id
          console.log('Created new profile and organization:', { profileId: newProfile.id, orgId: newOrg.id })
        } else {
          organizationId = existingProfile.organization_id || user.id
          console.log('Using existing profile:', { profileId: existingProfile.id, orgId: organizationId })
        }

        // Check if default template exists
        const { data: existingTemplate, error: templateQueryError } = await supabase
          .from('health_check_templates')
          .select('*')
          .eq('organization_id', organizationId)
          .single()

        let finalTemplate: Template

        if (existingTemplate) {
          finalTemplate = existingTemplate
          console.log('Using existing template:', { templateId: finalTemplate.id })

          // Get existing questions to map IDs
          const { data: questions, error: questionsError } = await supabase
            .from('health_check_questions')
            .select('id, category, order_index')
            .eq('template_id', finalTemplate.id)

          if (questionsError) {
            console.error('Error fetching questions:', questionsError)
            throw new Error('Failed to fetch template questions')
          }

          if (questions) {
            const idMap = questions.reduce((acc: Record<string, string>, q: Question) => {
              const frontendId = `${q.category}_${q.order_index % 3}`
              acc[frontendId] = q.id
              return acc
            }, {})
            setQuestionIds(idMap)
          }
        } else {
          // Create new template
          const { data: newTemplate, error: createError } = await supabase
            .from('health_check_templates')
            .insert({
              organization_id: organizationId,
              name: 'Default Health Check Template',
              description: 'Organization health assessment across key dimensions'
            })
            .select()
            .single()

          if (createError || !newTemplate) {
            console.error('Template creation error:', createError)
            throw new Error('Failed to create new template')
          }

          finalTemplate = newTemplate
          console.log('Created new template:', { templateId: finalTemplate.id })

          // Create questions for each dimension
          const questionsToCreate = dimensions.flatMap((dim, dimIndex) =>
            dim.questions.map((question, qIndex) => ({
              template_id: finalTemplate.id,
              question,
              category: dim.id,
              order_index: dimIndex * 3 + qIndex
            }))
          )

          const { data: questions, error: questionsError } = await supabase
            .from('health_check_questions')
            .insert(questionsToCreate)
            .select('id, category, order_index')

          if (questionsError || !questions) {
            console.error('Questions creation error:', questionsError)
            throw new Error('Failed to create questions')
          }

          // Map frontend question IDs to database IDs
          const idMap = questions.reduce((acc: Record<string, string>, q: Question) => {
            const frontendId = `${q.category}_${q.order_index % 3}`
            acc[frontendId] = q.id
            return acc
          }, {})

          setQuestionIds(idMap)
          console.log('Created questions for template:', { 
            templateId: finalTemplate.id, 
            questionCount: questions.length 
          })
        }

        setTemplateId(finalTemplate.id)
      } catch (error) {
        console.error('Error initializing template:', error)
        alert('Failed to initialize assessment. Please try again.')
      }
    }

    initializeTemplate()
  }, [user])

  const handleResponse = (questionIndex: number, value: number) => {
    const frontendQuestionId = `${dimensions[currentDimension].id}_${questionIndex}`
    setResponses(prev => ({ ...prev, [frontendQuestionId]: value }))
  }

  const isCurrentDimensionComplete = () => {
    return dimensions[currentDimension].questions.every((_, index) => {
      const questionId = `${dimensions[currentDimension].id}_${index}`
      return responses[questionId] !== undefined
    })
  }

  const progress = Math.round((Object.keys(responses).length / (dimensions.length * 3)) * 100)

  const handleSubmit = async () => {
    if (!user || !templateId) return
    setIsSubmitting(true)

    try {
      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('health_check_assessments')
        .insert({
          organization_id: user.id,
          template_id: templateId,
          assessor_id: user.id,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (assessmentError) {
        console.error('Assessment creation error:', assessmentError)
        throw assessmentError
      }

      if (!assessment) {
        throw new Error('Failed to create assessment - no data returned')
      }

      // Insert responses using mapped question IDs
      const responsesData = Object.entries(responses).map(([frontendQuestionId, value]) => ({
        assessment_id: assessment.id,
        question_id: questionIds[frontendQuestionId],
        score: value,
        comment: null
      }))

      const { error: responsesError } = await supabase
        .from('health_check_responses')
        .insert(responsesData)

      if (responsesError) {
        console.error('Responses creation error:', responsesError)
        throw responsesError
      }

      // Redirect to results
      window.location.href = '/dashboard/health-check/results'
    } catch (error) {
      console.error('Error submitting health check:', error)
      alert('Failed to submit health check. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current dimension */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">{dimensions[currentDimension].name}</h2>
        
        <div className="space-y-8">
          {dimensions[currentDimension].questions.map((question, index) => (
            <div key={index} className="space-y-4">
              <p className="text-lg text-gray-700">{question}</p>
              <div className="flex items-center justify-between gap-4">
                {[1, 2, 3, 4, 5].map((value) => {
                  const questionId = `${dimensions[currentDimension].id}_${index}`
                  const isSelected = responses[questionId] === value
                  return (
                    <button
                      key={value}
                      onClick={() => handleResponse(index, value)}
                      className={`
                        w-full py-3 text-sm font-medium rounded-md
                        ${isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }
                      `}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentDimension(prev => prev - 1)}
            disabled={currentDimension === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentDimension < dimensions.length - 1 ? (
            <button
              onClick={() => setCurrentDimension(prev => prev + 1)}
              disabled={!isCurrentDimensionComplete()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isCurrentDimensionComplete() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </div>

      {/* Dimension navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {dimensions.map((dim, index) => (
          <button
            key={dim.id}
            onClick={() => setCurrentDimension(index)}
            className={`
              p-2 text-sm font-medium rounded-md text-center
              ${currentDimension === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }
            `}
          >
            {dim.name}
          </button>
        ))}
      </div>
    </div>
  )
} 