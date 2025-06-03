import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
// import { Database } from '@/lib/database.types'; // Commented out due to missing module

type AnyArchetype = any;
type AnyRule = any;
type AnyCondition = any;
type AnyResponse = any;

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's detected archetypes
    const { data: archetypes, error: archetypesError } = await supabase
      .from('archetypes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (archetypesError) {
      console.error('Error fetching archetypes:', archetypesError);
      return NextResponse.json({ error: 'Failed to fetch archetypes' }, { status: 500 });
    }

    // Get user's quick wins
    const { data: quickWins, error: quickWinsError } = await supabase
      .from('quick_wins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (quickWinsError) {
      console.error('Error fetching quick wins:', quickWinsError);
      return NextResponse.json({ error: 'Failed to fetch quick wins' }, { status: 500 });
    }

    return NextResponse.json({
      archetypes: archetypes || [],
      quickWins: quickWins || [],
    });

  } catch (error) {
    console.error('Error fetching archetype data:', error);
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

    const { healthCheckResultId, responses } = await request.json();

    // Use the database function to detect archetypes
    const { data: detectedArchetypes, error: detectionError } = await supabase
      .rpc('detect_archetypes_for_user', { p_user_id: user.id });

    if (detectionError) {
      console.error('Error detecting archetypes:', detectionError);
      return NextResponse.json({ error: 'Failed to detect archetypes' }, { status: 500 });
    }

    // Save detected archetypes to the user's archetypes table
    if (detectedArchetypes && detectedArchetypes.length > 0) {
      const archetypeInserts = detectedArchetypes.map((archetype: any) => ({
        user_id: user.id,
        archetype_name: archetype.archetype_name,
        source_dimension: archetype.source_dimension,
        insight: archetype.insight,
      }));

      // Clear existing archetypes for this user first
      await supabase
        .from('archetypes')
        .delete()
        .eq('user_id', user.id);

      // Insert new detected archetypes
      const { error: insertError } = await supabase
        .from('archetypes')
        .insert(archetypeInserts);

      if (insertError) {
        console.error('Error saving archetypes:', insertError);
        return NextResponse.json({ error: 'Failed to save archetypes' }, { status: 500 });
      }

      // Generate system quick wins for detected archetypes
      const quickWinInserts = detectedArchetypes.map((archetype: any) => ({
        user_id: user.id,
        title: `Address ${archetype.archetype_name}`,
        description: `Focus on improving ${archetype.source_dimension.toLowerCase()} to address the ${archetype.archetype_name} pattern.`,
        source: 'system',
        archetype: archetype.archetype_name,
        dimension: archetype.source_dimension,
        impact_level: 'High',
        status: 'To Do',
      }));

      // Clear existing system quick wins for this user
      await supabase
        .from('quick_wins')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'system');

      // Insert new system quick wins
      const { error: quickWinError } = await supabase
        .from('quick_wins')
        .insert(quickWinInserts);

      if (quickWinError) {
        console.error('Error saving quick wins:', quickWinError);
        // Don't fail the request if quick wins fail to save
      }
    }

    return NextResponse.json({
      success: true,
      archetypes: detectedArchetypes || [],
      message: detectedArchetypes?.length > 0 
        ? `Detected ${detectedArchetypes.length} archetype(s)` 
        : 'No archetypes detected'
    });

  } catch (error) {
    console.error('Error in archetype detection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 