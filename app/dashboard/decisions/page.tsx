"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrophyIcon,
  MapIcon,
  ZapIcon,
  CogIcon,
  SettingsIcon,
  RefreshCwIcon,
  SaveIcon,
  EyeIcon,
  DownloadIcon,
  LightbulbIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  Edit3Icon
} from 'lucide-react';

interface StrategicDecision {
  id: string;
  winning_aspiration: string | null;
  where_to_play: string | null;
  how_to_win: string | null;
  capabilities: string | null;
  management_systems: string | null;
  context_summary: string | null;
  supporting_hypotheses: string[] | null;
  coherence_notes: string | null;
  implementation_notes: string | null;
  version: number;
  status: string;
  created_at: string;
  last_updated: string;
}

interface ValidatedHypothesis {
  id: string;
  challenge_area: string;
  hypothesis: string;
  status: string;
  priority_level: string;
}

interface Hypothesis {
  id: string;
  challenge_area: string;
  hypothesis: string;
  status: string;
  priority_level: string;
}

interface Archetype {
  id: string;
  archetype_name: string;
  source_dimension: string;
  insight: string;
}

interface QuickWin {
  id: string;
  title: string;
  description: string;
  status: string;
  impact_level: string;
}

interface ContextData {
  hypotheses: Hypothesis[];
  archetypes: Archetype[];
  quickWins: QuickWin[];
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<StrategicDecision[]>([]);
  const [validatedHypotheses, setValidatedHypotheses] = useState<ValidatedHypothesis[]>([]);
  const [contextData, setContextData] = useState<ContextData>({ hypotheses: [], archetypes: [], quickWins: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDecision, setActiveDecision] = useState<StrategicDecision | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCascadeMap, setShowCascadeMap] = useState(false);

