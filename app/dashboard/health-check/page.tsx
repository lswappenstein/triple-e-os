"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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

const questions: Question[] = [
  // Efficiency Questions (7 questions)
  { id: 1, dimension: 'Efficiency', category: 'Process', text: 'Our processes are clearly documented and easy to follow.', tooltip: 'Documentation and clarity of processes.' },
  { id: 2, dimension: 'Efficiency', category: 'Process', text: 'We regularly review and optimize our workflows.', tooltip: 'Continuous improvement of workflows.' },
  { id: 3, dimension: 'Efficiency', category: 'Process', text: 'We use automation to reduce manual work.', tooltip: 'Automation and technology use.' },
  { id: 4, dimension: 'Efficiency', category: 'Resource', text: 'Resources are allocated efficiently.', tooltip: 'Resource allocation.' },
  { id: 5, dimension: 'Efficiency', category: 'Bottleneck', text: 'Bottlenecks are quickly identified and resolved.', tooltip: 'Bottleneck management.' },
  { id: 6, dimension: 'Efficiency', category: 'Lean', text: 'We minimize waste and unnecessary steps.', tooltip: 'Lean practices.' },
  { id: 7, dimension: 'Efficiency', category: 'Risk', text: 'We have contingency plans for key risks.', tooltip: 'Risk management.' },
  
  // Effectiveness Questions (7 questions)
  { id: 8, dimension: 'Effectiveness', category: 'Goals', text: 'Our team consistently achieves its goals.', tooltip: 'Goal achievement.' },
  { id: 9, dimension: 'Effectiveness', category: 'Metrics', text: 'We have clear metrics to measure success.', tooltip: 'Success metrics.' },
  { id: 10, dimension: 'Effectiveness', category: 'Decision Making', text: 'Decision-making is data-driven and timely.', tooltip: 'Decision-making process.' },
  { id: 11, dimension: 'Effectiveness', category: 'Adaptability', text: 'We adapt quickly to changes in the market.', tooltip: 'Adaptability.' },
  { id: 12, dimension: 'Effectiveness', category: 'Roles', text: 'Roles and responsibilities are well defined.', tooltip: 'Role clarity.' },
  { id: 13, dimension: 'Effectiveness', category: 'Communication', text: 'Communication is clear and effective.', tooltip: 'Communication quality.' },
  { id: 14, dimension: 'Effectiveness', category: 'Strategy', text: 'Our strategy is well understood by all.', tooltip: 'Strategic alignment.' },
  
  // Excellence Questions (6 questions)
  { id: 15, dimension: 'Excellence', category: 'Innovation', text: 'We encourage innovation and new ideas.', tooltip: 'Culture of innovation.' },
  { id: 16, dimension: 'Excellence', category: 'Feedback', text: 'Feedback is regularly collected and acted upon.', tooltip: 'Feedback mechanisms.' },
  { id: 17, dimension: 'Excellence', category: 'Learning', text: 'We invest in professional development.', tooltip: 'Learning and growth.' },
  { id: 18, dimension: 'Excellence', category: 'Quality', text: 'Quality standards are consistently met.', tooltip: 'Quality assurance.' },
  { id: 19, dimension: 'Excellence', category: 'Recognition', text: 'We celebrate achievements and recognize contributions.', tooltip: 'Recognition and celebration.' },
  { id: 20, dimension: 'Excellence', category: 'Benchmarking', text: 'We benchmark against industry best practices.', tooltip: 'Benchmarking.' },
];

