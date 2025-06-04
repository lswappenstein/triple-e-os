import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'cycles':
        return await getReviewCycles(supabase, session.user.id);
      case 'feedback':
        return await getFeedbackEntries(supabase, session.user.id, searchParams);
      case 'insights':
        return await getLearningInsights(supabase, session.user.id, searchParams);
      case 'checkpoints':
        return await getSystemCheckpoints(supabase, session.user.id, searchParams);
      case 'dashboard':
        return await getDashboardData(supabase, session.user.id);
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in review-loop GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'cycle':
        return await createReviewCycle(supabase, session.user.id, data);
      case 'feedback':
        return await createFeedbackEntry(supabase, session.user.id, data);
      case 'insight':
        return await createLearningInsight(supabase, session.user.id, data);
      case 'checkpoint':
        return await createSystemCheckpoint(supabase, session.user.id, data);
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in review-loop POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
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
async function getReviewCycles(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('review_cycles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json({ cycles: data });
}

async function createReviewCycle(supabase: any, userId: string, data: any) {
  const { data: cycle, error } = await supabase
    .from('review_cycles')
    .insert({
      user_id: userId,
      ...data
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json({ cycle });
}

async function updateReviewCycle(supabase: any, userId: string, id: string, data: any) {
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
async function getFeedbackEntries(supabase: any, userId: string, searchParams: URLSearchParams) {
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

async function createFeedbackEntry(supabase: any, userId: string, data: any) {
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

async function updateFeedbackEntry(supabase: any, userId: string, id: string, data: any) {
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
async function getLearningInsights(supabase: any, userId: string, searchParams: URLSearchParams) {
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

async function createLearningInsight(supabase: any, userId: string, data: any) {
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

async function updateLearningInsight(supabase: any, userId: string, id: string, data: any) {
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
async function getSystemCheckpoints(supabase: any, userId: string, searchParams: URLSearchParams) {
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

async function createSystemCheckpoint(supabase: any, userId: string, data: any) {
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

async function updateSystemCheckpoint(supabase: any, userId: string, id: string, data: any) {
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
async function getDashboardData(supabase: any, userId: string) {
  // Get current active cycle
  const { data: activeCycle } = await supabase
    .from('review_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get recent health check data
  const { data: healthCheck } = await supabase
    .from('health_check_responses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get quick wins summary
  const { data: quickWins } = await supabase
    .from('quick_wins')
    .select('status')
    .eq('user_id', userId);

  // Get feedback entries count by category
  const { data: feedbackSummary } = await supabase
    .from('feedback_entries')
    .select('category, feedback_type')
    .eq('user_id', userId);

  // Get insights count by type
  const { data: insightsSummary } = await supabase
    .from('learning_insights')
    .select('insight_type, applies_to_dimension')
    .eq('user_id', userId);

  // Get system checkpoints status
  const { data: checkpoints } = await supabase
    .from('system_checkpoints')
    .select('dimension, status')
    .eq('user_id', userId);

  return NextResponse.json({
    dashboard: {
      activeCycle,
      healthCheck,
      quickWins,
      feedbackSummary,
      insightsSummary,
      checkpoints
    }
  });
} 