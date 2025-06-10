import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's strategic decisions
    const { data: decisions, error: decisionsError } = await supabase
      .from('strategic_decisions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (decisionsError) {
      console.error('Error fetching strategic decisions:', decisionsError);
      return NextResponse.json({ error: 'Failed to fetch strategic decisions' }, { status: 500 });
    }

    // Also get validated strategy hypotheses for context
    const { data: validatedHypotheses, error: hypothesesError } = await supabase
      .from('strategy_hypotheses')
      .select('id, challenge_area, hypothesis, status, priority_level')
      .eq('user_id', user.id)
      .eq('status', 'Validated')
      .order('created_at', { ascending: false });

    if (hypothesesError) {
      console.error('Error fetching validated hypotheses:', hypothesesError);
    }

    return NextResponse.json({
      decisions: decisions || [],
      validatedHypotheses: validatedHypotheses || [],
    });

  } catch (error) {
    console.error('Error fetching strategic decisions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      winning_aspiration,
      where_to_play,
      how_to_win,
      capabilities,
      management_systems,
      context_summary,
      supporting_hypotheses,
      coherence_notes,
      implementation_notes,
      status = 'Draft'
    } = body;

    // Create new strategic decision
    const { data, error } = await supabase
      .from('strategic_decisions')
      .insert({
        user_id: user.id,
        winning_aspiration,
        where_to_play,
        how_to_win,
        capabilities,
        management_systems,
        context_summary,
        supporting_hypotheses,
        coherence_notes,
        implementation_notes,
        status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating strategic decision:', error);
      return NextResponse.json({ error: 'Failed to create strategic decision' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      decision: data,
      message: 'Strategic decision created successfully'
    });

  } catch (error) {
    console.error('Error in strategic decision creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Decision ID is required' }, { status: 400 });
    }

    // Update strategic decision
    const { data, error } = await supabase
      .from('strategic_decisions')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own decisions
      .select()
      .single();

    if (error) {
      console.error('Error updating strategic decision:', error);
      return NextResponse.json({ error: 'Failed to update strategic decision' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Strategic decision not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      decision: data,
      message: 'Strategic decision updated successfully'
    });

  } catch (error) {
    console.error('Error in strategic decision update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Decision ID is required' }, { status: 400 });
    }

    // Delete strategic decision
    const { error } = await supabase
      .from('strategic_decisions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own decisions

    if (error) {
      console.error('Error deleting strategic decision:', error);
      return NextResponse.json({ error: 'Failed to delete strategic decision' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Strategic decision deleted successfully'
    });

  } catch (error) {
    console.error('Error in strategic decision deletion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 