import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Define proper TypeScript interfaces
interface CheckpointData {
  checkpoint_name: string;
  checkpoint_description?: string;
  dimension: string;
  metric_type?: string;
  target_value?: string;
  actual_value?: string;
  status?: string;
}

interface InsightData {
  insight_title: string;
  insight_description: string;
  insight_type?: string;
  applies_to_dimension?: string;
  potential_impact?: string;
  confidence_level?: string;
}

interface FeedbackData {
  title: string;
  content: string;
  category?: string;
  sentiment?: string;
  module_source?: string;
  feedback_type?: string;
}

interface CycleData {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  goals?: string[];
}

export async function GET(request: Request) {
  console.log('🚀 Review API GET called');
  
  try {
    console.log('🔐 Checking authentication...');
    
    const cookieStore = await cookies();
    console.log('🍪 Cookie store created');
    
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
    console.log('🔧 Supabase client created');
    
    // Get user session
    console.log('📋 Getting session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 Session result:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      userEmail: session?.user?.email,
      sessionExpiry: session?.expires_at,
      error: sessionError?.message,
      fullSessionData: session ? 'Session exists' : 'No session'
    });
    
    if (sessionError || !session?.user) {
      console.log('❌ Authentication failed - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Authentication successful for user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    console.log('📊 Request type:', type);

    switch (type) {
      case 'cycles':
        console.log('🔄 Getting review cycles...');
        return await getReviewCycles(supabase, session.user.id);
      case 'feedback':
        console.log('💬 Getting feedback entries...');
        return await getFeedbackEntries(supabase, session.user.id, searchParams);
      case 'insights':
        console.log('🧠 Getting learning insights...');
        return await getLearningInsights(supabase, session.user.id, searchParams);
      case 'checkpoints':
        console.log('🎯 Getting system checkpoints...');
        return await getSystemCheckpoints(supabase, session.user.id, searchParams);
      case 'dashboard':
        console.log('📈 Getting dashboard data...');
        return await getDashboardData(supabase, session.user.id);
      default:
        console.log('❌ Invalid type parameter:', type);
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('💥 Error in review-loop GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('🚀 Review API POST called');
    console.log('📋 Getting request body...');
    const body = await request.json();
    console.log('📋 Request body:', body);

    console.log('🔐 Setting up authentication...');
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
            // Can't set cookies in POST without response, but required by interface
          },
          remove(name: string, options: CookieOptions) {
            // Can't remove cookies in POST without response, but required by interface
          },
        },
      }
    );

    // Get user session
    console.log('📋 Getting user session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Session result:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      error: sessionError?.message 
    });
    
    if (sessionError || !session?.user) {
      console.log('❌ Authentication failed in POST');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Authentication successful in POST for user:', session.user.email);

    const { type, ...data } = body;
    console.log('📊 Processing type:', type, 'with data:', data);

    switch (type) {
      case 'cycle':
        console.log('🔄 Creating review cycle...');
        return await createReviewCycle(supabase, session.user.id, data);
      case 'feedback':
        console.log('💬 Creating feedback entry...');
        return await createFeedbackEntry(supabase, session.user.id, data);
      case 'insight':
        console.log('🧠 Creating learning insight...');
        return await createLearningInsight(supabase, session.user.id, data);
      case 'checkpoint':
        console.log('🎯 Creating system checkpoint...');
        return await createSystemCheckpoint(supabase, session.user.id, data);
      default:
        console.log('❌ Invalid type parameter:', type);
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('💥 Error in review-loop POST:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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
            // Can't set cookies in PUT without response, but required by interface
          },
          remove(name: string, options: CookieOptions) {
            // Can't remove cookies in PUT without response, but required by interface
          },
        },
      }
    );

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, ...data } = body;

    switch (type) {
      case 'cycle':
        return await updateReviewCycle(supabase, session.user.id, id, data);
      case 'feedback':
        return await updateFeedbackEntry(supabase, session.user.id, id, data);
      case 'insight':
        return await updateLearningInsight(supabase, session.user.id, id, data);
      case 'checkpoint':
        return await updateSystemCheckpoint(supabase, session.user.id, id, data);
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in review-loop PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions for review cycles
async function getReviewCycles(supabase: SupabaseClient, userId: string) {
  console.log('🔄 getReviewCycles called for user:', userId);
  
  const { data, error } = await supabase
    .from('review_cycles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json({ cycles: data });
}

async function createReviewCycle(supabase: SupabaseClient, userId: string, data: CycleData) {
  console.log('🔄 createReviewCycle called with:', { userId, data });
  
  try {
    const insertData = {
      user_id: userId,
      cycle_name: data.title,
      cycle_type: 'Custom',
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'Active',
      key_learnings: data.description
    };
    
    console.log('🔄 Inserting data:', insertData);
    
    const { data: cycle, error } = await supabase
      .from('review_cycles')
      .insert(insertData)
      .select()
      .single();

    console.log('🔄 Database result:', { cycle, error });

    if (error) {
      console.error('🔄 Database error:', error);
      throw error;
    }
    
    console.log('🔄 Successfully created cycle:', cycle);
    return NextResponse.json({ cycle });
  } catch (err) {
    console.error('🔄 Error in createReviewCycle:', err);
    throw err;
  }
}

async function updateReviewCycle(supabase: SupabaseClient, userId: string, id: string, data: CycleData) {
  const { data: cycle, error } = await supabase
    .from('review_cycles')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ cycle });
}

