import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const logs: string[] = [];
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    logs.push('Unauthorized: No user found');
    return NextResponse.json({ error: 'Unauthorized', logs }, { status: 401 });
  }

  // Parse any request body data if needed
  try {
    await req.json();
  } catch {
    // No body or invalid JSON, continue with generation
  }

  logs.push('Starting research-based quick wins generation...');

  // First, detect archetypes for the user
  const { data: detectedArchetypes, error: detectionError } = await supabase
    .rpc('detect_archetypes_for_user', { p_user_id: user.id });

  if (detectionError) {
    logs.push('Error detecting archetypes: ' + detectionError.message);
    return NextResponse.json({ error: detectionError.message, logs }, { status: 500 });
  }

  logs.push(`Detected ${detectedArchetypes?.length || 0} archetypes`);

  if (!detectedArchetypes || detectedArchetypes.length === 0) {
    logs.push('No archetypes detected, generating fallback quick wins.');
    const fallbackQuickWins = [
      {
        user_id: user.id,
        title: 'Start a Weekly Team Huddle',
        description: 'Hold a 15-minute meeting every Monday to align on priorities and blockers.',
        source: 'system',
        archetype: null,
        dimension: 'Efficiency',
        impact_level: 'High',
        status: 'To Do',
        notes: '',
      },
      {
        user_id: user.id,
        title: 'Implement One-on-One Check-ins',
        description: 'Schedule regular 30-minute one-on-one meetings with team members to discuss progress and challenges.',
        source: 'system',
        archetype: null,
        dimension: 'Excellence',
        impact_level: 'High',
        status: 'To Do',
        notes: '',
      }
    ];

    // Insert fallback quick wins
    const { error: insertError } = await supabase.from('quick_wins').insert(fallbackQuickWins);
    if (insertError) {
      logs.push('Error inserting fallback quick wins: ' + insertError.message);
      return NextResponse.json({ error: insertError.message, logs }, { status: 500 });
    }

    logs.push('Fallback quick wins inserted successfully.');
    return NextResponse.json({ success: true, quickWins: fallbackQuickWins, logs });
  }

  // Get quick win templates for detected archetypes
  const archetypeNames = detectedArchetypes.map((a: { archetype_name: string }) => a.archetype_name);
  const { data: quickWinTemplates, error: templatesError } = await supabase
    .from('quick_win_templates')
    .select('*')
    .in('archetype_name', archetypeNames);

  if (templatesError) {
    logs.push('Error fetching quick win templates: ' + templatesError.message);
    return NextResponse.json({ error: templatesError.message, logs }, { status: 500 });
  }

  logs.push(`Found ${quickWinTemplates?.length || 0} quick win templates`);

  if (!quickWinTemplates || quickWinTemplates.length === 0) {
    logs.push('No quick win templates found for detected archetypes.');
    return NextResponse.json({ error: 'No quick win templates available', logs }, { status: 404 });
  }

  // Convert templates to quick win inserts
  const quickWins = quickWinTemplates.map((template: {
    title: string;
    description: string;
    impact_level: string;
    archetype_name: string;
  }) => {
    const archetype = detectedArchetypes.find((a: { archetype_name: string; source_dimension: string }) => 
      a.archetype_name === template.archetype_name
    );
    return {
      user_id: user.id,
      title: template.title,
      description: template.description,
      source: 'system',
      archetype: template.archetype_name,
      dimension: archetype?.source_dimension || 'Efficiency',
      impact_level: template.impact_level,
      status: 'To Do',
      notes: '',
    };
  });

  logs.push(`Generated ${quickWins.length} research-based quick wins`);

  // Clear existing system quick wins for this user
  await supabase
    .from('quick_wins')
    .delete()
    .eq('user_id', user.id)
    .eq('source', 'system');

  // Insert new research-based quick wins
  const { error: insertError } = await supabase.from('quick_wins').insert(quickWins);
  if (insertError) {
    logs.push('Error inserting quick wins: ' + insertError.message);
    return NextResponse.json({ error: insertError.message, logs }, { status: 500 });
  }

  logs.push('Research-based quick wins inserted successfully.');
  return NextResponse.json({ success: true, quickWins, logs });
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: quickWins, error } = await supabase
    .from('quick_wins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quickWins: quickWins || [] });
} 