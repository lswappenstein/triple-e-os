'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TargetIcon, 
  TrendingUpIcon, 
  AwardIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  InfoIcon,
  BookOpenIcon,
  BarChart3Icon,
  MessageSquareIcon
} from "lucide-react"

interface HealthCheckResponse {
  id: string
  question_id: number
  response_value: number
  comment: string | null
  dimension: string
  created_at: string
}

interface Question {
  id: number
  text: string
  dimension: string
  category: string
  tooltip: string
}

interface DimensionScore {
  dimension: string
  average_score: number
  color: string
  question_count: number
  responses: HealthCheckResponse[]
}

export default function HealthCheckResultsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responses, setResponses] = useState<HealthCheckResponse[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [dimensionScores, setDimensionScores] = useState<DimensionScore[]>([])
  const [showQuestions, setShowQuestions] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch user's latest responses
        const { data: responseData, error: responseError } = await supabase
          .from('health_check_responses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (responseError) throw responseError

        // Group responses by question_id to get only the latest response for each question
        const latestResponses = responseData?.reduce((acc: Record<number, HealthCheckResponse>, response) => {
          if (!acc[response.question_id] || new Date(response.created_at) > new Date(acc[response.question_id].created_at)) {
            acc[response.question_id] = response
          }
          return acc
        }, {})

        const uniqueResponses = Object.values(latestResponses || {})

        if (!uniqueResponses.length) {
          setError('No health check responses found. Please complete a health check first.')
          return
        }

        setResponses(uniqueResponses)

        // Fetch questions
        const { data: questionData, error: questionError } = await supabase
          .from('health_check_questions')
          .select('*')
          .order('id')

        if (questionError) throw questionError
        setQuestions(questionData || [])

        // Calculate dimension scores
        const dimensions = ['Efficiency', 'Effectiveness', 'Excellence']
        const scores = dimensions.map(dimension => {
          const dimensionResponses = uniqueResponses.filter(r => r.dimension === dimension)
          const average = dimensionResponses.reduce((sum, r) => sum + r.response_value, 0) / dimensionResponses.length
          const color = average >= 4 ? 'Green' : average >= 3 ? 'Yellow' : 'Red'
          
          return {
            dimension,
            average_score: average,
            color,
            question_count: dimensionResponses.length,
            responses: dimensionResponses
          }
        })

        setDimensionScores(scores)
      } catch (err) {
        console.error('Error fetching results:', err)
        setError('Failed to load health check results. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [router])

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'Efficiency': return <TargetIcon className="h-5 w-5" />
      case 'Effectiveness': return <TrendingUpIcon className="h-5 w-5" />
      case 'Excellence': return <AwardIcon className="h-5 w-5" />
      default: return <TargetIcon className="h-5 w-5" />
    }
  }

  const getDimensionColor = (dimension: string) => {
    switch (dimension) {
      case 'Efficiency': return 'border-l-blue-500 bg-blue-50'
      case 'Effectiveness': return 'border-l-green-500 bg-green-50'
      case 'Excellence': return 'border-l-purple-500 bg-purple-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800'
    if (score >= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent'
    if (score >= 4) return 'Good'
    if (score >= 3) return 'Satisfactory'
    if (score >= 2) return 'Needs Improvement'
    return 'Critical'
  }

  const getQuestion = (questionId: number) => {
    return questions.find(q => q.id === questionId)
  }

  const overallScore = responses.length > 0 
    ? responses.reduce((sum, r) => sum + r.response_value, 0) / responses.length 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <InfoIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => router.push('/dashboard/health-check')}>
              Take Health Check
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Health Check Results</h1>
            <p className="text-gray-600">
              Assessment completed on {new Date(responses[0]?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{overallScore.toFixed(1)}/5</div>
            <div className="text-sm text-gray-600">Overall Score</div>
            <Badge className={getScoreColor(overallScore)}>
              {getScoreLabel(overallScore)}
            </Badge>
          </div>
        </div>

        {/* Overall Summary */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <CheckCircleIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Great job completing your health check!</strong> You answered {responses.length} questions 
            across all three dimensions. Review your detailed results below and explore recommended actions 
            to improve your organizational health.
          </AlertDescription>
        </Alert>

        {/* Dimension Scores */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {dimensionScores.map((score) => (
            <Card key={score.dimension} className={`border-l-4 ${getDimensionColor(score.dimension)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getDimensionIcon(score.dimension)}
                    <span className="ml-2">{score.dimension}</span>
                  </div>
                  <Badge className={getScoreColor(score.average_score)}>
                    {score.average_score.toFixed(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{getScoreLabel(score.average_score)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{score.question_count} answered</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        score.average_score >= 4 ? 'bg-green-500' : 
                        score.average_score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(score.average_score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => setShowQuestions(!showQuestions)}
            variant="outline"
            className="flex items-center"
          >
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            {showQuestions ? 'Hide' : 'View'} Your Responses
          </Button>
          <Button 
            onClick={() => router.push('/dashboard/archetypes')}
            className="flex items-center"
          >
            <BookOpenIcon className="h-4 w-4 mr-2" />
            View System Insights
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex items-center"
          >
            <BarChart3Icon className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Detailed Question Responses */}
        {showQuestions && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Detailed Responses</h2>
            
            {dimensionScores.map((dimensionScore) => (
              <Card key={dimensionScore.dimension} className="overflow-hidden">
                <CardHeader className={`${getDimensionColor(dimensionScore.dimension)} border-l-4`}>
                  <CardTitle className="flex items-center">
                    {getDimensionIcon(dimensionScore.dimension)}
                    <span className="ml-2">{dimensionScore.dimension}</span>
                    <Badge className={`ml-auto ${getScoreColor(dimensionScore.average_score)}`}>
                      Avg: {dimensionScore.average_score.toFixed(1)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {dimensionScore.responses
                      .sort((a, b) => a.question_id - b.question_id)
                      .map((response) => {
                        const question = getQuestion(response.question_id)
                        return (
                          <div 
                            key={response.id} 
                            className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 pr-4">
                                <h4 className="font-medium text-gray-900 mb-1">
                                  Q{response.question_id}: {question?.text}
                                </h4>
                                {question?.category && (
                                  <Badge variant="outline" className="text-xs mb-2">
                                    {question.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  {response.response_value}/5
                                </div>
                                                                 <Badge className={getScoreColor(response.response_value)}>
                                   {getScoreLabel(response.response_value)}
                                 </Badge>
                              </div>
                            </div>
                            
                            {response.comment && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-700 mb-1">Your Comment:</div>
                                <div className="text-sm text-gray-600 italic">"{response.comment}"</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Next Steps & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dimensionScores
                .filter(d => d.average_score < 4)
                .sort((a, b) => a.average_score - b.average_score)
                .map(dimension => (
                  <div key={dimension.dimension} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="flex items-center text-lg font-medium text-gray-900 mb-2">
                      {getDimensionIcon(dimension.dimension)}
                      <span className="ml-2">{dimension.dimension} Improvement</span>
                      <Badge className={`ml-2 ${getScoreColor(dimension.average_score)}`}>
                        {dimension.average_score.toFixed(1)}/5
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {dimension.dimension === 'Efficiency' && 
                        'Focus on streamlining processes, optimizing resource allocation, and eliminating waste to improve operational efficiency.'}
                      {dimension.dimension === 'Effectiveness' && 
                        'Enhance goal setting, strategic alignment, and decision-making processes to achieve better outcomes.'}
                      {dimension.dimension === 'Excellence' && 
                        'Cultivate innovation, continuous learning, and a culture of excellence to drive long-term growth.'}
                    </p>
                    <div className="flex gap-2">
                      <Button  onClick={() => router.push('/dashboard/quick-wins')}>
                        View Quick Wins
                      </Button>
                      <Button  variant="outline" onClick={() => router.push('/dashboard/learning-center')}>
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}
              
              {dimensionScores.every(d => d.average_score >= 4) && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-green-900 mb-2">Excellent Performance!</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Your organization is performing well across all dimensions. Consider exploring advanced 
                    strategies to maintain and enhance this excellence.
                  </p>
                  <Button  onClick={() => router.push('/dashboard/strategy-map')}>
                    Explore Advanced Strategies
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 