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

  // Fetch latest health check results (per dimension)
  const { data: results, error: resultsError } = await supabase
    .from('health_check_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (resultsError) {
    logs.push('Error fetching health_check_results: ' + resultsError.message);
    return NextResponse.json({ error: resultsError.message, logs }, { status: 500 });
  }
  logs.push(`Fetched ${results?.length || 0} health_check_results`);

  // Fetch latest archetypes
  const { data: archetypes, error: archetypesError } = await supabase
    .from('archetypes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (archetypesError) {
    logs.push('Error fetching archetypes: ' + archetypesError.message);
    return NextResponse.json({ error: archetypesError.message, logs }, { status: 500 });
  }
  logs.push(`Fetched ${archetypes?.length || 0} archetypes`);

  // Example mapping logic: pick the lowest scoring dimension and top archetype
  const lowResults = [...(results || [])].sort((a, b) => (a.average_score ?? 0) - (b.average_score ?? 0));
  const topArchetypes = (archetypes || []).slice(0, 2);

  // Example quick wins (replace with your real mapping logic)
  const quickWins = [];
  if (lowResults[0]) {
    quickWins.push({
      user_id: user.id,
      title: `Improve ${lowResults[0].dimension} processes`,
      description: `Focus on improving ${lowResults[0].dimension.toLowerCase()} based on your recent health check results.`,
      source: 'system',
      archetype: topArchetypes[0]?.archetype_name || null,
      dimension: lowResults[0].dimension,
      impact_level: 'High',
      status: 'To Do',
      notes: '',
    });
  }
  if (topArchetypes[0]) {
    quickWins.push({
      user_id: user.id,
      title: `Address ${topArchetypes[0].archetype_name} pattern`,
      description: topArchetypes[0].insight,
      source: 'system',
      archetype: topArchetypes[0].archetype_name,
      dimension: topArchetypes[0].source_dimension,
      impact_level: 'High',
      status: 'To Do',
      notes: '',
    });
  }
  if (lowResults[1]) {
    quickWins.push({
      user_id: user.id,
      title: `Boost ${lowResults[1].dimension} effectiveness`,
      description: `Take action to improve ${lowResults[1].dimension.toLowerCase()} in your organization.`,
      source: 'system',
      archetype: topArchetypes[1]?.archetype_name || null,
      dimension: lowResults[1].dimension,
      impact_level: 'Medium',
      status: 'To Do',
      notes: '',
    });
  }
  // Add up to 5 quick wins
  while (quickWins.length < 3 && lowResults[quickWins.length]) {
    quickWins.push({
      user_id: user.id,
      title: `Enhance ${lowResults[quickWins.length].dimension} practices`,
      description: `Work on ${lowResults[quickWins.length].dimension.toLowerCase()} for better results.`,
      source: 'system',
      archetype: null,
      dimension: lowResults[quickWins.length].dimension,
      impact_level: 'Medium',
      status: 'To Do',
      notes: '',
    });
  }

  // Fallback: if no quick wins, generate a generic one for demo/testing
  if (quickWins.length === 0) {
    logs.push('No data found, generating fallback quick win.');
    quickWins.push({
      user_id: user.id,
      title: 'Start a Weekly Team Huddle',
      description: 'Hold a 15-minute meeting every Monday to align on priorities and blockers.',
      source: 'system',
      archetype: null,
      dimension: 'Efficiency',
      impact_level: 'High',
      status: 'To Do',
      notes: '',
    });
  }

  logs.push(`Generated ${quickWins.length} quick wins`);

  // Insert quick wins
  const { error: insertError } = await supabase.from('quick_wins').insert(quickWins);
  if (insertError) {
    logs.push('Error inserting quick wins: ' + insertError.message);
    return NextResponse.json({ error: insertError.message, logs }, { status: 500 });
  }

  logs.push('Quick wins inserted successfully.');
  return NextResponse.json({ success: true, quickWins, logs });
} 