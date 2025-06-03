"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  PlayIcon,
  BookOpenIcon,
  AwardIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  VideoIcon,
  FileTextIcon,
  UsersIcon,
  LightbulbIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  BookIcon,
  BarChart3Icon,
  CogIcon,
  RocketIcon
} from "lucide-react";

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const learningPaths = [
    {
      id: 'triple-e-fundamentals',
      title: 'Triple E Fundamentals',
      description: 'Master the core concepts of Efficiency, Effectiveness, and Excellence',
      duration: '4 hours',
      modules: 12,
      difficulty: 'beginner',
      category: 'comprehensive',
      progress: 0,
      isRecommended: true
    },
    {
      id: 'efficiency-mastery',
      title: 'Efficiency Mastery',
      description: 'Deep dive into process optimization and operational excellence',
      duration: '3 hours',
      modules: 8,
      difficulty: 'intermediate',
      category: 'efficiency',
      progress: 25
    },
    {
      id: 'effectiveness-strategies',
      title: 'Effectiveness Strategies',
      description: 'Learn to achieve goals and drive strategic outcomes',
      duration: '3.5 hours',
      modules: 10,
      difficulty: 'intermediate',
      category: 'effectiveness',
      progress: 0
    },
    {
      id: 'excellence-culture',
      title: 'Building Excellence Culture',
      description: 'Create sustainable culture of continuous improvement',
      duration: '4.5 hours',
      modules: 15,
      difficulty: 'advanced',
      category: 'excellence',
      progress: 0
    }
  ];

  const featuredResources = [
    {
      id: 'intro-triple-e',
      title: 'Introduction to Triple E Model',
      description: 'Learn the foundational concepts that drive organizational transformation',
      type: 'video',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'general',
      progress: 100
    },
    {
      id: 'health-check-guide',
      title: 'How to Conduct Effective Health Checks',
      description: 'Step-by-step guide to assessing organizational health',
      type: 'interactive',
      duration: '25 min',
      difficulty: 'beginner',
      category: 'general',
      progress: 0
    },
    {
      id: 'archetype-patterns',
      title: 'Understanding System Archetypes',
      description: 'Identify and leverage behavioral patterns in organizations',
      type: 'article',
      duration: '15 min',
      difficulty: 'intermediate',
      category: 'effectiveness',
      progress: 60
    },
    {
      id: 'quick-wins-strategy',
      title: 'Designing Impactful Quick Wins',
      description: 'Create momentum with strategic short-term victories',
      type: 'video',
      duration: '18 min',
      difficulty: 'intermediate',
      category: 'efficiency',
      isComingSoon: true
    }
  ];

  const caseStudies = [
    {
      id: 'tech-startup',
      title: 'Tech Startup Transformation',
      company: 'InnovateTech Solutions',
      challenge: 'Scaling operational efficiency while maintaining innovation culture',
      outcome: '40% improvement in delivery speed, 60% reduction in technical debt',
      duration: '20 min read',
      isComingSoon: true
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing Excellence',
      company: 'Global Manufacturing Corp',
      challenge: 'Implementing lean practices across 15 facilities',
      outcome: '25% cost reduction, 90% quality improvement',
      duration: '15 min read',
      isComingSoon: true
    },
    {
      id: 'healthcare',
      title: 'Healthcare System Redesign',
      company: 'Regional Health Network',
      challenge: 'Improving patient outcomes while reducing operational costs',
      outcome: '30% faster patient processing, 95% satisfaction rate',
      duration: '18 min read',
      isComingSoon: true
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'efficiency': return 'bg-blue-100 text-blue-800';
      case 'effectiveness': return 'bg-green-100 text-green-800';
      case 'excellence': return 'bg-purple-100 text-purple-800';
      case 'comprehensive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoIcon className="h-4 w-4" />;
      case 'article': return <FileTextIcon className="h-4 w-4" />;
      case 'case-study': return <BarChart3Icon className="h-4 w-4" />;
      case 'interactive': return <CogIcon className="h-4 w-4" />;
      default: return <BookIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCapIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Triple E Academy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master organizational transformation through our comprehensive learning platform. 
            Build expertise in Efficiency, Effectiveness, and Excellence.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Learning Resources</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <VideoIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">20+</div>
                  <div className="text-sm text-gray-600">Video Lessons</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3Icon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-600">Case Studies</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Active Learners</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="cases">Case Studies</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Welcome Section */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RocketIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Welcome to Your Learning Journey
                </CardTitle>
                <CardDescription>
                  Start your transformation with our curated learning experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3">Recommended Starting Point</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Complete your Health Check Assessment</span>
                      </div>
                      <div className="flex items-center">
                        <PlayIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm">Watch "Introduction to Triple E Model"</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpenIcon className="h-4 w-4 text-purple-500 mr-2" />
                        <span className="text-sm">Begin "Triple E Fundamentals" path</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Your Progress</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Completion</span>
                          <span>15%</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>• 3 of 20 lessons completed</div>
                        <div>• 1 case study reviewed</div>
                        <div>• Next: Process Optimization Basics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Resources */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featuredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(resource.category)}`}>
                          {getTypeIcon(resource.type)}
                        </div>
                        {resource.isComingSoon && (
                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {resource.duration}
                          </div>
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </Badge>
                        </div>
                        
                        {resource.progress !== undefined && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{resource.progress}%</span>
                            </div>
                            <Progress value={resource.progress} className="h-1" />
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          disabled={resource.isComingSoon}
                        >
                          {resource.isComingSoon ? 'Coming Soon' : 
                           resource.progress === 100 ? 'Review' :
                           resource.progress && resource.progress > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Access */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-6">
                  <TargetIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Efficiency Hub</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Process optimization, automation, and operational excellence
                  </p>
                  <Button variant="outline" size="sm">
                    Explore Efficiency
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <TrendingUpIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Effectiveness Hub</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Strategic alignment, goal achievement, and decision-making
                  </p>
                  <Button variant="outline" size="sm">
                    Explore Effectiveness
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <AwardIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Excellence Hub</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Culture building, continuous improvement, and innovation
                  </p>
                  <Button variant="outline" size="sm">
                    Explore Excellence
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Structured Learning Paths</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow our expertly designed curricula to build comprehensive expertise in organizational transformation
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.map((path) => (
                <Card key={path.id} className={`hover:shadow-lg transition-shadow ${path.isRecommended ? 'ring-2 ring-indigo-200' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 mr-2" />
                        <div>
                          <CardTitle className="text-lg">{path.title}</CardTitle>
                          {path.isRecommended && (
                            <Badge className="mt-1 bg-indigo-100 text-indigo-800">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {path.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{path.duration}</div>
                          <div className="text-gray-500">Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{path.modules}</div>
                          <div className="text-gray-500">Modules</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{path.progress}%</div>
                          <div className="text-gray-500">Complete</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>
                      
                      <Button className="w-full" variant={path.progress > 0 ? "default" : "outline"}>
                        {path.progress > 0 ? 'Continue Learning' : 'Start Path'}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Resources</h2>
              <p className="text-gray-600">Browse our comprehensive library of micro-lessons, videos, and interactive content</p>
            </div>

            {/* Resource Categories */}
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <VideoIcon className="h-8 w-8 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Video Lessons</h3>
                  <p className="text-sm text-gray-600 mb-3">Expert-led tutorials and explanations</p>
                  <Badge variant="outline">24 videos</Badge>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <FileTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Articles & Guides</h3>
                  <p className="text-sm text-gray-600 mb-3">In-depth written content and how-tos</p>
                  <Badge variant="outline">18 articles</Badge>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <CogIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Interactive Tools</h3>
                  <p className="text-sm text-gray-600 mb-3">Hands-on exercises and simulations</p>
                  <Badge variant="outline">12 tools</Badge>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <BookIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Templates</h3>
                  <p className="text-sm text-gray-600 mb-3">Ready-to-use frameworks and templates</p>
                  <Badge variant="outline">15 templates</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Alert */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <LightbulbIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>More resources coming soon!</strong> We're continuously adding new content. 
                Check back regularly for the latest lessons and tools.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Case Studies Tab */}
          <TabsContent value="cases" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Real-World Case Studies</h2>
              <p className="text-gray-600">Learn from successful transformations across different industries</p>
            </div>

            <div className="space-y-6">
              {caseStudies.map((study) => (
                <Card key={study.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{study.title}</h3>
                        <Badge variant="outline" className="mb-3">{study.company}</Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {study.duration}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Challenge</h4>
                        <p className="text-sm text-gray-600">{study.challenge}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Outcome</h4>
                        <p className="text-sm text-gray-600 mb-4">{study.outcome}</p>
                        <Button variant="outline" size="sm" disabled={study.isComingSoon}>
                          {study.isComingSoon ? 'Coming Soon' : 'Read Case Study'}
                          {!study.isComingSoon && <ArrowRightIcon className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Tools & Templates</h2>
              <p className="text-gray-600">Downloadable resources to support your transformation journey</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="font-semibold mb-2">Assessment Templates</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Ready-to-use templates for conducting your own health checks
                  </p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <BarChart3Icon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Strategy Canvas</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Visual frameworks for mapping your strategic initiatives
                  </p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <TargetIcon className="h-8 w-8 text-purple-600 mb-4" />
                  <h3 className="font-semibold mb-2">Action Plan Builder</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Interactive tool for creating detailed improvement plans
                  </p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}