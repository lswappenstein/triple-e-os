"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from '@/lib/supabase/client';
import { 
  CheckCircleIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  PlayIcon,
  PauseIcon,
  InfoIcon,
  StarIcon,
  ClockIcon,
  TargetIcon,
  TrendingUpIcon,
  AwardIcon
} from "lucide-react";
import HealthCheckSlider from "@/components/health-check/HealthCheckSlider";

interface Question {
  id: number;
  text: string;
  dimension: string;
  category: string;
  tooltip: string;
}

interface AssessmentResponse {
  score: number;
  comment: string;
  answered: boolean;
}

interface AssessmentState {
  mode: 'intro' | 'assessment' | 'review';
  currentQuestionIndex: number;
  responses: AssessmentResponse[];
  startTime: Date | null;
  lastSaved: Date | null;
}

const questions: Question[] = []; // Will be populated from database

export default function HealthCheckPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionsData, setQuestionsData] = useState<Question[]>([]);

  const [state, setState] = useState<AssessmentState>({
    mode: 'intro',
    currentQuestionIndex: 0,
    responses: [],
    startTime: null,
    lastSaved: null
  });

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('🔍 Starting to load questions...');
        
        // Debug: Log Supabase configuration
        console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('🔧 Supabase Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
        
        // Test authentication first
        const { data: { user }, error: authError } = await createClient().auth.getUser();
        console.log('👤 Current user:', { id: user?.id, email: user?.email, authError });
        
        const { data: dbQuestions, error } = await createClient()
          .from('health_check_questions')
          .select('id, dimension, category, text, tooltip')
          .order('id');
        
        console.log('📊 Database response:', { data: dbQuestions, error });
        
        if (error) {
          console.error('❌ Database error:', error);
          throw error;
        }
        
        if (dbQuestions && dbQuestions.length > 0) {
          console.log('✅ Questions loaded successfully:', dbQuestions.length);
          setQuestionsData(dbQuestions);
          setState(prev => ({
            ...prev,
            responses: Array(dbQuestions.length).fill(null).map(() => ({ 
              score: 0, 
              comment: "", 
              answered: false 
            }))
          }));
        } else {
          console.warn('⚠️ No questions returned from database');
          setError('No health check questions found in the database.');
        }
      } catch (error) {
        console.error('💥 Error loading questions:', error);
        console.error('💥 Error details:', JSON.stringify(error, null, 2));
        
        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'unknown';
        
        console.error('💥 Error message:', errorMessage);
        console.error('💥 Error code:', errorCode);
        setError(`Failed to load health check questions: ${errorMessage}`);
      } finally {
        setQuestionsLoaded(true);
      }
    };

    loadQuestions();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (state.mode === 'assessment' && state.startTime && questionsData.length > 0) {
      const autoSave = setInterval(() => {
        saveProgress();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSave);
    }
  }, [state.mode, state.startTime, questionsData.length]);

  // Load saved progress on mount
  useEffect(() => {
    if (questionsLoaded && questionsData.length > 0) {
      loadSavedProgress();
    }
  }, [questionsLoaded, questionsData.length]);

  const saveProgress = () => {
    try {
      const progressData = {
        responses: state.responses,
        currentQuestionIndex: state.currentQuestionIndex,
        startTime: state.startTime,
        timestamp: new Date()
      };
      localStorage.setItem('healthcheck_progress', JSON.stringify(progressData));
      setState(prev => ({ ...prev, lastSaved: new Date() }));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  };

  const loadSavedProgress = () => {
    try {
      const saved = localStorage.getItem('healthcheck_progress');
      if (saved) {
        const progressData = JSON.parse(saved);
        const answeredCount = progressData.responses.filter((r: AssessmentResponse) => r.answered).length;
        
        if (answeredCount > 0 && progressData.responses.length === questionsData.length) {
          setState(prev => ({
            ...prev,
            responses: progressData.responses,
            currentQuestionIndex: progressData.currentQuestionIndex,
            startTime: new Date(progressData.startTime),
            lastSaved: new Date(progressData.timestamp)
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to load saved progress:', error);
    }
  };

  const clearSavedProgress = () => {
    localStorage.removeItem('healthcheck_progress');
  };

  const startAssessment = () => {
    setState(prev => ({
      ...prev,
      mode: 'assessment',
      startTime: new Date(),
      currentQuestionIndex: 0
    }));
  };

  const resumeAssessment = () => {
    setState(prev => ({ ...prev, mode: 'assessment' }));
  };

  const handleScoreChange = (score: number) => {
    const newResponses = [...state.responses];
    newResponses[state.currentQuestionIndex] = {
      ...newResponses[state.currentQuestionIndex],
      score,
      answered: true
    };
    setState(prev => ({
      ...prev,
      responses: newResponses
    }));
  };

  const handleCommentChange = (comment: string) => {
    const newResponses = [...state.responses];
    newResponses[state.currentQuestionIndex] = {
      ...newResponses[state.currentQuestionIndex],
      comment
    };
    setState(prev => ({
      ...prev,
      responses: newResponses
    }));
  };

  const handleNext = () => {
    if (state.currentQuestionIndex < questionsData.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      setState(prev => ({ ...prev, mode: 'review' }));
    }
    saveProgress();
  };

  const handlePrevious = () => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const goToQuestion = (index: number) => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: index,
      mode: 'assessment'
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Validate all questions are answered
    const unansweredQuestions = state.responses.filter(r => !r.answered);
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) throw new Error('No user found');

      // Use the loaded questions data
      if (questionsData.length === 0) throw new Error('No questions loaded');

      // Save responses using the database question IDs
      const { data: responseRows, error: responseError } = await createClient()
        .from('health_check_responses')
        .insert(
          questionsData.map((q, i) => ({
            user_id: user.id,
            question_id: q.id,
            dimension: q.dimension,
            response_value: state.responses[i].score,
            comment: state.responses[i].comment,
          }))
        )
        .select();

      if (responseError) throw responseError;

      // Calculate and save results
      const dimensions = ['Efficiency', 'Effectiveness', 'Excellence'];
      const dimensionResults = await Promise.all(
        dimensions.map(async (dimension) => {
          const dimensionScore = calculateDimensionScore(state.responses, dimension);
          const color = dimensionScore >= 4 ? 'Green' : dimensionScore >= 3 ? 'Yellow' : 'Red';
          
          const { data: result, error: resultError } = await createClient()
            .from('health_check_results')
            .insert({
              user_id: user.id,
              dimension,
              average_score: dimensionScore,
              color,
              global_score: dimensionScore,
            })
            .select()
            .single();
          
          if (resultError) throw resultError;
          return result;
        })
      );

      // Call archetype detection
      const apiRes = await fetch('/api/archetypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthCheckResultId: dimensionResults[0].id,
          responses: questionsData.map((q, i) => ({
            dimension: q.dimension,
            category: q.category,
            score: state.responses[i].score,
            comment: state.responses[i].comment,
          })),
        }),
      });

      if (!apiRes.ok) {
        const apiData = await apiRes.json();
        throw new Error(apiData?.error || 'Archetype detection failed');
      }

      // Clear saved progress on successful submission
      clearSavedProgress();

      // Navigate to results page to show user their responses and scores
      router.push('/dashboard/health-check/results');
    } catch (err: any) {
      console.error('Error submitting health check:', err);
      setError(err?.message || 'Failed to submit health check. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDimensionScore = (responses: AssessmentResponse[], dimension: string) => {
    const dimensionQuestions = questionsData.filter(q => q.dimension === dimension);
    const totalScore = dimensionQuestions.reduce((sum, q) => sum + responses[q.id - 1].score, 0);
    return totalScore / dimensionQuestions.length;
  };

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'Efficiency': return <TargetIcon className="h-5 w-5" />;
      case 'Effectiveness': return <TrendingUpIcon className="h-5 w-5" />;
      case 'Excellence': return <AwardIcon className="h-5 w-5" />;
      default: return <TargetIcon className="h-5 w-5" />;
    }
  };

  const getDimensionColor = (dimension: string) => {
    switch (dimension) {
      case 'Efficiency': return 'bg-blue-100 text-blue-800';
      case 'Effectiveness': return 'bg-green-100 text-green-800';
      case 'Excellence': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimatedTimeRemaining = () => {
    const answeredCount = state.responses.filter(r => r.answered).length;
    const remainingQuestions = questionsData.length - answeredCount;
    return Math.ceil(remainingQuestions * 1.5); // 1.5 minutes per question
  };

  const getCompletionPercentage = () => {
    const answeredCount = state.responses.filter(r => r.answered).length;
    return Math.round((answeredCount / questionsData.length) * 100);
  };

  // Show loading state while questions are being loaded
  if (!questionsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health check questions...</p>
        </div>
      </div>
    );
  }

  // Show error state if questions failed to load
  if (questionsData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <InfoIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Questions</h2>
          <p className="text-gray-600 mb-4">
            {error || 'There was an issue loading the health check questions. Please try refreshing the page.'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Update the intro section to show correct question counts
  if (state.mode === 'intro') {
    const efficiencyCount = questionsData.filter(q => q.dimension === 'Efficiency').length;
    const effectivenessCount = questionsData.filter(q => q.dimension === 'Effectiveness').length;
    const excellenceCount = questionsData.filter(q => q.dimension === 'Excellence').length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Triple E Health Check</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Assess your organization's performance across Efficiency, Effectiveness, and Excellence dimensions
            </p>
          </div>

          {/* Assessment Overview */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <TargetIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Process optimization, resource allocation, and operational excellence
                </p>
                <Badge variant="outline" className="text-xs">{efficiencyCount} Questions</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
                  Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Goal achievement, strategic alignment, and decision-making quality
                </p>
                <Badge variant="outline" className="text-xs">{effectivenessCount} Questions</Badge>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <AwardIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Innovation culture, learning mindset, and continuous improvement
                </p>
                <Badge variant="outline" className="text-xs">{excellenceCount} Questions</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Estimated time: 25-30 minutes</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{questionsData.length} research-based questions</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">5-point scale with detailed descriptions</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <PauseIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Save progress automatically</span>
                  </div>
                  <div className="flex items-center">
                    <TargetIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Personalized insights and recommendations</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUpIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">System archetype detection</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Progress Alert */}
          {state.responses.some(r => r.answered) && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Progress detected:</span> You have {state.responses.filter(r => r.answered).length} saved responses. 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={resumeAssessment}>
                  Continue where you left off
                </Button>
                {' or '}
                <Button variant="link" className="p-0 h-auto" onClick={() => {
                  clearSavedProgress();
                  setState(prev => ({
                    ...prev,
                    responses: Array(questionsData.length).fill(null).map(() => ({ 
                      score: 0, 
                      comment: "", 
                      answered: false 
                    })),
                    currentQuestionIndex: 0
                  }));
                }}>
                  start fresh
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="text-center">
            <Button onClick={startAssessment} size="lg" className="px-8">
              <PlayIcon className="h-5 w-5 mr-2" />
              Begin Health Check
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.mode === 'review') {
    const dimensionSummary = ['Efficiency', 'Effectiveness', 'Excellence'].map(dimension => {
      const dimensionQuestions = questionsData.filter(q => q.dimension === dimension);
      const answeredInDimension = dimensionQuestions.filter(q => state.responses[q.id - 1].answered).length;
      const avgScore = dimensionQuestions.length > 0 ? 
        dimensionQuestions.reduce((sum, q) => sum + state.responses[q.id - 1].score, 0) / dimensionQuestions.length : 0;
      
      return {
        dimension,
        total: dimensionQuestions.length,
        answered: answeredInDimension,
        averageScore: avgScore
      };
    });

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Review Your Assessment</CardTitle>
              <CardDescription>
                Review your responses before submitting. You can go back to modify any answers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary by Dimension */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-semibold">Assessment Summary</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {dimensionSummary.map(summary => (
                    <Card key={summary.dimension} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          {getDimensionIcon(summary.dimension)}
                          <span className="font-medium ml-2">{summary.dimension}</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Questions: {summary.answered}/{summary.total}</div>
                          <div>Average Score: {summary.averageScore.toFixed(1)}/5.0</div>
                        </div>
                        <Badge className={`mt-2 ${getDimensionColor(summary.dimension)}`}>
                          {summary.averageScore >= 4 ? 'Strong' : summary.averageScore >= 3 ? 'Moderate' : 'Needs Attention'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Question-by-Question Review */}
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold">Question Review</h3>
                <div className="grid gap-2">
                  {questionsData.map((question, index) => (
                    <div 
                      key={question.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        !state.responses[index].answered ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                      onClick={() => goToQuestion(index)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getDimensionColor(question.dimension)} variant="outline">
                            {question.dimension}
                          </Badge>
                          <span className="text-sm font-medium">Q{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{question.text}</p>
                      </div>
                      <div className="text-right">
                        {state.responses[index].answered ? (
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                            <Badge variant="outline">
                              {state.responses[index].score}/5
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="destructive">Not Answered</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setState(prev => ({ ...prev, mode: 'assessment' }))}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Questions
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || state.responses.some(r => !r.answered)}
                  size="lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit Assessment"}
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Assessment Mode
  const currentQuestion = questionsData[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / questionsData.length) * 100;
  const answeredCount = state.responses.filter(r => r.answered).length;
  const currentResponse = state.responses[state.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Check Assessment</h1>
              <p className="text-gray-600">
                Question {state.currentQuestionIndex + 1} of {questionsData.length} • {answeredCount} completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                ~{getEstimatedTimeRemaining()} min remaining
              </div>
              {state.lastSaved && (
                <div className="text-xs text-green-600">
                  Last saved: {state.lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{getCompletionPercentage()}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className={`${getDimensionColor(currentQuestion.dimension)} flex items-center`}>
                {getDimensionIcon(currentQuestion.dimension)}
                <span className="ml-1">{currentQuestion.dimension}</span>
              </Badge>
              <Badge variant="outline">{currentQuestion.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Question */}
              <div>
                <Label className="text-lg font-medium leading-relaxed">
                  {currentQuestion.text}
                </Label>
                <p className="text-sm text-gray-500 mt-2">{currentQuestion.tooltip}</p>
              </div>

              {/* New Clean Slider Interface */}
              <HealthCheckSlider
                currentResponse={currentResponse}
                onScoreChange={handleScoreChange}
                onCommentChange={handleCommentChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={state.currentQuestionIndex === 0}
            className="min-w-[120px]"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {/* Quick Navigation Dots */}
            <div className="flex space-x-1">
              {questionsData.slice(Math.max(0, state.currentQuestionIndex - 2), state.currentQuestionIndex + 3).map((_, i) => {
                const actualIndex = Math.max(0, state.currentQuestionIndex - 2) + i;
                return (
                  <button
                    key={actualIndex}
                    onClick={() => setState(prev => ({ ...prev, currentQuestionIndex: actualIndex }))}
                    className={`w-2 h-2 rounded-full transition-all ${
                      actualIndex === state.currentQuestionIndex 
                        ? 'bg-blue-600 scale-150' 
                        : state.responses[actualIndex].answered 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                    }`}
                    aria-label={`Go to question ${actualIndex + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {state.currentQuestionIndex < questionsData.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!currentResponse.answered}
              className="min-w-[120px]"
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setState(prev => ({ ...prev, mode: 'review' }))}
              disabled={!currentResponse.answered}
              className="min-w-[120px]"
            >
              Review
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mt-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 