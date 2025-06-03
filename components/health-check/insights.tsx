import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Insight {
  id: number;
  insight_type: 'Quick Win' | 'Archetype Hint' | 'Strategy Suggestion';
  content: string;
  source_dimension: 'Efficiency' | 'Effectiveness' | 'Excellence';
}

interface InsightsProps {
  insights: Insight[];
}

export function Insights({ insights }: InsightsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Quick Win':
        return 'bg-green-100 text-green-800';
      case 'Archetype Hint':
        return 'bg-blue-100 text-blue-800';
      case 'Strategy Suggestion':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {insights.map((insight) => (
        <Card key={insight.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{insight.source_dimension}</CardTitle>
              <span className={`px-2 py-1 rounded-full text-sm ${getTypeColor(insight.insight_type)}`}>
                {insight.insight_type}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{insight.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 