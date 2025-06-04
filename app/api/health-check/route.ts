import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

interface HealthCheckResponse {
  questionId: number;
  score: number;
  dimension: string;
}

export async function GET() {
  console.log('Health Check API: GET request received');
  
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Health Check API: Session:', session);
    
    if (sessionError) {
      console.error('Health Check API: Session error:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!session) {
      console.log('Health Check API: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get health check questions
    const { data: questions, error: questionsError } = await supabase
      .from('health_check_questions')
      .select('*')
      .order('id');
    
    if (questionsError) {
      console.error('Health Check API: Questions error:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
    
    return NextResponse.json({
      questions: questions || [],
    });
    
  } catch (error) {
    console.error('Health Check API: Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { responses } = await request.json();
    console.log('Received health check responses:', responses);

    // Store responses with mock user ID
    const { data: responseData, error: responseError } = await supabase
      .from('health_check_responses')
      .insert({
        responses: responses,
        user_id: 'dev-user-id'
      })
      .select()
      .single();

    if (responseError) {
      console.error('Health Check API: Response error:', responseError);
      return NextResponse.json({ error: 'Failed to store responses' }, { status: 500 });
    }

    // Calculate scores
    const scores = {
      Efficiency: calculateDimensionScore(responses, 'Efficiency'),
      Effectiveness: calculateDimensionScore(responses, 'Effectiveness'),
      Excellence: calculateDimensionScore(responses, 'Excellence')
    };

    // Store results with mock user ID
    const { data: resultData, error: resultError } = await supabase
      .from('health_check_results')
      .insert({
        response_id: responseData.id,
        scores: scores,
        user_id: 'dev-user-id'
      })
      .select()
      .single();

    if (resultError) {
      console.error('Health Check API: Result error:', resultError);
      return NextResponse.json({ error: 'Failed to store results' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Health check completed successfully',
      resultId: resultData.id
    });
  } catch (error) {
    console.error('Health Check API: Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateDimensionScore(responses: HealthCheckResponse[], dimension: string): number {
  const dimensionResponses = responses.filter(r => r.dimension === dimension);
  if (dimensionResponses.length === 0) return 0;
  
  const sum = dimensionResponses.reduce((acc, r) => acc + r.score, 0);
  return sum / dimensionResponses.length;
} 