  const [formData, setFormData] = useState({
    winning_aspiration: '',
    where_to_play: '',
    how_to_win: '',
    capabilities: '',
    management_systems: '',
    context_summary: '',
    coherence_notes: '',
    implementation_notes: '',
    supporting_hypotheses: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch strategic decisions and validated hypotheses
      const decisionsResponse = await fetch('/api/strategic-decisions');
      if (decisionsResponse.ok) {
        const decisionsData = await decisionsResponse.json();
        setDecisions(decisionsData.decisions || []);
        setValidatedHypotheses(decisionsData.validatedHypotheses || []);
        
        // If we have an active decision, populate the form
        if (decisionsData.decisions && decisionsData.decisions.length > 0) {
          const latestDecision = decisionsData.decisions[0];
          setActiveDecision(latestDecision);
          populateForm(latestDecision);
        }
      }

      // Fetch context data from other modules
      const contextResponse = await fetch('/api/strategy-hypotheses');
      if (contextResponse.ok) {
        const hypothesesData = await contextResponse.json();
        setContextData(prev => ({ ...prev, hypotheses: hypothesesData.hypotheses || [] }));
      }

      const archetypesResponse = await fetch('/api/archetypes');
      if (archetypesResponse.ok) {
        const archetypesData = await archetypesResponse.json();
        setContextData(prev => ({ 
          ...prev, 
          archetypes: archetypesData.archetypes || [],
          quickWins: archetypesData.quickWins || []
        }));
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (decision: StrategicDecision) => {
    setFormData({
      winning_aspiration: decision.winning_aspiration || '',
      where_to_play: decision.where_to_play || '',
      how_to_win: decision.how_to_win || '',
      capabilities: decision.capabilities || '',
      management_systems: decision.management_systems || '',
      context_summary: decision.context_summary || '',
      coherence_notes: decision.coherence_notes || '',
      implementation_notes: decision.implementation_notes || '',
      supporting_hypotheses: decision.supporting_hypotheses || []
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const method = activeDecision ? 'PUT' : 'POST';
      const body = activeDecision 
        ? { id: activeDecision.id, ...formData }
        : formData;

      const response = await fetch('/api/strategic-decisions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save strategic decision');
      }

      const data = await response.json();
      
      if (activeDecision) {
        setDecisions(prev => prev.map(d => d.id === activeDecision.id ? data.decision : d));
        setActiveDecision(data.decision);
      } else {
        setDecisions(prev => [data.decision, ...prev]);
        setActiveDecision(data.decision);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving decision:', err);
      setError(err instanceof Error ? err.message : 'Failed to save strategic decision');
    } finally {
      setSaving(false);
    }
  };

  const handleNewDecision = () => {
    setActiveDecision(null);
    setFormData({
      winning_aspiration: '',
      where_to_play: '',
      how_to_win: '',
      capabilities: '',
      management_systems: '',
      context_summary: '',
      coherence_notes: '',
      implementation_notes: '',
      supporting_hypotheses: []
    });
    setIsEditing(true);
    setShowCascadeMap(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Active': return 'bg-purple-100 text-purple-800';
      case 'Archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isFormComplete = () => {
    return formData.winning_aspiration && formData.where_to_play && formData.how_to_win && 
           formData.capabilities && formData.management_systems;
  };

  const exportCascade = () => {
    if (!activeDecision) return;
    
    const cascadeText = `
STRATEGIC DECISION CASCADE

1. WINNING ASPIRATION
${activeDecision.winning_aspiration || 'Not defined'}

2. WHERE TO PLAY
${activeDecision.where_to_play || 'Not defined'}

3. HOW TO WIN
${activeDecision.how_to_win || 'Not defined'}

4. CAPABILITIES
${activeDecision.capabilities || 'Not defined'}

5. MANAGEMENT SYSTEMS
${activeDecision.management_systems || 'Not defined'}

CONTEXT & NOTES
${activeDecision.context_summary || 'No context provided'}

COHERENCE NOTES
${activeDecision.coherence_notes || 'No coherence notes'}

IMPLEMENTATION NOTES
${activeDecision.implementation_notes || 'No implementation notes'}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([cascadeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategic-cascade-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Strategic Decision Cascade...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Strategic Decision Cascade</h1>
              <p className="mt-2 text-gray-600">
                Transform insights into coherent strategic choices (Effectiveness → Excellence Gateway)
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} variant="outline" size="sm">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleNewDecision} size="sm">
                <Edit3Icon className="h-4 w-4 mr-2" />
                New Cascade
              </Button>
              {activeDecision && isFormComplete() && (
                <>
                  <Button onClick={() => setShowCascadeMap(!showCascadeMap)} variant="outline" size="sm">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {showCascadeMap ? 'Hide' : 'View'} Map
                  </Button>
                  <Button onClick={exportCascade} variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Context Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Strategy Context</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Strategy Experiments */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <LightbulbIcon className="h-5 w-5 mr-2" />
                  Strategy Experiments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contextData.hypotheses.length === 0 ? (
                  <p className="text-gray-500">No strategy hypotheses available</p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Total Hypotheses:</span> {contextData.hypotheses.length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Validated:</span> {contextData.hypotheses.filter(h => h.status === 'Validated').length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Testing:</span> {contextData.hypotheses.filter(h => h.status === 'Testing').length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Constraints */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapIcon className="h-5 w-5 mr-2" />
                  System Constraints
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contextData.archetypes.length === 0 ? (
                  <p className="text-gray-500">No system archetypes identified</p>
                ) : (
                  <div className="space-y-2">
                    {contextData.archetypes.slice(0, 2).map((archetype, index) => (
                      <div key={index} className="text-sm border-l-2 border-purple-200 pl-2">
                        <div className="font-medium">{archetype.archetype_name}</div>
                        <div className="text-gray-500 text-xs">{archetype.source_dimension}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operational Progress */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Operational Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contextData.quickWins.length === 0 ? (
                  <p className="text-gray-500">No quick wins tracked</p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Quick Wins:</span> {contextData.quickWins.length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Completed:</span> {contextData.quickWins.filter(qw => qw.status === 'Done').length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Validated Hypotheses for Reference */}
        {validatedHypotheses.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Validated Strategic Insights</CardTitle>
              <CardDescription>Use these validated hypotheses to inform your strategic choices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {validatedHypotheses.map((hypothesis) => (
                  <div key={hypothesis.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="font-medium text-sm mb-2">{hypothesis.challenge_area}</div>
                    <div className="text-sm text-gray-700">{hypothesis.hypothesis}</div>
                    <Badge className="mt-2" variant="outline">
                      {hypothesis.priority_level} Priority
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategy Cascade Map View */}
        {showCascadeMap && activeDecision && isFormComplete() && (
          <Card className="mb-8 border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2" />
                Strategic Decision Cascade Map
              </CardTitle>
              <CardDescription>
                Your coherent set of strategic choices for organizational transformation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full">
                    <TrophyIcon className="h-5 w-5 mr-2 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">1. WINNING ASPIRATION</span>
                  </div>
                  <div className="mt-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium">{activeDecision.winning_aspiration}</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowDownIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
                      <MapIcon className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="font-semibold text-blue-800">2. WHERE TO PLAY</span>
                    </div>
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm">{activeDecision.where_to_play}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
                      <ZapIcon className="h-5 w-5 mr-2 text-green-600" />
                      <span className="font-semibold text-green-800">3. HOW TO WIN</span>
                    </div>
                    <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm">{activeDecision.how_to_win}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowDownIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full">
                      <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
                      <span className="font-semibold text-purple-800">4. CAPABILITIES</span>
                    </div>
                    <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm">{activeDecision.capabilities}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full">
                      <SettingsIcon className="h-5 w-5 mr-2 text-red-600" />
                      <span className="font-semibold text-red-800">5. MANAGEMENT SYSTEMS</span>
                    </div>
                    <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm">{activeDecision.management_systems}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategic Decision Builder */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Strategic Decision Builder</CardTitle>
                <CardDescription>
                  Define your five cascading strategic choices based on "Playing to Win"
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isEditing && activeDecision && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3Icon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      <SaveIcon className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              
              {/* 1. Winning Aspiration */}
              <div className="border-l-4 border-l-yellow-500 pl-6">
                <div className="flex items-center mb-3">
                  <TrophyIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  <Label className="text-lg font-semibold">1. Winning Aspiration</Label>
                </div>
                <p className="text-sm text-gray-600 mb-3">What does winning look like for us? What impact do we want to have on the world?</p>
                {isEditing ? (
                  <Textarea
                    value={formData.winning_aspiration}
                    onChange={(e) => setFormData(prev => ({ ...prev, winning_aspiration: e.target.value }))}
                    placeholder="Define your organization's purpose and vision of winning..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-yellow-50 rounded border">
                    {formData.winning_aspiration || 'Not defined yet'}
                  </div>
                )}
              </div>

              {/* 2. Where to Play */}
              <div className="border-l-4 border-l-blue-500 pl-6">
                <div className="flex items-center mb-3">
                  <MapIcon className="h-5 w-5 mr-2 text-blue-600" />
                  <Label className="text-lg font-semibold">2. Where to Play</Label>
                </div>
                <p className="text-sm text-gray-600 mb-3">Where will we compete? What geographies, customer segments, channels, and value chain stages?</p>
                {isEditing ? (
                  <Textarea
                    value={formData.where_to_play}
                    onChange={(e) => setFormData(prev => ({ ...prev, where_to_play: e.target.value }))}
                    placeholder="Define your battlefields - include what you will NOT do..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-blue-50 rounded border">
                    {formData.where_to_play || 'Not defined yet'}
                  </div>
                )}
              </div>

              {/* 3. How to Win */}
              <div className="border-l-4 border-l-green-500 pl-6">
                <div className="flex items-center mb-3">
                  <ZapIcon className="h-5 w-5 mr-2 text-green-600" />
                  <Label className="text-lg font-semibold">3. How to Win</Label>
                </div>
                <p className="text-sm text-gray-600 mb-3">How will we win there? What's our unique edge - cost, experience, innovation?</p>
                {isEditing ? (
                  <Textarea
                    value={formData.how_to_win}
                    onChange={(e) => setFormData(prev => ({ ...prev, how_to_win: e.target.value }))}
                    placeholder="Define your unique strategic position and competitive advantage..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-green-50 rounded border">
                    {formData.how_to_win || 'Not defined yet'}
                  </div>
                )}
              </div>

              {/* 4. Capabilities */}
              <div className="border-l-4 border-l-purple-500 pl-6">
                <div className="flex items-center mb-3">
                  <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
                  <Label className="text-lg font-semibold">4. Capabilities</Label>
                </div>
                <p className="text-sm text-gray-600 mb-3">What must we be great at? What systems, processes, and knowledge must we master?</p>
                {isEditing ? (
                  <Textarea
                    value={formData.capabilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, capabilities: e.target.value }))}
                    placeholder="Define the capabilities you must build or strengthen..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-purple-50 rounded border">
                    {formData.capabilities || 'Not defined yet'}
                  </div>
                )}
              </div>

              {/* 5. Management Systems */}
              <div className="border-l-4 border-l-red-500 pl-6">
                <div className="flex items-center mb-3">
                  <SettingsIcon className="h-5 w-5 mr-2 text-red-600" />
                  <Label className="text-lg font-semibold">5. Management Systems</Label>
                </div>
                <p className="text-sm text-gray-600 mb-3">What systems will support us? How will we measure, reinforce, and improve our capabilities?</p>
                {isEditing ? (
                  <Textarea
                    value={formData.management_systems}
                    onChange={(e) => setFormData(prev => ({ ...prev, management_systems: e.target.value }))}
                    placeholder="Define your operating system: structure, KPIs, feedback loops, incentives..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-red-50 rounded border">
                    {formData.management_systems || 'Not defined yet'}
                  </div>
                )}
              </div>

              {/* Additional Context */}
              {isEditing && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Additional Context</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="context_summary">Context Summary</Label>
                      <Textarea
                        id="context_summary"
                        value={formData.context_summary}
                        onChange={(e) => setFormData(prev => ({ ...prev, context_summary: e.target.value }))}
                        placeholder="Summarize the strategic context and key insights..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="coherence_notes">Coherence Notes</Label>
                      <Textarea
                        id="coherence_notes"
                        value={formData.coherence_notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, coherence_notes: e.target.value }))}
                        placeholder="How do these choices reinforce each other?"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="implementation_notes">Implementation Notes</Label>
                    <Textarea
                      id="implementation_notes"
                      value={formData.implementation_notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, implementation_notes: e.target.value }))}
                      placeholder="Key considerations for implementation and next steps..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

        {/* Decision History */}
        {decisions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Decision History</CardTitle>
              <CardDescription>Previous versions of your strategic decision cascade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <div key={decision.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Version {decision.version}</span>
                        <Badge className={getStatusColor(decision.status)}>{decision.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(decision.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {decision.winning_aspiration && (
                      <div className="text-sm">
                        <span className="font-medium">Winning Aspiration:</span> {decision.winning_aspiration.substring(0, 100)}...
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveDecision(decision);
                          populateForm(decision);
                          setIsEditing(false);
                        }}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 