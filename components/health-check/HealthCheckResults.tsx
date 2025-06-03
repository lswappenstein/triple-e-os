import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { HealthCheckResult } from '@/types/health-check'

interface HealthCheckResultsProps {
  results: HealthCheckResult
}

export default function HealthCheckResults({ results }: HealthCheckResultsProps) {
  const dimensions = Object.keys(results.scores)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Health Check Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dimensions.map((dimension) => (
              <div key={dimension} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium capitalize">{dimension}</span>
                  <span className="text-sm text-gray-500">
                    {Math.round(results.scores[dimension])}%
                  </span>
                </div>
                <Progress value={results.scores[dimension]} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.responses.map((response) => (
              <div key={response.questionId} className="space-y-2">
                <p className="font-medium">{response.questionId}</p>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Score: {response.score}</span>
                  {response.comment && (
                    <span className="text-sm text-gray-500">{response.comment}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 