// Helper functions for feedback entries
async function getFeedbackEntries(supabase: SupabaseClient, userId: string, searchParams: URLSearchParams) {
  console.log('💬 getFeedbackEntries called for user:', userId);
  
  let query = supabase
    .from('feedback_entries')
    .select('*')
    .eq('user_id', userId);

  const cycleId = searchParams.get('cycle_id');
  if (cycleId) {
    query = query.eq('review_cycle_id', cycleId);
  }

  const category = searchParams.get('category');
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json({ feedback: data });
}

async function createFeedbackEntry(supabase: SupabaseClient, userId: string, data: FeedbackData) {
  const { data: feedback, error } = await supabase
    .from('feedback_entries')
    .insert({
      user_id: userId,
      ...data
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ feedback });
}

async function updateFeedbackEntry(supabase: SupabaseClient, userId: string, id: string, data: FeedbackData) {
  const { data: feedback, error } = await supabase
    .from('feedback_entries')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ feedback });
}

// Helper functions for learning insights
async function getLearningInsights(supabase: SupabaseClient, userId: string, searchParams: URLSearchParams) {
  let query = supabase
    .from('learning_insights')
    .select('*')
    .eq('user_id', userId);

  const cycleId = searchParams.get('cycle_id');
  if (cycleId) {
    query = query.eq('review_cycle_id', cycleId);
  }

  const dimension = searchParams.get('dimension');
  if (dimension) {
    query = query.eq('applies_to_dimension', dimension);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json({ insights: data });
}

async function createLearningInsight(supabase: SupabaseClient, userId: string, data: InsightData) {
  const { data: insight, error } = await supabase
    .from('learning_insights')
    .insert({
      user_id: userId,
      ...data
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ insight });
}

async function updateLearningInsight(supabase: SupabaseClient, userId: string, id: string, data: InsightData) {
  const { data: insight, error } = await supabase
    .from('learning_insights')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ insight });
}

// Helper functions for system checkpoints
async function getSystemCheckpoints(supabase: SupabaseClient, userId: string, searchParams: URLSearchParams) {
  let query = supabase
    .from('system_checkpoints')
    .select('*')
    .eq('user_id', userId);

  const cycleId = searchParams.get('cycle_id');
  if (cycleId) {
    query = query.eq('review_cycle_id', cycleId);
  }

  const dimension = searchParams.get('dimension');
  if (dimension) {
    query = query.eq('dimension', dimension);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json({ checkpoints: data });
}

async function createSystemCheckpoint(supabase: SupabaseClient, userId: string, data: CheckpointData) {
  const { data: checkpoint, error } = await supabase
    .from('system_checkpoints')
    .insert({
      user_id: userId,
      ...data
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ checkpoint });
}

async function updateSystemCheckpoint(supabase: SupabaseClient, userId: string, id: string, data: CheckpointData) {
  const { data: checkpoint, error } = await supabase
    .from('system_checkpoints')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ checkpoint });
}

