"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCwIcon, 
  TrendingUpIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  PlusIcon,
  TargetIcon,
  BrainIcon,
  MessageSquareIcon,
  BarChart3Icon,
  CalendarIcon,
  EyeIcon,
  DownloadIcon,
  StarIcon,
  ArrowRightIcon,
  ClockIcon,
  Users2Icon,
  ZapIcon,
  AwardIcon
} from "lucide-react";

// Types
interface ReviewCycle {
  id: string;
  cycle_name: string;
  cycle_type: string;
  start_date: string;
  end_date?: string;
  efficiency_score?: number;
  effectiveness_score?: number;
  excellence_score?: number;
  overall_progress_score?: number;
  key_learnings?: string;
  major_changes?: string;
  next_cycle_focus?: string;
  status: string;
  created_at: string;
}

interface FeedbackEntry {
  id: string;
  feedback_type: string;
  category: string;
  module_source?: string;
  title: string;
  content: string;
  sentiment?: string;
  requires_action: boolean;
  action_taken?: string;
  action_status?: string;
  priority_level: string;
  created_at: string;
}

interface LearningInsight {
  id: string;
  insight_title: string;
  insight_description: string;
  insight_type: string;
  source_modules?: string[];
  confidence_level: string;
  potential_impact: string;
  recommended_actions?: string;
  implementation_status: string;
  applies_to_dimension: string;
  created_at: string;
}

interface SystemCheckpoint {
  id: string;
  checkpoint_name: string;
  dimension: string;
  metric_type: string;
  target_value?: string;
  actual_value?: string;
  status: string;
  progress_percentage?: number;
  checkpoint_description?: string;
  created_at: string;
}

interface DashboardData {
  activeCycle?: ReviewCycle;
  healthCheck?: {
    latest?: any;
    trends?: any;
    history?: any[];
  };
  archetypes?: {
    current?: any[];
    count?: number;
  };
  quickWins?: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
    high_impact: number;
  };
  strategy?: {
    total: number;
    testing: number;
    validated: number;
    invalidated: number;
    high_confidence: number;
  };
  decisions?: {
    total: number;
    active: number;
    under_review: number;
    high_impact: number;
  };
  feedback?: {
    total: number;
    requiring_action: number;
    by_module: Record<string, number>;
    by_sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  insights?: {
    total: number;
    by_dimension: {
      efficiency: number;
      effectiveness: number;
      excellence: number;
      all: number;
    };
    implemented: number;
    high_impact: number;
    high_confidence: number;
  };
  checkpoints?: {
    total: number;
    by_dimension: {
      efficiency: number;
      effectiveness: number;
      excellence: number;
    };
    on_track: number;
    at_risk: number;
    behind: number;
    exceeded: number;
  };
  loopProgress?: {
    total: number;
    efficiency: number;
    effectiveness: number;
    excellence: number;
    currentPhase: string;
    recommendations: string[];
  };
  lastUpdated?: string;
}

