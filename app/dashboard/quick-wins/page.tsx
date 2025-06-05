"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';

interface QuickWin {
  id: string;
  title: string;
  description: string;
  source: string;
  archetype: string;
  dimension: string;
  impact_level: string;
  status: string;
  notes: string;
  created_at: string;
  last_updated: string;
}

interface NewQuickWin {
  title: string;
  description: string;
  dimension: string;
  impact_level: string;
}

export default function QuickWinsPage() {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuickWin, setNewQuickWin] = useState<NewQuickWin>({
    title: '',
    description: '',
    dimension: 'Efficiency',
    impact_level: 'Medium',
  });
  const [filter, setFilter] = useState({
    status: 'all',
    dimension: 'all',
    source: 'all',
  });

  useEffect(() => {
    fetchQuickWins();
  }, []);

  const fetchQuickWins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/archetypes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch quick wins');
      }
      
      const data = await response.json();
      setQuickWins(data.quickWins || []);
    } catch (err) {
      console.error('Error fetching quick wins:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createQuickWin = async () => {
    try {
      setIsCreating(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('quick_wins')
        .insert({
          user_id: user.id,
          title: newQuickWin.title,
          description: newQuickWin.description,
          dimension: newQuickWin.dimension,
          impact_level: newQuickWin.impact_level,
          source: 'user',
          status: 'To Do',
        });

      if (error) throw error;

      // Reset form and close
      setNewQuickWin({
        title: '',
        description: '',
        dimension: 'Efficiency',
        impact_level: 'Medium',
      });
      setIsCreateFormVisible(false);
      
      // Refresh the list
      await fetchQuickWins();
    } catch (err) {
      console.error('Error creating quick win:', err);
      setError(err instanceof Error ? err.message : 'Failed to create quick win');
    } finally {
      setIsCreating(false);
    }
  };

  const updateQuickWinStatus = async (quickWinId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating quick win status:', { quickWinId, newStatus });
      const supabase = createClient();
      const { error } = await supabase
        .from('quick_wins')
        .update({ status: newStatus, last_updated: new Date().toISOString() })
        .eq('id', quickWinId);

      console.log('🔄 Update result:', { error });

      if (error) throw error;

      console.log('✅ Status update successful, updating local state');
      // Update local state
      setQuickWins(prev => prev.map(qw => 
        qw.id === quickWinId ? { ...qw, status: newStatus, last_updated: new Date().toISOString() } : qw
      ));
    } catch (err) {
      console.error('❌ Error updating quick win status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const deleteQuickWin = async (quickWinId: string) => {
    if (!confirm('Are you sure you want to delete this quick win?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('quick_wins')
        .delete()
        .eq('id', quickWinId);

      if (error) throw error;

      // Update local state
      setQuickWins(prev => prev.filter(qw => qw.id !== quickWinId));
    } catch (err) {
      console.error('Error deleting quick win:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete quick win');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter quick wins based on selected filters
  const filteredQuickWins = quickWins.filter(qw => {
    if (filter.status !== 'all' && qw.status !== filter.status) return false;
    if (filter.dimension !== 'all' && qw.dimension !== filter.dimension) return false;
    if (filter.source !== 'all' && qw.source !== filter.source) return false;
    return true;
  });

  const stats = {
    total: quickWins.length,
    todo: quickWins.filter(qw => qw.status === 'To Do').length,
    inProgress: quickWins.filter(qw => qw.status === 'In Progress').length,
    done: quickWins.filter(qw => qw.status === 'Done').length,
    system: quickWins.filter(qw => qw.source === 'system').length,
    user: quickWins.filter(qw => qw.source === 'user').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your quick wins...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Quick Wins</h1>
              <p className="mt-2 text-gray-600">
                Manage your action items and track progress toward organizational improvements.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchQuickWins} variant="outline" size="sm">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateFormVisible(!isCreateFormVisible)} size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Quick Win
              </Button>
            </div>
          </div>
        </div>

        {/* Create Quick Win Form */}
        {isCreateFormVisible && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Quick Win</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newQuickWin.title}
                    onChange={(e) => setNewQuickWin(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quick win title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newQuickWin.description}
                    onChange={(e) => setNewQuickWin(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the action item"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dimension">Dimension</Label>
                    <select
                      id="dimension"
                      value={newQuickWin.dimension}
                      onChange={(e) => setNewQuickWin(prev => ({ ...prev, dimension: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="Efficiency">Efficiency</option>
                      <option value="Effectiveness">Effectiveness</option>
                      <option value="Excellence">Excellence</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="impact">Impact Level</Label>
                    <select
                      id="impact"
                      value={newQuickWin.impact_level}
                      onChange={(e) => setNewQuickWin(prev => ({ ...prev, impact_level: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateFormVisible(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createQuickWin} 
                    disabled={isCreating || !newQuickWin.title.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create Quick Win'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.todo}</div>
              <div className="text-sm text-gray-600">To Do</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.done}</div>
              <div className="text-sm text-gray-600">Done</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.system}</div>
              <div className="text-sm text-gray-600">System</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.user}</div>
              <div className="text-sm text-gray-600">User</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Filter by Status</Label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                >
                  <option value="all">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <Label>Filter by Dimension</Label>
                <select
                  value={filter.dimension}
                  onChange={(e) => setFilter(prev => ({ ...prev, dimension: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                >
                  <option value="all">All Dimensions</option>
                  <option value="Efficiency">Efficiency</option>
                  <option value="Effectiveness">Effectiveness</option>
                  <option value="Excellence">Excellence</option>
                </select>
              </div>
              <div>
                <Label>Filter by Source</Label>
                <select
                  value={filter.source}
                  onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                >
                  <option value="all">All Sources</option>
                  <option value="system">System Generated</option>
                  <option value="user">User Created</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Quick Wins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Quick Wins ({filteredQuickWins.length})</CardTitle>
            <CardDescription>
              Track and manage your action items to improve organizational performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredQuickWins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {quickWins.length === 0 
                    ? "No quick wins yet. Complete a health check or create your own action items." 
                    : "No quick wins match your current filters."}
                </p>
                {quickWins.length === 0 && (
                  <Button onClick={() => setIsCreateFormVisible(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Your First Quick Win
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dimension
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuickWins.map((quickWin) => (
                      <tr key={quickWin.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quickWin.title}
                            </div>
                            {quickWin.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {quickWin.description}
                              </div>
                            )}
                            {quickWin.archetype && (
                              <div className="text-xs text-blue-600 mt-1">
                                Related to: {quickWin.archetype}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quickWin.source === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {quickWin.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDimensionColor(quickWin.dimension)}`}>
                            {quickWin.dimension}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(quickWin.impact_level)}`}>
                            {quickWin.impact_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quickWin.status)}`}>
                            {quickWin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <select
                              value={quickWin.status}
                              onChange={(e) => updateQuickWinStatus(quickWin.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                            {quickWin.source === 'user' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteQuickWin(quickWin.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 