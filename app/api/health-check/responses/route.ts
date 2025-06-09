import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

    // Get user's health check responses
    const { data: responses, error } = await supabase
      .from('health_check_responses')
      .select('question_id, response_value, dimension')
      .eq('user_id', user.id)
      .order('question_id');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    // Calculate dimension averages
    const efficiencyScores = responses?.filter(r => r.dimension === 'Efficiency').map(r => r.response_value) || [];
    const effectivenessScores = responses?.filter(r => r.dimension === 'Effectiveness').map(r => r.response_value) || [];
    const excellenceScores = responses?.filter(r => r.dimension === 'Excellence').map(r => r.response_value) || [];

    const averages = {
      efficiency: efficiencyScores.length > 0 ? efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length : 0,
      effectiveness: effectivenessScores.length > 0 ? effectivenessScores.reduce((a, b) => a + b, 0) / effectivenessScores.length : 0,
      excellence: excellenceScores.length > 0 ? excellenceScores.reduce((a, b) => a + b, 0) / excellenceScores.length : 0,
      overall: responses?.length > 0 ? responses.reduce((sum, r) => sum + r.response_value, 0) / responses.length : 0
    };

    // Highlight key questions for archetype detection
    const keyQuestions = {
      q4: responses?.find(r => r.question_id === 4),   // Root cause
      q5: responses?.find(r => r.question_id === 5),   // Coordination  
      q7: responses?.find(r => r.question_id === 7),   // Resource allocation
      q12: responses?.find(r => r.question_id === 12), // Meeting targets
      q13: responses?.find(r => r.question_id === 13), // Upholding standards
      q17: responses?.find(r => r.question_id === 17), // Psychological safety
      q18: responses?.find(r => r.question_id === 18), // Team morale
      q20: responses?.find(r => r.question_id === 20)  // Shared purpose
    };

    return NextResponse.json({
      user_id: user.id,
      total_responses: responses?.length || 0,
      responses: responses || [],
      averages,
      keyQuestions,
      drifting_goals_check: {
        q13_score: keyQuestions.q13?.response_value || 'No response',
        q12_score: keyQuestions.q12?.response_value || 'No response',
        effectiveness_avg: averages.effectiveness,
        meets_drifting_goals_criteria: 
          (keyQuestions.q13?.response_value || 99) <= 2 && 
          ((keyQuestions.q12?.response_value || 0) >= 3 || averages.effectiveness < 2.8)
      }
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 