export default function ReviewLoopPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'cycles' | 'feedback' | 'insights' | 'checkpoints' | 'timeline'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [checkpoints, setCheckpoints] = useState<SystemCheckpoint[]>([]);

  // Form states
  const [showNewCycleForm, setShowNewCycleForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [showCheckpointForm, setShowCheckpointForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, activeView]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading review data for:', activeView);
      console.log('🔍 User:', user?.email);
      
      const response = await fetch(`/api/review-loop?type=${activeView === 'dashboard' ? 'dashboard' : activeView}`, {
        credentials: 'include'
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      switch (activeView) {
        case 'dashboard':
          setDashboardData(data.dashboard);
          break;
        case 'cycles':
          setCycles(data.cycles || []);
          break;
        case 'feedback':
          setFeedback(data.feedback || []);
          break;
        case 'insights':
          setInsights(data.insights || []);
          break;
        case 'checkpoints':
          setCheckpoints(data.checkpoints || []);
          break;
      }
    } catch (err) {
      console.error('💥 Load data error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createNewCycle = async (formData: any) => {
    try {
      const response = await fetch('/api/review-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'cycle', ...formData })
      });
      
      if (!response.ok) throw new Error('Failed to create cycle');
      
      setShowNewCycleForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cycle');
    }
  };

  const createFeedback = async (formData: any) => {
    try {
      const response = await fetch('/api/review-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'feedback', ...formData })
      });
      
      if (!response.ok) throw new Error('Failed to create feedback');
      
      setShowFeedbackForm(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
    }
  };

  const calculateExcellenceScore = (data: DashboardData) => {
    if (!data.healthCheck) return 0;
    
    const recentCycles = cycles.filter(c => c.status === 'Completed').slice(0, 3);
    const consistencyScore = recentCycles.length > 0 ? 80 : 50;
    const learningCycles = insights.length > 5 ? 90 : 60;
    const systemicResponsiveness = (feedback.filter(f => f.action_status === 'Completed').length / Math.max(feedback.length, 1)) * 100;
    
    return Math.round((consistencyScore + learningCycles + systemicResponsiveness) / 3);
  };

  const getInsightToActionRatio = () => {
    const actionsFromInsights = insights.filter(i => i.implementation_status !== 'Identified').length;
    return insights.length > 0 ? Math.round((actionsFromInsights / insights.length) * 100) : 0;
  };

  if (!user) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <RefreshCwIcon className="h-8 w-8 text-blue-600 mr-3" />
                Review Loop
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                The engine of continuous improvement - Excellence in motion
              </p>
            </div>
            <Button
              onClick={() => loadData()}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3Icon },
              { key: 'cycles', label: 'Review Cycles', icon: CalendarIcon },
              { key: 'feedback', label: 'Feedback Intake', icon: MessageSquareIcon },
              { key: 'insights', label: 'Learning Insights', icon: BrainIcon },
              { key: 'checkpoints', label: 'System Checkpoints', icon: TargetIcon },
              { key: 'timeline', label: 'Retrospective Timeline', icon: ClockIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeView === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            {/* Excellence Score & Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Excellence Score</p>
                      <p className="text-3xl font-bold text-purple-900">
                        {calculateExcellenceScore(dashboardData)}%
                      </p>
                    </div>
                    <AwardIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Cycles</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {cycles.filter(c => c.status === 'Active').length}
                      </p>
                    </div>
                    <RefreshCwIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Insight→Action Ratio</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {getInsightToActionRatio()}%
                      </p>
                    </div>
                    <ZapIcon className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Health</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {dashboardData.healthCheck?.latest ? 
                          Math.round(
                            (dashboardData.healthCheck.latest.efficiency_score + 
                             dashboardData.healthCheck.latest.effectiveness_score + 
                             dashboardData.healthCheck.latest.excellence_score) / 3
                          ) : 0}%
                      </p>
                    </div>
                    <TrendingUpIcon className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Cycle Status */}
            {dashboardData.activeCycle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Current Review Cycle: {dashboardData.activeCycle.cycle_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Efficiency</p>
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData.activeCycle.efficiency_score || 0}%
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Effectiveness</p>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData.activeCycle.effectiveness_score || 0}%
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Excellence</p>
                      <div className="text-2xl font-bold text-purple-600">
                        {dashboardData.activeCycle.excellence_score || 0}%
                      </div>
                    </div>
                  </div>
                  {dashboardData.activeCycle.next_cycle_focus && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Next Cycle Focus:</p>
                      <p className="text-blue-800">{dashboardData.activeCycle.next_cycle_focus}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => {
                  setActiveView('cycles');
                  setShowNewCycleForm(true);
                }}
                className="h-24 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-6 w-6 mb-2" />
                Start New Cycle
              </Button>
              
              <Button
                onClick={() => {
                  setActiveView('feedback');
                  setShowFeedbackForm(true);
                }}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
              >
                <MessageSquareIcon className="h-6 w-6 mb-2" />
                Add Feedback
              </Button>
              
              <Button
                onClick={() => {
                  setActiveView('insights');
                  setShowInsightForm(true);
                }}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
              >
                <BrainIcon className="h-6 w-6 mb-2" />
                Capture Insight
              </Button>
              
              <Button
                onClick={() => setActiveView('timeline')}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
              >
                <ClockIcon className="h-6 w-6 mb-2" />
                View Timeline
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <BrainIcon className="h-5 w-5 mr-2" />
                      Recent Learning Insights
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView('insights')}
                    >
                      View All <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{insight.insight_title}</h4>
                          <Badge variant={insight.potential_impact === 'High' ? 'destructive' : 
                                       insight.potential_impact === 'Medium' ? 'default' : 'secondary'}>
                            {insight.potential_impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{insight.insight_description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{insight.applies_to_dimension}</span>
                          <span className="text-gray-400">
                            {new Date(insight.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No insights yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Checkpoints Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <TargetIcon className="h-5 w-5 mr-2" />
                      System Checkpoints
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView('checkpoints')}
                    >
                      View All <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Efficiency', 'Effectiveness', 'Excellence'].map((dimension) => {
                      const dimensionCheckpoints = checkpoints.filter(c => c.dimension === dimension);
                      const onTrack = dimensionCheckpoints.filter(c => c.status === 'On_Track').length;
                      const total = dimensionCheckpoints.length;
                      
                      return (
                        <div key={dimension} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{dimension}</p>
                            <p className="text-xs text-gray-600">{total} checkpoints</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {onTrack}/{total} on track
                            </p>
                            <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                              <div 
                                className="h-2 bg-green-500 rounded-full transition-all"
                                style={{ width: `${total > 0 ? (onTrack / total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Review Cycles Tab */}
        {activeView === 'cycles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Review Cycles</h2>
              <Button onClick={() => setShowNewCycleForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Cycle
              </Button>
            </div>

            {/* Active Cycles */}
            <div className="grid gap-6">
              {cycles.filter(c => c.status === 'Active').map((cycle) => (
                <Card key={cycle.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        {cycle.cycle_name}
                      </CardTitle>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Efficiency</p>
                        <div className="text-2xl font-bold text-blue-600">
                          {cycle.efficiency_score || 0}%
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Effectiveness</p>
                        <div className="text-2xl font-bold text-green-600">
                          {cycle.effectiveness_score || 0}%
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Excellence</p>
                        <div className="text-2xl font-bold text-purple-600">
                          {cycle.excellence_score || 0}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Started: {new Date(cycle.start_date).toLocaleDateString()}</span>
                      <span>{cycle.cycle_type}</span>
                    </div>
                    {cycle.next_cycle_focus && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">{cycle.next_cycle_focus}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Completed Cycles */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Cycles</h3>
              <div className="grid gap-4">
                {cycles.filter(c => c.status === 'Completed').map((cycle) => (
                  <Card key={cycle.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{cycle.cycle_name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(cycle.start_date).toLocaleDateString()} - 
                            {cycle.end_date ? new Date(cycle.end_date).toLocaleDateString() : 'Ongoing'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Overall Progress</p>
                          <p className="text-lg font-bold">{cycle.overall_progress_score || 0}%</p>
                        </div>
                      </div>
                      {cycle.key_learnings && (
                        <div className="mt-3 text-sm text-gray-700">
                          <strong>Key Learnings:</strong> {cycle.key_learnings}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeView === 'feedback' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Feedback Intake</h2>
              <Button onClick={() => setShowFeedbackForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Feedback
              </Button>
            </div>

            {/* Feedback Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {feedback.filter(f => f.requires_action && f.action_status !== 'Completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Requiring Action</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {feedback.filter(f => f.sentiment === 'Positive').length}
                  </p>
                  <p className="text-sm text-gray-600">Positive</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {feedback.filter(f => f.sentiment === 'Negative').length}
                  </p>
                  <p className="text-sm text-gray-600">Needs Attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {feedback.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex gap-2">
                        {item.module_source && (
                          <Badge variant="outline">{item.module_source}</Badge>
                        )}
                        {item.sentiment && (
                          <Badge variant={
                            item.sentiment === 'Positive' ? 'default' :
                            item.sentiment === 'Negative' ? 'destructive' : 'secondary'
                          }>
                            {item.sentiment}
                          </Badge>
                        )}
                        {item.requires_action && (
                          <Badge variant="destructive">Action Required</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{item.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{item.category} • {item.feedback_type}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    {item.action_taken && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-900">
                          <strong>Action Taken:</strong> {item.action_taken}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Learning Insights Tab */}
        {activeView === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Learning Insights</h2>
              <Button onClick={() => setShowInsightForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Capture Insight
              </Button>
            </div>

            {/* Insights by Dimension */}
            <div className="grid md:grid-cols-3 gap-4">
              {['Efficiency', 'Effectiveness', 'Excellence'].map((dimension) => {
                const dimensionInsights = insights.filter(i => i.applies_to_dimension === dimension);
                return (
                  <Card key={dimension}>
                    <CardHeader>
                      <CardTitle className={`text-${
                        dimension === 'Efficiency' ? 'blue' :
                        dimension === 'Effectiveness' ? 'green' : 'purple'
                      }-600`}>
                        {dimension}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dimensionInsights.slice(0, 3).map((insight) => (
                          <div key={insight.id} className="border rounded p-3">
                            <h5 className="font-medium text-sm mb-1">{insight.insight_title}</h5>
                            <p className="text-xs text-gray-600">{insight.insight_description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <Badge variant={insight.potential_impact === 'High' ? 'destructive' : 'secondary'}>
                                {insight.potential_impact}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {insight.implementation_status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {dimensionInsights.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">
                            +{dimensionInsights.length - 3} more insights
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* All Insights List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Insights</h3>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{insight.insight_title}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{insight.applies_to_dimension}</Badge>
                          <Badge variant={insight.potential_impact === 'High' ? 'destructive' : 'secondary'}>
                            {insight.potential_impact}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{insight.insight_description}</p>
                      {insight.recommended_actions && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-blue-900">
                            <strong>Recommended Actions:</strong> {insight.recommended_actions}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{insight.insight_type} • {insight.confidence_level} confidence</span>
                        <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Checkpoints Tab */}
        {activeView === 'checkpoints' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">System Checkpoints</h2>
              <Button onClick={() => setShowCheckpointForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Checkpoint
              </Button>
            </div>

            {/* Checkpoints by Dimension */}
            <div className="grid md:grid-cols-3 gap-6">
              {['Efficiency', 'Effectiveness', 'Excellence'].map((dimension) => {
                const dimensionCheckpoints = checkpoints.filter(c => c.dimension === dimension);
                const onTrack = dimensionCheckpoints.filter(c => c.status === 'On_Track').length;
                const atRisk = dimensionCheckpoints.filter(c => c.status === 'At_Risk').length;
                const behind = dimensionCheckpoints.filter(c => c.status === 'Behind').length;
                
                return (
                  <Card key={dimension}>
                    <CardHeader>
                      <CardTitle className={`text-${
                        dimension === 'Efficiency' ? 'blue' :
                        dimension === 'Effectiveness' ? 'green' : 'purple'
                      }-600 flex items-center justify-between`}>
                        {dimension}
                        <span className="text-sm font-normal text-gray-600">
                          {dimensionCheckpoints.length} checkpoints
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">On Track</span>
                          <span className="font-medium">{onTrack}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-yellow-600">At Risk</span>
                          <span className="font-medium">{atRisk}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-red-600">Behind</span>
                          <span className="font-medium">{behind}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {dimensionCheckpoints.slice(0, 3).map((checkpoint) => (
                          <div key={checkpoint.id} className="border rounded p-2">
                            <div className="flex justify-between items-center">
                              <h5 className="text-sm font-medium">{checkpoint.checkpoint_name}</h5>
                              <Badge variant={
                                checkpoint.status === 'On_Track' ? 'default' :
                                checkpoint.status === 'At_Risk' ? 'secondary' :
                                checkpoint.status === 'Behind' ? 'destructive' : 'outline'
                              }>
                                {checkpoint.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {checkpoint.progress_percentage && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${checkpoint.progress_percentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  {checkpoint.progress_percentage}% complete
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* All Checkpoints */}
            <div>
              <h3 className="text-lg font-semibold mb-4">All Checkpoints</h3>
              <div className="space-y-4">
                {checkpoints.map((checkpoint) => (
                  <Card key={checkpoint.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{checkpoint.checkpoint_name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{checkpoint.dimension}</Badge>
                          <Badge variant={
                            checkpoint.status === 'On_Track' ? 'default' :
                            checkpoint.status === 'At_Risk' ? 'secondary' :
                            checkpoint.status === 'Behind' ? 'destructive' : 'outline'
                          }>
                            {checkpoint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {checkpoint.checkpoint_description && (
                        <p className="text-gray-700 mb-3">{checkpoint.checkpoint_description}</p>
                      )}
                      <div className="grid md:grid-cols-3 gap-4 mb-3">
                        {checkpoint.target_value && (
                          <div>
                            <p className="text-sm text-gray-600">Target</p>
                            <p className="font-medium">{checkpoint.target_value}</p>
                          </div>
                        )}
                        {checkpoint.actual_value && (
                          <div>
                            <p className="text-sm text-gray-600">Actual</p>
                            <p className="font-medium">{checkpoint.actual_value}</p>
                          </div>
                        )}
                        {checkpoint.progress_percentage && (
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <p className="font-medium">{checkpoint.progress_percentage}%</p>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {checkpoint.metric_type} • Created {new Date(checkpoint.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeView === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Retrospective Timeline</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Timeline View */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              <div className="space-y-8">
                {/* Health Check Events */}
                {dashboardData.healthCheck?.history?.map((check, index) => (
                  <div key={check.id} className="relative flex items-start">
                    <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <TrendingUpIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-12">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Health Check Completed</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(check.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>Efficiency: {check.efficiency_score}%</div>
                            <div>Effectiveness: {check.effectiveness_score}%</div>
                            <div>Excellence: {check.excellence_score}%</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}

                {/* Cycle Events */}
                {cycles.map((cycle) => (
                  <div key={cycle.id} className="relative flex items-start">
                    <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-12">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              Review Cycle: {cycle.cycle_name} {cycle.status === 'Completed' ? 'Completed' : 'Started'}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(cycle.status === 'Completed' && cycle.end_date ? cycle.end_date : cycle.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          {cycle.key_learnings && (
                            <p className="text-sm text-gray-700">{cycle.key_learnings}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}

                {/* Major Insights */}
                {insights.filter(i => i.potential_impact === 'High').map((insight) => (
                  <div key={insight.id} className="relative flex items-start">
                    <div className="absolute left-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <BrainIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-12">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Major Insight: {insight.insight_title}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(insight.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{insight.insight_description}</p>
                          <Badge variant="destructive" className="mt-2">High Impact</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Forms - These should be outside the main content div */}
      {showNewCycleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Start New Review Cycle</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createNewCycle({
                title: formData.get('cycle_name'),
                description: formData.get('description'),
                start_date: formData.get('start_date'),
                goals: formData.get('goals')?.toString().split(',').map(g => g.trim()).filter(Boolean) || []
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cycle Name</label>
                  <input
                    name="cycle_name"
                    type="text"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Q1 Excellence Review"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    className="w-full border rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Focus areas and objectives for this cycle..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    name="start_date"
                    type="date"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Goals (comma-separated)</label>
                  <input
                    name="goals"
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Improve efficiency metrics, Complete health checks..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowNewCycleForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Cycle</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Feedback</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createFeedback({
                title: formData.get('title'),
                content: formData.get('content'),
                category: formData.get('category'),
                sentiment: formData.get('sentiment'),
                module_source: formData.get('source'),
                feedback_type: 'Manual'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Brief feedback title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Feedback Content</label>
                  <textarea
                    name="content"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    rows={4}
                    placeholder="Describe your feedback, observation, or suggestion..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" className="w-full border rounded-md px-3 py-2">
                    <option value="Process">Process</option>
                    <option value="People">People</option>
                    <option value="Purpose">Purpose</option>
                    <option value="System">System</option>
                    <option value="External">External</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sentiment</label>
                  <select name="sentiment" className="w-full border rounded-md px-3 py-2">
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Source Module (Optional)</label>
                  <select name="source" className="w-full border rounded-md px-3 py-2">
                    <option value="">Select module...</option>
                    <option value="health_check">Health Check</option>
                    <option value="archetypes">Archetypes</option>
                    <option value="quick_wins">Quick Wins</option>
                    <option value="strategy_map">Strategy Map</option>
                    <option value="decisions">Decision Module</option>
                    <option value="review_loop">Review Loop</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowFeedbackForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Feedback</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInsightForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Capture Learning Insight</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const createInsight = async (data: any) => {
                try {
                  const response = await fetch('/api/review-loop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ type: 'insight', ...data })
                  });
                  
                  if (!response.ok) throw new Error('Failed to create insight');
                  
                  setShowInsightForm(false);
                  loadData();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to create insight');
                }
              };
              
              createInsight({
                insight_title: formData.get('title'),
                insight_description: formData.get('description'),
                applies_to_dimension: formData.get('category'),
                potential_impact: formData.get('impact_level'),
                insight_type: 'Process_Improvement',
                confidence_level: 'Medium'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Insight Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Key learning or insight title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    rows={4}
                    placeholder="Describe the insight and its implications..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Applies to Dimension</label>
                  <select name="category" className="w-full border rounded-md px-3 py-2">
                    <option value="Efficiency">Efficiency</option>
                    <option value="Effectiveness">Effectiveness</option>
                    <option value="Excellence">Excellence</option>
                    <option value="All">All Dimensions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Impact Level</label>
                  <select name="impact_level" className="w-full border rounded-md px-3 py-2">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowInsightForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Capture Insight</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCheckpointForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add System Checkpoint</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const createCheckpoint = async (data: any) => {
                try {
                  const response = await fetch('/api/review-loop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ type: 'checkpoint', ...data })
                  });
                  
                  if (!response.ok) throw new Error('Failed to create checkpoint');
                  
                  setShowCheckpointForm(false);
                  loadData();
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to create checkpoint');
                }
              };
              
              createCheckpoint({
                checkpoint_name: formData.get('title'),
                checkpoint_description: formData.get('description'),
                dimension: formData.get('dimension'),
                metric_type: 'Qualitative',
                status: formData.get('status')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Checkpoint Name</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Quarterly Review, KPI Check..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    className="w-full border rounded-md px-3 py-2"
                    rows={3}
                    placeholder="What needs to be checked or measured..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dimension</label>
                  <select name="dimension" className="w-full border rounded-md px-3 py-2">
                    <option value="Efficiency">Efficiency</option>
                    <option value="Effectiveness">Effectiveness</option>
                    <option value="Excellence">Excellence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" className="w-full border rounded-md px-3 py-2">
                    <option value="Scheduled">Scheduled</option>
                    <option value="On_Track">On Track</option>
                    <option value="At_Risk">At Risk</option>
                    <option value="Behind">Behind</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCheckpointForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Checkpoint</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 