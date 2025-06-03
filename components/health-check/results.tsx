import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Result {
  dimension: 'Efficiency' | 'Effectiveness' | 'Excellence';
  average_score: number;
  color: 'green' | 'yellow' | 'red';
  top_insights: string[];
}

interface ResultsProps {
  results: Result[];
}

export function Results({ results }: ResultsProps) {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <Card key={result.dimension}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{result.dimension}</span>
              <span className={`px-2 py-1 rounded-full text-white ${getColorClass(result.color)}`}>
                {result.average_score.toFixed(1)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={result.average_score * 20} className="h-2" />
              <div className="space-y-2">
                <h4 className="font-medium">Top Insights:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.top_insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 