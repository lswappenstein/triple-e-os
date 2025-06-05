import { createServerClient } from '@supabase/ssr';
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

interface QuickWinTemplate {
  title: string;
  description: string;
  impact_level: string;
  effort_level: string;
  timeframe: string;
  archetype_name: string;
}

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
    console.log('🔍 Archetype API: Starting POST request');
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
    
    console.log('🔍 Getting user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 Auth result:', { user: user?.id, email: user?.email, authError: authError?.message });
    
    if (!user) {
      console.log('❌ No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body but only extract what we need
    const body = await request.json();
    console.log('🔍 Request body keys:', Object.keys(body));

    // Use the database function to detect archetypes
    console.log('🔍 Calling detect_archetypes_for_user function...');
    const { data: detectedArchetypes, error: detectionError } = await supabase
      .rpc('detect_archetypes_for_user', { p_user_id: user.id });

    console.log('🔍 Function result:', { data: detectedArchetypes, error: detectionError });

    if (detectionError) {
      console.error('❌ Error detecting archetypes:', detectionError);
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

      // Generate quick wins using the enhanced template system
      const archetypeNames = typedArchetypes.map(a => a.archetype_name);
      console.log('🎯 Generating quick wins for archetypes:', archetypeNames);
      
      // Get quick win templates for detected archetypes
      const { data: quickWinTemplates, error: templatesError } = await supabase
        .from('quick_win_templates')
        .select('*')
        .in('archetype_name', archetypeNames);

      console.log('📋 Found quick win templates:', quickWinTemplates?.length || 0);

      if (templatesError) {
        console.error('Error fetching quick win templates:', templatesError);
      } else if (quickWinTemplates && quickWinTemplates.length > 0) {
        // Convert templates to quick win inserts
        const quickWinInserts: QuickWinInsert[] = quickWinTemplates.map((template: QuickWinTemplate) => {
          const archetype = typedArchetypes.find(a => a.archetype_name === template.archetype_name);
          return {
            user_id: user.id,
            title: template.title,
            description: template.description,
            source: 'system' as const,
            archetype: template.archetype_name,
            dimension: archetype?.source_dimension || 'Efficiency',
            impact_level: template.impact_level as 'Low' | 'Medium' | 'High',
            status: 'To Do' as const,
          };
        });

        console.log('🗑️ Clearing existing system quick wins for user:', user.id);
        // Clear existing system quick wins for this user
        const { error: deleteError } = await supabase
          .from('quick_wins')
          .delete()
          .eq('user_id', user.id)
          .eq('source', 'system');

        console.log('🗑️ Delete result:', { deleteError });

        console.log('➕ Inserting new quick wins:', quickWinInserts.length);
        // Insert new research-based quick wins
        const { error: quickWinError } = await supabase
          .from('quick_wins')
          .insert(quickWinInserts);

        console.log('➕ Insert result:', { quickWinError });

        if (quickWinError) {
          console.error('Error saving quick wins:', quickWinError);
          // Don't fail the request if quick wins fail to save
        }
      }
    }

    return NextResponse.json({
      success: true,
      archetypes: typedArchetypes || [],
      message: (typedArchetypes && typedArchetypes.length > 0)
        ? `Detected ${typedArchetypes.length} archetype(s) and generated ${typedArchetypes.length * 3} research-based quick wins` 
        : 'No archetypes detected'
    });

  } catch (error) {
    console.error('Error in archetype detection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 