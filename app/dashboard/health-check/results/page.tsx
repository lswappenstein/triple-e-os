'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/auth-context'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const dimensions = [
  { id: 'purpose', name: 'Purpose & Vision' },
  { id: 'processes', name: 'Processes & Systems' },
  { id: 'decisions', name: 'Decision Making' },
  { id: 'culture', name: 'Culture & People' },
  { id: 'strategy', name: 'Strategy & Execution' },
  { id: 'customers', name: 'Customer Focus' },
]

interface Assessment {
  id: string
  created_at: string
  responses: Record<string, number>
}

export default function ResultsPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return

      try {
        // Get latest assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('health_check_assessments')
          .select('*')
          .eq('organization_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (assessmentError) throw assessmentError

        // Get responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('health_check_responses')
          .select('*')
          .eq('assessment_id', assessmentData.id)

        if (responsesError) throw responsesError

        // Process responses
        const responses = responsesData.reduce((acc: Record<string, number>, response) => {
          acc[response.question_id] = response.response
          return acc
        }, {})

        setAssessment({
          id: assessmentData.id,
          created_at: assessmentData.created_at,
          responses
        })
      } catch (error) {
        console.error('Error fetching results:', error)
        alert('Failed to load results. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading results...</div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No assessment found. Please complete the health check first.</div>
      </div>
    )
  }

  // Calculate dimension averages
  const dimensionScores = dimensions.map(dim => {
    const dimensionResponses = Object.entries(assessment.responses)
      .filter(([key]) => key.startsWith(dim.id))
      .map(([, value]) => value)

    return {
      ...dim,
      score: dimensionResponses.reduce((sum, val) => sum + val, 0) / dimensionResponses.length
    }
  })

  const chartData = {
    labels: dimensions.map(d => d.name),
    datasets: [
      {
        label: 'Organization Health',
        data: dimensionScores.map(d => d.score),
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 5
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800'
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Check Results</h1>
        <p className="mt-2 text-sm text-gray-500">
          Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Health Profile</h2>
          <div className="aspect-square">
            <Radar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Dimension Scores</h2>
          <div className="space-y-4">
            {dimensionScores.map((dimension) => (
              <div key={dimension.id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{dimension.name}</span>
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getScoreColor(dimension.score)}
                `}>
                  {dimension.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Key Recommendations</h2>
          <div className="space-y-4">
            {dimensionScores
              .filter(d => d.score < 4)
              .sort((a, b) => a.score - b.score)
              .map(dimension => (
                <div key={dimension.id} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {dimension.name} ({dimension.score.toFixed(1)}/5)
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dimension.score < 2.5
                      ? `Critical attention needed in ${dimension.name.toLowerCase()}. Consider immediate actions to improve this area.`
                      : `Room for improvement in ${dimension.name.toLowerCase()}. Focus on incremental enhancements.`
                    }
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
} 