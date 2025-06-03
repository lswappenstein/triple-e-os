"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  PlusIcon, 
  RefreshCwIcon, 
  LightbulbIcon, 
  TargetIcon, 
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EditIcon,
  Trash2Icon
} from 'lucide-react';

interface HealthCheckResult {
  dimension: string;
  average_score: number;
  color: string;
}

interface Archetype {
  archetype_name: string;
  source_dimension: string;
  insight: string;
}

interface QuickWin {
  title: string;
  status: string;
  dimension: string;
  source: string;
}

interface StrategyHypothesis {
  id: string;
  challenge_area: string;
  current_structure: string;
  mental_model: string | null;
  leverage_point: string;
  hypothesis: string;
  status: string;
  priority_level: string;
  expected_outcome: string | null;
  owner_notes: string | null;
  reflection_notes: string | null;
  created_at: string;
  last_updated: string;
}

interface InsightsData {
  healthCheck: HealthCheckResult[];
  archetypes: Archetype[];
  quickWins: QuickWin[];
}

export default function StrategyMapPage() {
  const [insights, setInsights] = useState<InsightsData>({ healthCheck: [], archetypes: [], quickWins: [] });
  const [hypotheses, setHypotheses] = useState<StrategyHypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    challenge_area: '',
    current_structure: '',
    mental_model: '',
    leverage_point: '',
    hypothesis: '',
    priority_level: 'Medium',
    expected_outcome: '',
    owner_notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch insights from previous modules
      const insightsResponse = await fetch('/api/archetypes');
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights({
          healthCheck: insightsData.healthCheckResults || [],
          archetypes: insightsData.archetypes || [],
          quickWins: insightsData.quickWins || []
        });
      }

      // Fetch strategy hypotheses
      const hypothesesResponse = await fetch('/api/strategy-hypotheses');
      if (hypothesesResponse.ok) {
        const hypothesesData = await hypothesesResponse.json();
        setHypotheses(hypothesesData.hypotheses || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHypothesis = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/strategy-hypotheses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create hypothesis');
      }

      const data = await response.json();
      setHypotheses(prev => [data.hypothesis, ...prev]);
      resetForm();
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating hypothesis:', err);
      setError(err instanceof Error ? err.message : 'Failed to create hypothesis');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateHypothesis = async (id: string, updates: Partial<StrategyHypothesis>) => {
    try {
      const response = await fetch('/api/strategy-hypotheses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (!response.ok) {
        throw new Error('Failed to update hypothesis');
      }

      const data = await response.json();
      setHypotheses(prev => prev.map(h => h.id === id ? data.hypothesis : h));
    } catch (err) {
      console.error('Error updating hypothesis:', err);
      setError('Failed to update hypothesis');
    }
  };

  const handleDeleteHypothesis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy hypothesis?')) return;

    try {
      const response = await fetch(`/api/strategy-hypotheses?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete hypothesis');
      }

      setHypotheses(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting hypothesis:', err);
      setError('Failed to delete hypothesis');
    }
  };

  const resetForm = () => {
    setFormData({
      challenge_area: '',
      current_structure: '',
      mental_model: '',
      leverage_point: '',
      hypothesis: '',
      priority_level: 'Medium',
      expected_outcome: '',
      owner_notes: ''
    });
    setEditingHypothesis(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <EditIcon className="h-4 w-4" />;
      case 'Testing': return <ClockIcon className="h-4 w-4" />;
      case 'Validated': return <CheckCircleIcon className="h-4 w-4" />;
      case 'Discarded': return <XCircleIcon className="h-4 w-4" />;
      default: return <EditIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Testing': return 'bg-blue-100 text-blue-800';
      case 'Validated': return 'bg-green-100 text-green-800';
      case 'Discarded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const stats = {
    total: hypotheses.length,
    draft: hypotheses.filter(h => h.status === 'Draft').length,
    testing: hypotheses.filter(h => h.status === 'Testing').length,
    validated: hypotheses.filter(h => h.status === 'Validated').length,
    discarded: hypotheses.filter(h => h.status === 'Discarded').length,
    highPriority: hypotheses.filter(h => h.priority_level === 'High').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Strategy Process Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Strategy Process Map</h1>
              <p className="mt-2 text-gray-600">
                Transition from fixing symptoms to designing strategic interventions (Effectiveness Phase)
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Hypothesis
              </Button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Insights from Previous Modules</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Health Check Summary */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TargetIcon className="h-5 w-5 mr-2" />
                  Health Check Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.healthCheck.length === 0 ? (
                  <p className="text-gray-500">No health check data available</p>
                ) : (
                  <div className="space-y-2">
                    {insights.healthCheck.map((result) => (
                      <div key={result.dimension} className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDimensionColor(result.dimension)}`}>
                          {result.dimension}
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{result.average_score.toFixed(1)}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            result.color === 'Green' ? 'bg-green-500' :
                            result.color === 'Yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Archetypes */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <LightbulbIcon className="h-5 w-5 mr-2" />
                  Detected Archetypes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.archetypes.length === 0 ? (
                  <p className="text-gray-500">No archetypes detected</p>
                ) : (
                  <div className="space-y-3">
                    {insights.archetypes.slice(0, 2).map((archetype, index) => (
                      <div key={index} className="border-l-2 border-purple-200 pl-3">
                        <div className="font-medium text-sm">{archetype.archetype_name}</div>
                        <div className="text-xs text-gray-500">{archetype.source_dimension}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Wins Progress */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUpIcon className="h-5 w-5 mr-2" />
                  Quick Wins Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.quickWins.length === 0 ? (
                  <p className="text-gray-500">No quick wins available</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-medium">{insights.quickWins.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">
                        {insights.quickWins.filter(qw => qw.status === 'Done').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>In Progress:</span>
                      <span className="font-medium text-yellow-600">
                        {insights.quickWins.filter(qw => qw.status === 'In Progress').length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create/Edit Hypothesis Form */}
        {(showCreateForm || editingHypothesis) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingHypothesis ? 'Edit' : 'Create'} Strategic Hypothesis</CardTitle>
              <CardDescription>
                Define a strategic intervention based on systemic insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="challenge_area">Challenge Area *</Label>
                    <Textarea
                      id="challenge_area"
                      value={formData.challenge_area}
                      onChange={(e) => setFormData(prev => ({ ...prev, challenge_area: e.target.value }))}
                      placeholder="What tension or contradiction is emerging?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_structure">Current Structure/System *</Label>
                    <Textarea
                      id="current_structure"
                      value={formData.current_structure}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_structure: e.target.value }))}
                      placeholder="What is maintaining this situation?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mental_model">Mental Model (Optional)</Label>
                    <Textarea
                      id="mental_model"
                      value={formData.mental_model}
                      onChange={(e) => setFormData(prev => ({ ...prev, mental_model: e.target.value }))}
                      placeholder="What belief or assumption is sustaining the structure?"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="leverage_point">Leverage Point *</Label>
                    <Textarea
                      id="leverage_point"
                      value={formData.leverage_point}
                      onChange={(e) => setFormData(prev => ({ ...prev, leverage_point: e.target.value }))}
                      placeholder="Where can we intervene that might change the system's behavior?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hypothesis">Strategic Hypothesis *</Label>
                    <Textarea
                      id="hypothesis"
                      value={formData.hypothesis}
                      onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
                      placeholder="If we do X, we expect Y to happen..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority_level">Priority Level</Label>
                      <select
                        id="priority_level"
                        value={formData.priority_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority_level: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="expected_outcome">Expected Outcome</Label>
                      <Input
                        id="expected_outcome"
                        value={formData.expected_outcome}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_outcome: e.target.value }))}
                        placeholder="Qualitative or quantitative metric"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="owner_notes">Owner Notes</Label>
                <Textarea
                  id="owner_notes"
                  value={formData.owner_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner_notes: e.target.value }))}
                  placeholder="Additional context, assumptions, or implementation notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => { resetForm(); setShowCreateForm(false); }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateHypothesis}
                  disabled={creating || !formData.challenge_area || !formData.current_structure || !formData.leverage_point || !formData.hypothesis}
                >
                  {creating ? 'Creating...' : editingHypothesis ? 'Update' : 'Create'} Hypothesis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategy Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Draft</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.testing}</div>
              <div className="text-sm text-gray-600">Testing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
              <div className="text-sm text-gray-600">Validated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.discarded}</div>
              <div className="text-sm text-gray-600">Discarded</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.highPriority}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Strategy Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Strategy Portfolio ({hypotheses.length})</CardTitle>
            <CardDescription>
              Your strategic hypotheses and experiments for organizational transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hypotheses.length === 0 ? (
              <div className="text-center py-12">
                <LightbulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Strategic Hypotheses Yet</h3>
                <p className="text-gray-500 mb-6">
                  Start your transition to Effectiveness by creating your first strategic hypothesis based on the insights above.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Hypothesis
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {hypotheses.map((hypothesis) => (
                  <Card key={hypothesis.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(hypothesis.status)}
                          <Badge className={getStatusColor(hypothesis.status)}>
                            {hypothesis.status}
                          </Badge>
                          <Badge className={getPriorityColor(hypothesis.priority_level)}>
                            {hypothesis.priority_level} Priority
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingHypothesis(hypothesis.id)}>
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteHypothesis(hypothesis.id)}>
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Challenge Area</h4>
                          <p className="text-sm mb-3">{hypothesis.challenge_area}</p>
                          
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Current Structure</h4>
                          <p className="text-sm mb-3">{hypothesis.current_structure}</p>
                          
                          {hypothesis.mental_model && (
                            <>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Mental Model</h4>
                              <p className="text-sm mb-3">{hypothesis.mental_model}</p>
                            </>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Leverage Point</h4>
                          <p className="text-sm mb-3">{hypothesis.leverage_point}</p>
                          
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Strategic Hypothesis</h4>
                          <p className="text-sm mb-3 font-medium">{hypothesis.hypothesis}</p>
                          
                          {hypothesis.expected_outcome && (
                            <>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Expected Outcome</h4>
                              <p className="text-sm mb-3">{hypothesis.expected_outcome}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {(hypothesis.owner_notes || hypothesis.reflection_notes) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {hypothesis.owner_notes && (
                            <div className="mb-3">
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Notes</h4>
                              <p className="text-sm">{hypothesis.owner_notes}</p>
                            </div>
                          )}
                          {hypothesis.reflection_notes && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-1">Reflections</h4>
                              <p className="text-sm">{hypothesis.reflection_notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(hypothesis.created_at).toLocaleDateString()}
                          {hypothesis.last_updated !== hypothesis.created_at && (
                            <span className="ml-2">
                              Updated: {new Date(hypothesis.last_updated).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={hypothesis.status}
                            onChange={(e) => handleUpdateHypothesis(hypothesis.id, { status: e.target.value })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Testing">Testing</option>
                            <option value="Validated">Validated</option>
                            <option value="Discarded">Discarded</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 