import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's strategy hypotheses
    const { data: hypotheses, error: hypothesesError } = await supabase
      .from('strategy_hypotheses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (hypothesesError) {
      console.error('Error fetching strategy hypotheses:', hypothesesError);
      return NextResponse.json({ error: 'Failed to fetch strategy hypotheses' }, { status: 500 });
    }

    return NextResponse.json({
      hypotheses: hypotheses || [],
    });

  } catch (error) {
    console.error('Error fetching strategy hypotheses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      challenge_area,
      current_structure,
      mental_model,
      leverage_point,
      hypothesis,
      priority_level = 'Medium',
      expected_outcome,
      owner_notes
    } = body;

    // Validate required fields
    if (!challenge_area || !current_structure || !leverage_point || !hypothesis) {
      return NextResponse.json(
        { error: 'Missing required fields: challenge_area, current_structure, leverage_point, hypothesis' },
        { status: 400 }
      );
    }

    // Create new strategy hypothesis
    const { data, error } = await supabase
      .from('strategy_hypotheses')
      .insert({
        user_id: user.id,
        challenge_area,
        current_structure,
        mental_model,
        leverage_point,
        hypothesis,
        priority_level,
        expected_outcome,
        owner_notes,
        status: 'Draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating strategy hypothesis:', error);
      return NextResponse.json({ error: 'Failed to create strategy hypothesis' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      hypothesis: data,
      message: 'Strategy hypothesis created successfully'
    });

  } catch (error) {
    console.error('Error in strategy hypothesis creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hypothesis ID is required' }, { status: 400 });
    }

    // Update strategy hypothesis
    const { data, error } = await supabase
      .from('strategy_hypotheses')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own hypotheses
      .select()
      .single();

    if (error) {
      console.error('Error updating strategy hypothesis:', error);
      return NextResponse.json({ error: 'Failed to update strategy hypothesis' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Strategy hypothesis not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      hypothesis: data,
      message: 'Strategy hypothesis updated successfully'
    });

  } catch (error) {
    console.error('Error in strategy hypothesis update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hypothesis ID is required' }, { status: 400 });
    }

    // Delete strategy hypothesis
    const { error } = await supabase
      .from('strategy_hypotheses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own hypotheses

    if (error) {
      console.error('Error deleting strategy hypothesis:', error);
      return NextResponse.json({ error: 'Failed to delete strategy hypothesis' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Strategy hypothesis deleted successfully'
    });

  } catch (error) {
    console.error('Error in strategy hypothesis deletion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 