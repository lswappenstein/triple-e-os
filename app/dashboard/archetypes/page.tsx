"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, AlertTriangleIcon } from 'lucide-react'

interface Archetype {
  id: string;
  archetype_name: string;
  source_dimension: string;
  insight: string;
  created_at: string;
}

export default function ArchetypesPage() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchetypeData();
  }, []);

  const fetchArchetypeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/archetypes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch archetype data');
      }
      
      const data = await response.json();
      setArchetypes(data.archetypes || []);
    } catch (err) {
      console.error('Error fetching archetype data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDimensionColor = (dimension: string) => {
    switch (dimension) {
      case 'Efficiency': return 'bg-blue-100 text-blue-800';
      case 'Effectiveness': return 'bg-green-100 text-green-800';
      case 'Excellence': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your archetypes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchArchetypeData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Archetypes</h1>
          <p className="mt-2 text-gray-600">
            Based on your health check results, we've identified patterns in your organization.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Understanding System Archetypes</AlertTitle>
          <AlertDescription>
            System archetypes are recurring patterns of behavior that often underlie organizational problems. 
            Identifying these patterns helps you understand the root causes and find leverage points for improvement.
            <br />
            <br />
            <strong>Next Steps:</strong> View your <a href="/dashboard/quick-wins" className="text-blue-600 hover:underline">Quick Wins</a> to see recommended actions based on detected patterns.
          </AlertDescription>
        </Alert>

        {/* Detected Archetypes */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Detected Archetypes</h2>
          {archetypes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Archetypes Detected Yet</h3>
                <p className="text-gray-500 mb-4">
                  Complete a health check assessment to discover organizational patterns and get personalized recommendations.
                </p>
                <Button asChild>
                  <a href="/dashboard/health-check">Take Health Check Assessment</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {archetypes.map((archetype) => (
                <Card key={archetype.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {archetype.archetype_name}
                      </CardTitle>
                      <Badge className={getDimensionColor(archetype.source_dimension)}>
                        {archetype.source_dimension}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600 mb-4">
                      {archetype.insight}
                    </CardDescription>
                    <div className="text-xs text-gray-400">
                      Detected on {new Date(archetype.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Items Callout */}
        {archetypes.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start">
                <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Take Action?</h3>
                  <p className="text-blue-700 mb-4">
                    We've detected {archetypes.length} system archetype{archetypes.length > 1 ? 's' : ''} in your organization. 
                    Based on these patterns, we've generated personalized quick wins to help you improve.
                  </p>
                  <Button asChild variant="default">
                    <a href="/dashboard/quick-wins">View Your Quick Wins</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 