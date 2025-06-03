import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import type { Question, Response } from '@/types/health-check'

interface HealthCheckSurveyProps {
  questions: Question[]
  onSubmit: (responses: Response[]) => void
  loading: boolean
}

export default function HealthCheckSurvey({ questions, onSubmit, loading }: HealthCheckSurveyProps) {
  const [responses, setResponses] = useState<Record<string, Response>>({})

  const handleResponseChange = (questionId: string, score: number, comment?: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        score,
        ...(comment && { comment })
      }
    }))
  }

  const handleSubmit = () => {
    const allResponses = Object.values(responses)
    
    if (allResponses.length !== questions.length) {
      console.log('Not all questions have been answered')
      return
    }

    onSubmit(allResponses)
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No questions available at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Check Survey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="space-y-4">
              <div>
                <h3 className="font-medium">{question.text}</h3>
                {question.tooltip && (
                  <p className="text-sm text-gray-500">{question.tooltip}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Slider
                  value={[responses[question.id]?.score || 0]}
                  onValueChange={([value]) => handleResponseChange(question.id, value)}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Not at all</span>
                  <span>Somewhat</span>
                  <span>Very much</span>
                </div>
              </div>

              <Textarea
                placeholder="Add a comment (optional)"
                value={responses[question.id]?.comment || ''}
                onChange={(e) => handleResponseChange(question.id, responses[question.id]?.score || 0, e.target.value)}
                className="w-full"
              />
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={loading || Object.keys(responses).length !== questions.length}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Health Check'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 