const SCALE_LABELS = [
  { value: 1, label: "Strongly Disagree", color: "bg-red-100 text-red-800 hover:bg-red-200", description: "This rarely or never happens in our organization" },
  { value: 2, label: "Disagree", color: "bg-orange-100 text-orange-800 hover:bg-orange-200", description: "This happens occasionally but not consistently" },
  { value: 3, label: "Neutral", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", description: "This happens sometimes, with mixed results" },
  { value: 4, label: "Agree", color: "bg-blue-100 text-blue-800 hover:bg-blue-200", description: "This happens frequently and works well" },
  { value: 5, label: "Strongly Agree", color: "bg-green-100 text-green-800 hover:bg-green-200", description: "This consistently happens and is a strength" }
];

export default function HealthCheckPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);

  const [state, setState] = useState<AssessmentState>({
    mode: 'intro',
    currentQuestionIndex: 0,
    responses: Array(questions.length).fill(null).map(() => ({ 
      score: 0, 
      comment: "", 
      answered: false 
    })),
    startTime: null,
    lastSaved: null
  });

  // Auto-save functionality
  useEffect(() => {
    if (state.mode === 'assessment' && state.startTime) {
      const autoSave = setInterval(() => {
        saveProgress();
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSave);
    }
  }, [state.mode, state.startTime]);

  // Load saved progress on mount
  useEffect(() => {
    loadSavedProgress();
  }, []);

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
        
        if (answeredCount > 0) {
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
    if (state.currentQuestionIndex < questions.length - 1) {
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
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get database questions
      const { data: dbQuestions, error: questionsError } = await supabase
        .from('health_check_questions')
        .select('id, dimension, category, text')
        .order('id');
      
      if (questionsError) throw questionsError;
      if (!dbQuestions || dbQuestions.length === 0) throw new Error('No questions found in database');

      const questionMap = new Map(dbQuestions.map(q => [q.text, q]));

      // Save responses
      const { data: responseRows, error: responseError } = await supabase
        .from('health_check_responses')
        .insert(
          questions.map((q, i) => {
            const dbQuestion = questionMap.get(q.text);
            if (!dbQuestion) throw new Error(`Question not found in database: ${q.text}`);
            return {
              user_id: user.id,
              question_id: dbQuestion.id,
              dimension: q.dimension,
              response_value: state.responses[i].score,
              comment: state.responses[i].comment,
            };
          })
        )
        .select();

      if (responseError) throw responseError;

      // Calculate and save results
      const dimensions = ['Efficiency', 'Effectiveness', 'Excellence'];
      const dimensionResults = await Promise.all(
        dimensions.map(async (dimension) => {
          const dimensionScore = calculateDimensionScore(state.responses, dimension);
          const color = dimensionScore >= 4 ? 'Green' : dimensionScore >= 3 ? 'Yellow' : 'Red';
          
          const { data: result, error: resultError } = await supabase
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
          responses: questions.map((q, i) => ({
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

      // Navigate to results
      router.push('/dashboard/archetypes');
    } catch (err: any) {
      console.error('Error submitting health check:', err);
      setError(err?.message || 'Failed to submit health check. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDimensionScore = (responses: AssessmentResponse[], dimension: string) => {
    const dimensionQuestions = questions.filter(q => q.dimension === dimension);
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
    const remainingQuestions = questions.length - answeredCount;
    return Math.ceil(remainingQuestions * 1.5); // 1.5 minutes per question
  };

  const getCompletionPercentage = () => {
    const answeredCount = state.responses.filter(r => r.answered).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  if (state.mode === 'intro') {
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
                <Badge variant="outline" className="text-xs">7 Questions</Badge>
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
                <Badge variant="outline" className="text-xs">7 Questions</Badge>
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
                  Innovation culture, continuous learning, and quality standards
                </p>
                <Badge variant="outline" className="text-xs">6 Questions</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <InfoIcon className="h-5 w-5 mr-2" />
                Assessment Details
              </CardTitle>
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
                    <span className="text-sm">20 carefully crafted questions</span>
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
          {state.lastSaved && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                We found a previous assessment in progress from {state.lastSaved.toLocaleDateString()}. 
                You can continue where you left off or start fresh.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {state.lastSaved ? (
              <>
                <Button onClick={resumeAssessment} size="lg" className="min-w-[200px]">
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Continue Assessment
                </Button>
                <Button onClick={startAssessment} variant="outline" size="lg" className="min-w-[200px]">
                  Start Fresh
                </Button>
              </>
            ) : (
              <Button onClick={startAssessment} size="lg" className="min-w-[200px]">
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.mode === 'review') {
    const dimensionSummary = ['Efficiency', 'Effectiveness', 'Excellence'].map(dimension => {
      const dimensionQuestions = questions.filter(q => q.dimension === dimension);
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
                  {questions.map((question, index) => (
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
  const currentQuestion = questions[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / questions.length) * 100;
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
                Question {state.currentQuestionIndex + 1} of {questions.length} • {answeredCount} completed
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

              {/* Rating Scale */}
              <div className="space-y-6">
                <Label className="text-base font-medium">How much do you agree with this statement?</Label>
                
                {/* Slider Interface */}
                <div className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={[currentResponse.score || 1]}
                      onValueChange={(value) => handleScoreChange(value[0])}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Scale Labels */}
                  <div className="flex justify-between text-xs text-gray-500 px-2">
                    {SCALE_LABELS.map((label) => (
                      <div key={label.value} className="text-center">
                        <div className="font-medium">{label.value}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Current Selection Display */}
                  {currentResponse.score > 0 && (
                    <div className="mt-4 p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {currentResponse.score}
                          </div>
                          <span className="font-semibold text-blue-900">
                            {SCALE_LABELS.find(s => s.value === currentResponse.score)?.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-800">
                        {SCALE_LABELS.find(s => s.value === currentResponse.score)?.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Quick Selection Buttons */}
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {SCALE_LABELS.map((option) => (
                      <Button
                        key={option.value}
                        variant={currentResponse.score === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleScoreChange(option.value)}
                        className={`text-xs py-2 transition-all ${
                          currentResponse.score === option.value 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{option.value}</div>
                          <div className="text-[10px] leading-tight">{option.label.split(' ')[0]}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Scale Guide */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="font-medium mb-2">Rating Guide:</div>
                      <div className="grid gap-1">
                        <div className="flex justify-between">
                          <span className="text-red-600">1-2: Needs Improvement</span>
                          <span className="text-gray-500">Rarely happens or inconsistent</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">3: Neutral/Mixed</span>
                          <span className="text-gray-500">Sometimes happens, mixed results</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">4-5: Strength</span>
                          <span className="text-gray-500">Frequently or consistently happens</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-base font-medium">
                  Additional Context <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </Label>
                <Textarea
                  id="comment"
                  value={currentResponse.comment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="Share specific examples, challenges, or context that might help explain your rating..."
                  className="min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
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
              {questions.slice(Math.max(0, state.currentQuestionIndex - 2), state.currentQuestionIndex + 3).map((_, i) => {
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

          {state.currentQuestionIndex < questions.length - 1 ? (
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