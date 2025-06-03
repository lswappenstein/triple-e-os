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
  healthCheck?: any;
  quickWins?: any[];
  feedbackSummary?: FeedbackEntry[];
  insightsSummary?: LearningInsight[];
  checkpoints?: SystemCheckpoint[];
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
      const response = await fetch(`/api/review-loop?type=${activeView === 'dashboard' ? 'dashboard' : activeView}`);
      if (!response.ok) throw new Error('Failed to load data');
      
      const data = await response.json();
      
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
                      {dashboardData.healthCheck ? 
                        Math.round(
                          (dashboardData.healthCheck.efficiency_score + 
                           dashboardData.healthCheck.effectiveness_score + 
                           dashboardData.healthCheck.excellence_score) / 3
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

      {/* Other view content would go here - cycles, feedback, insights, checkpoints, timeline */}
      {activeView !== 'dashboard' && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)} view is being loaded...
          </p>
          <p className="text-sm text-gray-500">
            This section will contain the full interface for {activeView}
          </p>
        </div>
      )}
    </div>
  );
} 