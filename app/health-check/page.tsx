'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Question {
  id: number;
  dimension: 'Efficiency' | 'Effectiveness' | 'Excellence';
  category: string;
  text: string;
  tooltip: string;
}

interface Response {
  question_id: number;
  response_value: number;
  comment?: string;
}

export default function HealthCheckPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<number, Response>>({});
  const [currentDimension, setCurrentDimension] = useState<'Efficiency' | 'Effectiveness' | 'Excellence'>('Efficiency');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('health_check_questions')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    setQuestions(data || []);
  };

  const handleResponseChange = (questionId: number, value: number, comment?: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { question_id: questionId, response_value: value, comment }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get the current organization ID (you'll need to implement this)
      const orgId = 'your-org-id'; // TODO: Get this from your org context

      const responseValues = Object.values(responses);
      const { error } = await supabase
        .from('health_check_responses')
        .insert(responseValues.map(response => ({
          ...response,
          user_id: user.id,
          org_id: orgId
        })));

      if (error) throw error;

      // Calculate and save results
      await calculateAndSaveResults(orgId);

    } catch (error) {
      console.error('Error submitting responses:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAndSaveResults = async (orgId: string) => {
    // TODO: Implement result calculation and saving
    // This will calculate average scores per dimension and save to health_check_results
  };

  const filteredQuestions = questions.filter(q => q.dimension === currentDimension);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Organization Health Check</h1>
      
      <Tabs defaultValue="Efficiency" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Efficiency" onClick={() => setCurrentDimension('Efficiency')}>
            Efficiency
          </TabsTrigger>
          <TabsTrigger value="Effectiveness" onClick={() => setCurrentDimension('Effectiveness')}>
            Effectiveness
          </TabsTrigger>
          <TabsTrigger value="Excellence" onClick={() => setCurrentDimension('Excellence')}>
            Excellence
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentDimension}>
          <div className="space-y-6">
            {filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{question.text}</CardTitle>
                  <p className="text-sm text-muted-foreground">{question.tooltip}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={responses[question.id]?.response_value === value ? "default" : "outline"}
                        onClick={() => handleResponseChange(question.id, value)}
                        className="w-12 h-12"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-32"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
} 