// Helper function for dashboard data
async function getDashboardData(supabase: SupabaseClient, userId: string) {
  try {
    console.log('📊 getDashboardData called for user:', userId);
    
    // TEMPORARY: Return simple mock data to test authentication
    const mockDashboard = {
      activeCycle: null,
      healthCheck: {
        latest: null,
        trends: null,
        history: []
      },
      archetypes: {
        current: [],
        count: 0
      },
      quickWins: {
        total: 0,
        completed: 0,
        in_progress: 0,
        pending: 0,
        high_impact: 0
      },
      strategy: {
        total: 0,
        testing: 0,
        validated: 0,
        invalidated: 0,
        high_confidence: 0
      },
      decisions: {
        total: 0,
        active: 0,
        under_review: 0,
        high_impact: 0
      },
      feedback: {
        total: 0,
        requiring_action: 0,
        by_module: {},
        by_sentiment: {
          positive: 0,
          neutral: 0,
          negative: 0
        }
      },
      insights: {
        total: 0,
        by_dimension: {
          efficiency: 0,
          effectiveness: 0,
          excellence: 0,
          all: 0
        },
        implemented: 0,
        high_impact: 0,
        high_confidence: 0
      },
      checkpoints: {
        total: 0,
        by_dimension: {
          efficiency: 0,
          effectiveness: 0,
          excellence: 0
        },
        on_track: 0,
        at_risk: 0,
        behind: 0,
        exceeded: 0
      },
      loopProgress: {
        total: 0,
        efficiency: 0,
        effectiveness: 0,
        excellence: 0,
        currentPhase: 'Efficiency',
        recommendations: ['Welcome! Start by taking a health check to assess your current state.']
      },
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Returning mock dashboard data');
    return NextResponse.json({
      dashboard: mockDashboard
    });

    /* ORIGINAL CODE - COMMENTED OUT FOR TESTING
    // Get current active cycle
    const { data: activeCycle } = await supabase
      .from('review_cycles')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent health check data with trends
    const { data: healthCheckHistory } = await supabase
      .from('health_check_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    const latestHealthCheck = healthCheckHistory?.[0];

    // Calculate health trends
    const healthTrends = healthCheckHistory && healthCheckHistory.length >= 2 ? {
      efficiency_trend: healthCheckHistory[0].efficiency_score - healthCheckHistory[1].efficiency_score,
      effectiveness_trend: healthCheckHistory[0].effectiveness_score - healthCheckHistory[1].effectiveness_score,
      excellence_trend: healthCheckHistory[0].excellence_score - healthCheckHistory[1].excellence_score
    } : null;

    // Get current archetypes and patterns
    const { data: currentArchetypes } = await supabase
      .from('archetypes')
      .select('*, system_archetypes(name, description)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('detected_at', { ascending: false });

    // Get quick wins summary with status breakdown
    const { data: quickWinsSummary } = await supabase
      .from('quick_wins')
      .select('status, priority, category, estimated_impact')
      .eq('user_id', userId);

    const quickWinsStats = quickWinsSummary ? {
      total: quickWinsSummary.length,
      completed: quickWinsSummary.filter(qw => qw.status === 'Completed').length,
      in_progress: quickWinsSummary.filter(qw => qw.status === 'In Progress').length,
      pending: quickWinsSummary.filter(qw => qw.status === 'Pending').length,
      high_impact: quickWinsSummary.filter(qw => qw.estimated_impact === 'High').length
    } : null;

    // Get strategy hypotheses status
    const { data: strategyHypotheses } = await supabase
      .from('strategy_hypotheses')
      .select('status, confidence_level, impact_area')
      .eq('user_id', userId);

    const strategyStats = strategyHypotheses ? {
      total: strategyHypotheses.length,
      testing: strategyHypotheses.filter(h => h.status === 'Testing').length,
      validated: strategyHypotheses.filter(h => h.status === 'Validated').length,
      invalidated: strategyHypotheses.filter(h => h.status === 'Invalidated').length,
      high_confidence: strategyHypotheses.filter(h => h.confidence_level === 'High').length
    } : null;

    // Get strategic decisions summary
    const { data: strategicDecisions } = await supabase
      .from('strategic_decisions')
      .select('decision_status, impact_level, decision_category')
      .eq('user_id', userId);

    const decisionsStats = strategicDecisions ? {
      total: strategicDecisions.length,
      active: strategicDecisions.filter(d => d.decision_status === 'Active').length,
      under_review: strategicDecisions.filter(d => d.decision_status === 'Under Review').length,
      high_impact: strategicDecisions.filter(d => d.impact_level === 'High').length
    } : null;

    // Get feedback entries count by category and module
    const { data: feedbackSummary } = await supabase
      .from('feedback_entries')
      .select('category, feedback_type, module_source, requires_action, action_status, sentiment')
      .eq('user_id', userId);

    const feedbackStats = feedbackSummary ? {
      total: feedbackSummary.length,
      requiring_action: feedbackSummary.filter(f => f.requires_action && f.action_status !== 'Completed').length,
      by_module: feedbackSummary.reduce((acc, f) => {
        if (f.module_source) {
          acc[f.module_source] = (acc[f.module_source] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      by_sentiment: {
        positive: feedbackSummary.filter(f => f.sentiment === 'Positive').length,
        neutral: feedbackSummary.filter(f => f.sentiment === 'Neutral').length,
        negative: feedbackSummary.filter(f => f.sentiment === 'Negative').length
      }
    } : null;

    // Get insights count by type and implementation status
    const { data: insightsSummary } = await supabase
      .from('learning_insights')
      .select('insight_type, applies_to_dimension, implementation_status, potential_impact, confidence_level')
      .eq('user_id', userId);

    const insightsStats = insightsSummary ? {
      total: insightsSummary.length,
      by_dimension: {
        efficiency: insightsSummary.filter(i => i.applies_to_dimension === 'Efficiency').length,
        effectiveness: insightsSummary.filter(i => i.applies_to_dimension === 'Effectiveness').length,
        excellence: insightsSummary.filter(i => i.applies_to_dimension === 'Excellence').length,
        all: insightsSummary.filter(i => i.applies_to_dimension === 'All').length
      },
      implemented: insightsSummary.filter(i => i.implementation_status === 'Completed').length,
      high_impact: insightsSummary.filter(i => i.potential_impact === 'High').length,
      high_confidence: insightsSummary.filter(i => i.confidence_level === 'High').length
    } : null;

    // Get system checkpoints status
    const { data: checkpoints } = await supabase
      .from('system_checkpoints')
      .select('dimension, status, progress_percentage, metric_type')
      .eq('user_id', userId);

    const checkpointsStats = checkpoints ? {
      total: checkpoints.length,
      by_dimension: {
        efficiency: checkpoints.filter(c => c.dimension === 'Efficiency').length,
        effectiveness: checkpoints.filter(c => c.dimension === 'Effectiveness').length,
        excellence: checkpoints.filter(c => c.dimension === 'Excellence').length
      },
      on_track: checkpoints.filter(c => c.status === 'On_Track').length,
      at_risk: checkpoints.filter(c => c.status === 'At_Risk').length,
      behind: checkpoints.filter(c => c.status === 'Behind').length,
      exceeded: checkpoints.filter(c => c.status === 'Exceeded').length
    } : null;

    // Calculate Triple E Loop progress
    const loopProgress = calculateTripleEProgress({
      healthCheck: latestHealthCheck,
      archetypes: currentArchetypes,
      quickWins: quickWinsStats,
      strategy: strategyStats,
      decisions: decisionsStats,
      insights: insightsStats
    });

    return NextResponse.json({
      dashboard: {
        activeCycle,
        healthCheck: {
          latest: latestHealthCheck,
          trends: healthTrends,
          history: healthCheckHistory
        },
        archetypes: {
          current: currentArchetypes,
          count: currentArchetypes?.length || 0
        },
        quickWins: quickWinsStats,
        strategy: strategyStats,
        decisions: decisionsStats,
        feedback: feedbackStats,
        insights: insightsStats,
        checkpoints: checkpointsStats,
        loopProgress,
        lastUpdated: new Date().toISOString()
      }
    });
    */
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    throw error;
  }
}

// Helper function to calculate Triple E Loop progress
function calculateTripleEProgress(data: any) {
  const { healthCheck, archetypes, quickWins, strategy, decisions, insights } = data;
  
  // Efficiency Phase Progress (0-33%)
  let efficiencyProgress = 0;
  if (healthCheck?.latest) {
    efficiencyProgress = Math.min(33, (healthCheck.latest.efficiency_score / 100) * 33);
  }
  
  // Effectiveness Phase Progress (33-66%)
  let effectivenessProgress = 0;
  if (healthCheck?.latest && quickWins && strategy) {
    const effectivenessScore = (
      (healthCheck.latest.effectiveness_score / 100) +
      (quickWins.completed / Math.max(quickWins.total, 1)) +
      (strategy.validated / Math.max(strategy.total, 1))
    ) / 3;
    effectivenessProgress = Math.min(33, effectivenessScore * 33);
  }
  
  // Excellence Phase Progress (66-100%)
  let excellenceProgress = 0;
  if (healthCheck?.latest && insights && decisions) {
    const excellenceScore = (
      (healthCheck.latest.excellence_score / 100) +
      (insights.implemented / Math.max(insights.total, 1)) +
      (decisions.active / Math.max(decisions.total, 1))
    ) / 3;
    excellenceProgress = Math.min(34, excellenceScore * 34);
  }
  
  const totalProgress = efficiencyProgress + effectivenessProgress + excellenceProgress;
  
  return {
    total: Math.round(totalProgress),
    efficiency: Math.round(efficiencyProgress),
    effectiveness: Math.round(effectivenessProgress),
    excellence: Math.round(excellenceProgress),
    currentPhase: totalProgress < 33 ? 'Efficiency' : 
                  totalProgress < 66 ? 'Effectiveness' : 'Excellence',
    recommendations: generatePhaseRecommendations(totalProgress, data)
  };
}

// Generate recommendations based on current phase
function generatePhaseRecommendations(progress: number, data: any) {
  const recommendations = [];
  
  if (progress < 33) {
    // Efficiency phase recommendations
    if (data.healthCheck?.latest?.efficiency_score < 70) {
      recommendations.push("Focus on improving operational efficiency - consider running a new health check");
    }
    if (data.archetypes?.current?.length > 0) {
      recommendations.push("Address detected system archetypes to remove efficiency barriers");
    }
  } else if (progress < 66) {
    // Effectiveness phase recommendations
    if (data.quickWins?.completed / Math.max(data.quickWins?.total, 1) < 0.7) {
      recommendations.push("Complete more quick wins to build momentum");
    }
    if (data.strategy?.testing / Math.max(data.strategy?.total, 1) < 0.5) {
      recommendations.push("Test more strategic hypotheses to validate effectiveness");
    }
  } else {
    // Excellence phase recommendations
    if (data.insights?.implemented / Math.max(data.insights?.total, 1) < 0.6) {
      recommendations.push("Implement more learning insights to drive excellence");
    }
    if (data.decisions?.active / Math.max(data.decisions?.total, 1) < 0.8) {
      recommendations.push("Review and activate strategic decisions for sustained excellence");
    }
  }
  
  return recommendations;
} 