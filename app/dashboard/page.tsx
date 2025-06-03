'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  MinusIcon,
  TargetIcon,
  BrainIcon,
  ZapIcon,
  RefreshCwIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  ShareIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  AwardIcon,
  ChevronRightIcon,
  BarChart3Icon,
  Users2Icon,
  MapIcon
} from 'lucide-react'

interface DashboardData {
  tripleEStatus: {
    efficiency: { score: number; color: string };
    effectiveness: { score: number; color: string };
    excellence: { score: number; color: string };
    currentPhase: string;
    lastUpdated: string;
  };
  strategicDecisions: any;
  healthCheckSummary: Array<{
    dimension: string;
    currentScore: number;
    trend: 'up' | 'down' | 'stable';
    color: string;
    lastUpdated: string;
  }>;
  topArchetypes: Array<{
    archetype_name: string;
    source_dimension: string;
    insight: string;
    description: string;
    symptoms: string[];
    leveragePoints: string[];
  }>;
  quickWinsProgress: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
    recentCompletions: number;
  };
  strategyMapHighlights: Array<{
    challenge_area: string;
    hypothesis: string;
    status: string;
    priority_level: string;
    last_updated: string;
  }>;
  reviewLoopPulse: {
    loopActive: boolean;
    reflectionRate: number;
    newInsightsThisCycle: number;
    daysUntilReview: number | null;
    currentCycle: any;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    status: string;
    date: string;
  }>;
  callToAction: {
    type: string;
    message: string;
    action: string;
    url: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to load dashboard data')
      
      const data = await response.json()
      setDashboardData(data.dashboard)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Efficiency': return 'text-blue-600 bg-blue-50'
      case 'Effectiveness': return 'text-green-600 bg-green-50'
      case 'Excellence': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (color: string) => {
    switch (color) {
      case 'Green': return 'text-green-600'
      case 'Yellow': return 'text-yellow-600'
      case 'Red': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDownIcon className="h-4 w-4 text-red-600" />
      default: return <MinusIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const exportDashboard = () => {
    // Implement PDF export functionality
    window.print()
  }

  const shareDashboard = () => {
    // Implement sharing functionality
    navigator.share?.({
      title: 'Triple eOS Dashboard',
      text: 'Strategic progress overview',
      url: window.location.href
    })
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading dashboard: {error}</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!dashboardData) return null

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Strategic Dashboard</h1>
          <p className="text-lg text-gray-600 mt-1">
            Your strategic mirror - showing what you said, what's happening, what you've learned
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={exportDashboard}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={shareDashboard}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={loadDashboardData}
            size="sm"
            className="flex items-center"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Call to Action Strip */}
      <div className={`p-4 rounded-lg border-l-4 ${
        dashboardData.callToAction.type === 'health_check' ? 'border-blue-500 bg-blue-50' :
        dashboardData.callToAction.type === 'efficiency' ? 'border-blue-500 bg-blue-50' :
        dashboardData.callToAction.type === 'effectiveness' ? 'border-green-500 bg-green-50' :
        dashboardData.callToAction.type === 'excellence' ? 'border-purple-500 bg-purple-50' :
        'border-gray-500 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{dashboardData.callToAction.message}</p>
          </div>
          <Button
            asChild
            className={`${
              dashboardData.callToAction.type === 'health_check' ? 'bg-blue-600 hover:bg-blue-700' :
              dashboardData.callToAction.type === 'efficiency' ? 'bg-blue-600 hover:bg-blue-700' :
              dashboardData.callToAction.type === 'effectiveness' ? 'bg-green-600 hover:bg-green-700' :
              dashboardData.callToAction.type === 'excellence' ? 'bg-purple-600 hover:bg-purple-700' :
              'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <a href={dashboardData.callToAction.url} className="flex items-center">
              {dashboardData.callToAction.action}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>

      {/* 1. Triple E Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TargetIcon className="h-6 w-6 mr-3 text-blue-600" />
            Triple E Status Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* Efficiency */}
            <div className="text-center">
              <div className="mb-4">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getScoreColor(dashboardData.tripleEStatus.efficiency.color)}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={`${dashboardData.tripleEStatus.efficiency.score * 20}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{Math.round(dashboardData.tripleEStatus.efficiency.score * 20)}%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-600">Efficiency</h3>
                <p className="text-sm text-gray-600">Foundation & Stability</p>
              </div>
            </div>

            {/* Effectiveness */}
            <div className="text-center">
              <div className="mb-4">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getScoreColor(dashboardData.tripleEStatus.effectiveness.color)}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={`${dashboardData.tripleEStatus.effectiveness.score * 20}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{Math.round(dashboardData.tripleEStatus.effectiveness.score * 20)}%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-600">Effectiveness</h3>
                <p className="text-sm text-gray-600">Strategic Choices</p>
              </div>
            </div>

            {/* Excellence */}
            <div className="text-center">
              <div className="mb-4">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getScoreColor(dashboardData.tripleEStatus.excellence.color)}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={`${dashboardData.tripleEStatus.excellence.score * 20}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{Math.round(dashboardData.tripleEStatus.excellence.score * 20)}%</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-purple-600">Excellence</h3>
                <p className="text-sm text-gray-600">Systemic Learning</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Badge className={`px-4 py-2 text-sm font-medium ${getPhaseColor(dashboardData.tripleEStatus.currentPhase)}`}>
              Current Phase: {dashboardData.tripleEStatus.currentPhase}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 2. Active Strategic Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MapIcon className="h-5 w-5 mr-2" />
                Strategic Decisions
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a href="/dashboard/decisions" className="flex items-center">
                  View All <ChevronRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.strategicDecisions ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Winning Aspiration:</span>
                    <p className="text-gray-900 mt-1">{dashboardData.strategicDecisions.winning_aspiration || 'Not defined'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Where to Play:</span>
                    <p className="text-gray-900 mt-1">{dashboardData.strategicDecisions.where_to_play || 'Not defined'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">How to Win:</span>
                    <p className="text-gray-900 mt-1">{dashboardData.strategicDecisions.how_to_win || 'Not defined'}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <Badge variant="outline" className="text-green-600">
                    {dashboardData.strategicDecisions.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No strategic decisions yet</p>
                <Button asChild>
                  <a href="/dashboard/decisions">Create Strategy Cascade</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Health Check Summary & Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2" />
                Health Check Summary
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a href="/dashboard/health-check" className="flex items-center">
                  View Report <ChevronRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.healthCheckSummary && dashboardData.healthCheckSummary.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.healthCheckSummary.map((dimension) => (
                  <div key={dimension.dimension} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{dimension.dimension}</span>
                      {getTrendIcon(dimension.trend)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getScoreColor(dimension.color)}`}>
                        {Math.round(dimension.currentScore * 20)}%
                      </span>
                      <div className={`w-3 h-3 rounded-full ${
                        dimension.color === 'Green' ? 'bg-green-500' :
                        dimension.color === 'Yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t text-xs text-gray-500">
                  Last updated: {new Date(dashboardData.healthCheckSummary[0].lastUpdated).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No health check data</p>
                <Button asChild>
                  <a href="/dashboard/health-check">Take Health Check</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Continue with remaining sections... */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 4. Top Systems Archetypes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BrainIcon className="h-5 w-5 mr-2" />
                Systems Archetypes
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a href="/dashboard/archetypes" className="flex items-center">
                  View All <ChevronRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.topArchetypes.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topArchetypes.slice(0, 2).map((archetype, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{archetype.archetype_name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {archetype.source_dimension}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{archetype.description}</p>
                    <div className="text-xs">
                      <span className="font-medium text-gray-700">Key Leverage Points:</span>
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        {archetype.leveragePoints?.slice(0, 2).map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BrainIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No archetypes detected yet</p>
                <p className="text-xs text-gray-400">Complete your health check to detect system patterns</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Quick Wins Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ZapIcon className="h-5 w-5 mr-2" />
                Quick Wins Progress
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a href="/dashboard/quick-wins" className="flex items-center">
                  View All <ChevronRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.quickWinsProgress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{dashboardData.quickWinsProgress.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.quickWinsProgress.inProgress}</div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">{dashboardData.quickWinsProgress.notStarted}</div>
                    <div className="text-xs text-gray-600">To Do</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span className="font-medium">{dashboardData.quickWinsProgress.completionRate}%</span>
                  </div>
                  <Progress value={dashboardData.quickWinsProgress.completionRate} className="h-2" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{dashboardData.quickWinsProgress.recentCompletions}</span> completed this cycle
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ZapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No quick wins yet</p>
                <Button asChild>
                  <a href="/dashboard/quick-wins">Create Quick Wins</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Continue with remaining sections... */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 6. Strategy Map Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MapIcon className="h-5 w-5 mr-2" />
                Strategy Map Highlights
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a href="/dashboard/strategy-map" className="flex items-center">
                  View All <ChevronRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.strategyMapHighlights.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.strategyMapHighlights.map((hypothesis, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{hypothesis.challenge_area}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={hypothesis.status === 'Validated' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {hypothesis.status}
                        </Badge>
                        <Badge 
                          variant={
                            hypothesis.priority_level === 'High' ? 'destructive' :
                            hypothesis.priority_level === 'Medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {hypothesis.priority_level}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{hypothesis.hypothesis}</p>
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(hypothesis.last_updated).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No strategy hypotheses yet</p>
                <Button asChild>
                  <a href="/dashboard/strategy-map">Create Strategy Map</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7. Review Loop Pulse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <RefreshCwIcon className="h-5 w-5 mr-2" />
                Review Loop Pulse
              </span>
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <a href="/dashboard/review" className="flex items-center">
                  View Details <ChevronRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Loop Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {dashboardData.reviewLoopPulse.loopActive ? (
                    <PlayIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <PauseIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="font-medium">
                    Loop {dashboardData.reviewLoopPulse.loopActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Badge 
                  variant={dashboardData.reviewLoopPulse.loopActive ? 'default' : 'secondary'}
                >
                  {dashboardData.reviewLoopPulse.loopActive ? 'Running' : 'Paused'}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.reviewLoopPulse.reflectionRate}%
                  </div>
                  <div className="text-xs text-gray-600">Reflection Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.reviewLoopPulse.newInsightsThisCycle}
                  </div>
                  <div className="text-xs text-gray-600">New Insights</div>
                </div>
              </div>

              {/* Next Review Countdown */}
              {dashboardData.reviewLoopPulse.daysUntilReview !== null && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Next Review in {dashboardData.reviewLoopPulse.daysUntilReview} days
                    </span>
                  </div>
                </div>
              )}

              {!dashboardData.reviewLoopPulse.loopActive && (
                <Button 
                  asChild 
                  className="w-full"
                  variant="outline"
                >
                  <a href="/dashboard/review">Activate Review Loop</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 8. Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users2Icon className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'quick_win' ? 'bg-green-500' :
                    activity.type === 'hypothesis' ? 'bg-blue-500' :
                    activity.type === 'insight' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <Badge 
                        variant="outline"
                        className="text-xs ml-2"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-600 capitalize">
                        {activity.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users2Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">
                Start using the system to see activity here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Progress Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <AwardIcon className="h-6 w-6 mr-3" />
            Strategic Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {dashboardData.healthCheckSummary?.length > 0 ? '✓' : '○'}
              </div>
              <div className="text-sm font-medium text-gray-900">Health Check</div>
              <div className="text-xs text-gray-600">Foundation Assessment</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {dashboardData.strategicDecisions ? '✓' : '○'}
              </div>
              <div className="text-sm font-medium text-gray-900">Strategy Cascade</div>
              <div className="text-xs text-gray-600">Strategic Choices</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {dashboardData.reviewLoopPulse.loopActive ? '✓' : '○'}
              </div>
              <div className="text-sm font-medium text-gray-900">Review Loop</div>
              <div className="text-xs text-gray-600">Continuous Learning</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Strategy as a System:</strong> Not a plan, but a practice of continuous adaptation.
            </p>
            <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <a href="/dashboard/strategy-map">
                View Full Strategic System <ArrowRightIcon className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 