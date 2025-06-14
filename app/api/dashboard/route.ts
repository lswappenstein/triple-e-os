import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Type interfaces for better type safety
interface HealthResult {
  dimension: string;
  average_score: number;
  color: string;
  created_at: string;
}

export async function GET() {
  try {
    console.log('📊 Dashboard API: Fetching real data from all modules');
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Can't set cookies in GET request, but required by interface
          },
          remove(name: string, options: CookieOptions) {
            // Can't remove cookies in GET request, but required by interface
          },
        },
      }
    );
    
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('✅ Dashboard API: Authenticated user:', session.user.email);

    // Fetch all data in parallel for performance
    const [
      tripleEStatusResult,
      strategicDecisionsResult,
      healthCheckSummaryResult,
      archetypesResult,
      quickWinsResult,
      strategyMapResult,
      reviewLoopResult,
      recentActivityResult
    ] = await Promise.allSettled([
      getTripleEStatus(supabase, userId),
      getActiveStrategicDecisions(supabase, userId),
      getHealthCheckSummary(supabase, userId),
      getTopArchetypes(supabase, userId),
      getQuickWinsProgress(supabase, userId),
      getStrategyMapHighlights(supabase, userId),
      getReviewLoopPulse(supabase, userId),
      getRecentActivity(supabase, userId)
    ]);

    // Extract data from settled promises with fallbacks
    const tripleEStatus = tripleEStatusResult.status === 'fulfilled' ? tripleEStatusResult.value : getDefaultTripleEStatus();
    const healthCheckSummary = healthCheckSummaryResult.status === 'fulfilled' ? healthCheckSummaryResult.value : null;
    const reviewLoopPulse = reviewLoopResult.status === 'fulfilled' ? reviewLoopResult.value : getDefaultReviewLoopPulse();

    const dashboard = {
      tripleEStatus,
      strategicDecisions: strategicDecisionsResult.status === 'fulfilled' ? strategicDecisionsResult.value : null,
      healthCheckSummary,
      topArchetypes: archetypesResult.status === 'fulfilled' ? archetypesResult.value : [],
      quickWinsProgress: quickWinsResult.status === 'fulfilled' ? quickWinsResult.value : getDefaultQuickWinsProgress(),
      strategyMapHighlights: strategyMapResult.status === 'fulfilled' ? strategyMapResult.value : [],
      reviewLoopPulse,
      recentActivity: recentActivityResult.status === 'fulfilled' ? recentActivityResult.value : [],
      callToAction: generateCallToAction(tripleEStatus, healthCheckSummary, reviewLoopPulse)
    };

    console.log('📊 Dashboard API: Successfully compiled dashboard data');
    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error('💥 Error in dashboard GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get Triple E Status - ring/bar showing balance across three E's
async function getTripleEStatus(supabase: any, userId: string) {
  // Get latest health check results
  const { data: healthResults } = await supabase
    .from('health_check_results')
    .select('dimension, average_score, color, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  // Get strategic decisions status
  const { data: decisions } = await supabase
    .from('strategic_decisions')
    .select('status, created_at')
    .eq('user_id', userId)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(1);

  // Get review cycle activity
  const { data: reviewCycles } = await supabase
    .from('review_cycles')
    .select('status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  const efficiencyScore = (healthResults as HealthResult[])?.find((r: HealthResult) => r.dimension === 'Efficiency')?.average_score || 0;
  const effectivenessScore = (healthResults as HealthResult[])?.find((r: HealthResult) => r.dimension === 'Effectiveness')?.average_score || 0;
  const excellenceScore = (healthResults as HealthResult[])?.find((r: HealthResult) => r.dimension === 'Excellence')?.average_score || 0;

  // Determine current phase
  let currentPhase = 'Efficiency';
  if (decisions?.length > 0 && efficiencyScore > 3) {
    currentPhase = 'Effectiveness';
  }
  if (reviewCycles?.length > 0 && effectivenessScore > 3) {
    currentPhase = 'Excellence';
  }

  return {
    efficiency: { score: efficiencyScore, color: getScoreColor(efficiencyScore) },
    effectiveness: { score: effectivenessScore, color: getScoreColor(effectivenessScore) },
    excellence: { score: excellenceScore, color: getScoreColor(excellenceScore) },
    currentPhase,
    lastUpdated: healthResults?.[0]?.created_at
  };
}

// Get Active Strategic Decisions
async function getActiveStrategicDecisions(supabase: any, userId: string) {
  const { data } = await supabase
    .from('strategic_decisions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(1);

  return data?.[0] || null;
}

// Get Health Check Summary & Trends
async function getHealthCheckSummary(supabase: any, userId: string) {
  // Get latest 3 health check results for trends
  const { data: results } = await supabase
    .from('health_check_results')
    .select('dimension, average_score, color, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(9); // 3 dimensions × 3 historical points

  if (!results || results.length === 0) return null;

  // Group by dimension and get trends
  const groupedResults = (results as HealthResult[]).reduce((acc: Record<string, HealthResult[]>, result: HealthResult) => {
    if (!acc[result.dimension]) acc[result.dimension] = [];
    acc[result.dimension].push(result);
    return acc;
  }, {});

  const summary = Object.keys(groupedResults).map(dimension => {
    const scores = groupedResults[dimension].slice(0, 3);
    const currentScore = scores[0]?.average_score || 0;
    const previousScore = scores[1]?.average_score || 0;
    const trend = currentScore > previousScore ? 'up' : currentScore < previousScore ? 'down' : 'stable';
    
    return {
      dimension,
      currentScore,
      trend,
      color: scores[0]?.color || 'Red',
      lastUpdated: scores[0]?.created_at
    };
  });

  return summary;
}

// Get Top Systems Archetypes
async function getTopArchetypes(supabase: any, userId: string) {
  const { data } = await supabase
    .from('archetypes')
    .select(`
      archetype_name,
      source_dimension,
      insight,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!data) return [];

  // Get archetype details from system_archetypes
  const archetypeNames = data.map((a: any) => a.archetype_name);
  const { data: archetypeDetails } = await supabase
    .from('system_archetypes')
    .select('name, description, symptoms, leverage_points')
    .in('name', archetypeNames);

  return data.map((archetype: any) => {
    const details = archetypeDetails?.find((d: any) => d.name === archetype.archetype_name);
    return {
      ...archetype,
      description: details?.description,
      symptoms: details?.symptoms,
      leveragePoints: details?.leverage_points
    };
  });
}

// Get Quick Wins Progress
async function getQuickWinsProgress(supabase: any, userId: string) {
  const { data: quickWins } = await supabase
    .from('quick_wins')
    .select('status, impact_level, dimension, created_at')
    .eq('user_id', userId);

  if (!quickWins) return null;

  const total = quickWins.length;
  const completed = quickWins.filter((qw: any) => qw.status === 'Done').length;
  const inProgress = quickWins.filter((qw: any) => qw.status === 'In Progress').length;
  const notStarted = quickWins.filter((qw: any) => qw.status === 'To Do').length;

  // Get recent completions this cycle (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCompletions = quickWins.filter((qw: any) => 
    qw.status === 'Done' && 
    new Date(qw.created_at) > thirtyDaysAgo
  ).length;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    recentCompletions
  };
}

// Get Strategy Map Highlights
async function getStrategyMapHighlights(supabase: any, userId: string) {
  const { data } = await supabase
    .from('strategy_hypotheses')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['Testing', 'Validated'])
    .order('last_updated', { ascending: false })
    .limit(3);

  return data || [];
}

// Get Review Loop Pulse
async function getReviewLoopPulse(supabase: any, userId: string) {
  // Get current active cycle
  const { data: activeCycle } = await supabase
    .from('review_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(1);

  // Get recent insights
  const { data: insights } = await supabase
    .from('learning_insights')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Get feedback with reflections
  const { data: feedback } = await supabase
    .from('feedback_entries')
    .select('action_status')
    .eq('user_id', userId)
    .not('action_taken', 'is', null);

  const completedWithReflections = feedback?.filter((f: any) => f.action_status === 'Completed').length || 0;
  const totalFeedback = feedback?.length || 0;
  const reflectionRate = totalFeedback > 0 ? Math.round((completedWithReflections / totalFeedback) * 100) : 0;

  // Calculate days until next review
  let daysUntilReview = null;
  if (activeCycle?.[0]?.end_date) {
    const endDate = new Date(activeCycle[0].end_date);
    const today = new Date();
    daysUntilReview = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    loopActive: !!activeCycle?.[0],
    reflectionRate,
    newInsightsThisCycle: insights?.length || 0,
    daysUntilReview,
    currentCycle: activeCycle?.[0]
  };
}

// Get Recent Activity
async function getRecentActivity(supabase: any, userId: string) {
  // Get recent updates across all modules
  const { data: recentQuickWins } = await supabase
    .from('quick_wins')
    .select('title, status, last_updated')
    .eq('user_id', userId)
    .order('last_updated', { ascending: false })
    .limit(3);

  const { data: recentHypotheses } = await supabase
    .from('strategy_hypotheses')
    .select('challenge_area, status, last_updated')
    .eq('user_id', userId)
    .order('last_updated', { ascending: false })
    .limit(3);

  const { data: recentInsights } = await supabase
    .from('learning_insights')
    .select('insight_title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  // Combine and sort by date
  const activities = [
    ...(recentQuickWins?.map((qw: any) => ({
      type: 'quick_win',
      title: qw.title,
      status: qw.status,
      date: qw.last_updated
    })) || []),
    ...(recentHypotheses?.map((h: any) => ({
      type: 'hypothesis',
      title: h.challenge_area,
      status: h.status,
      date: h.last_updated
    })) || []),
    ...(recentInsights?.map((i: any) => ({
      type: 'insight',
      title: i.insight_title,
      status: 'new',
      date: i.created_at
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return activities;
}

// Generate Call to Action
function generateCallToAction(tripleEStatus: any, healthCheck: any, reviewLoop: any) {
  if (!healthCheck || !healthCheck.length) {
    return {
      type: 'health_check',
      message: "Start your transformation journey with a Health Check assessment.",
      action: "Take Health Check",
      url: "/dashboard/health-check"
    };
  }

  if (!reviewLoop?.loopActive) {
    return {
      type: 'review_loop',
      message: "Activate your Review Loop to enable continuous learning and improvement.",
      action: "Start Review Cycle",
      url: "/dashboard/review"
    };
  }

  const avgScore = healthCheck.reduce((sum: number, h: any) => sum + h.currentScore, 0) / healthCheck.length;
  
  if (avgScore < 3) {
    return {
      type: 'efficiency',
      message: "Focus on Efficiency improvements to stabilize your foundation.",
      action: "View Quick Wins",
      url: "/dashboard/quick-wins"
    };
  }

  if (!tripleEStatus?.strategicDecisions) {
    return {
      type: 'effectiveness',
      message: "Time to make strategic choices with the Decision Cascade.",
      action: "Build Strategy",
      url: "/dashboard/decisions"
    };
  }

  if (reviewLoop?.daysUntilReview && reviewLoop.daysUntilReview <= 3) {
    return {
      type: 'excellence',
      message: `Review cycle ending in ${reviewLoop.daysUntilReview} days. Time to capture learnings.`,
      action: "Complete Review",
      url: "/dashboard/review"
    };
  }

  return {
    type: 'maintain',
    message: "System is healthy. Keep the momentum going!",
    action: "View Insights",
    url: "/dashboard/review?view=insights"
  };
}

// Helper function to determine score color
function getScoreColor(score: number): string {
  if (score >= 4) return 'Green';
  if (score >= 3) return 'Yellow';
  return 'Red';
}

function getDefaultTripleEStatus() {
  return {
    efficiency: { score: 0, color: 'Red' },
    effectiveness: { score: 0, color: 'Red' },
    excellence: { score: 0, color: 'Red' },
    currentPhase: 'Efficiency',
    lastUpdated: null
  };
}

function getDefaultQuickWinsProgress() {
  return {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    completionRate: 0,
    recentCompletions: 0
  };
}

function getDefaultReviewLoopPulse() {
  return {
    loopActive: false,
    reflectionRate: 0,
    newInsightsThisCycle: 0,
    daysUntilReview: null,
    currentCycle: null
  };
} 