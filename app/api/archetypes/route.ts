import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
// import { Database } from '@/lib/database.types'; // Commented out due to missing module

// Proper TypeScript interfaces instead of any types
interface DetectedArchetype {
  archetype_name: string;
  source_dimension: 'Efficiency' | 'Effectiveness' | 'Excellence';
  insight: string;
}

interface ArchetypeInsert {
  user_id: string;
  archetype_name: string;
  source_dimension: string;
  insight: string;
}

interface QuickWinInsert {
  user_id: string;
  title: string;
  description: string;
  source: 'system' | 'user';
  archetype: string;
  dimension: string;
  impact_level: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
}

interface UserArchetype {
  id: string;
  user_id: string;
  archetype_name: string;
  source_dimension: string;
  insight: string;
  created_at: string;
}

interface UserQuickWin {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source: string;
  archetype?: string;
  dimension: string;
  impact_level?: string;
  status: string;
  notes?: string;
  created_at: string;
  last_updated: string;
}

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
      archetypes: (archetypes as UserArchetype[]) || [],
      quickWins: (quickWins as UserQuickWin[]) || [],
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

    // Parse request body but only extract what we need
    await request.json();

    // Use the database function to detect archetypes
    const { data: detectedArchetypes, error: detectionError } = await supabase
      .rpc('detect_archetypes_for_user', { p_user_id: user.id });

    if (detectionError) {
      console.error('Error detecting archetypes:', detectionError);
      return NextResponse.json({ error: 'Failed to detect archetypes' }, { status: 500 });
    }

    // Type guard and save detected archetypes to the user's archetypes table
    const typedArchetypes = detectedArchetypes as DetectedArchetype[] | null;
    if (typedArchetypes && Array.isArray(typedArchetypes) && typedArchetypes.length > 0) {
      const archetypeInserts: ArchetypeInsert[] = typedArchetypes.map((archetype: DetectedArchetype) => ({
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
      const quickWinInserts: QuickWinInsert[] = typedArchetypes.map((archetype: DetectedArchetype) => ({
        user_id: user.id,
        title: `Address ${archetype.archetype_name}`,
        description: `Focus on improving ${archetype.source_dimension.toLowerCase()} to address the ${archetype.archetype_name} pattern.`,
        source: 'system' as const,
        archetype: archetype.archetype_name,
        dimension: archetype.source_dimension,
        impact_level: 'High' as const,
        status: 'To Do' as const,
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
      archetypes: typedArchetypes || [],
      message: (typedArchetypes && typedArchetypes.length > 0)
        ? `Detected ${typedArchetypes.length} archetype(s)` 
        : 'No archetypes detected'
    });

  } catch (error) {
    console.error('Error in archetype detection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 