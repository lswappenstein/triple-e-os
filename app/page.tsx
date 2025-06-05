import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, PlayIcon, TargetIcon, TrendingUpIcon, AwardIcon, RefreshCwIcon, ShieldCheckIcon, ZapIcon, BrainIcon, CogIcon, ChevronDownIcon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="sm" className="flex-shrink-0" />
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Logo for mobile/tablet */}
              <div className="mb-8 sm:hidden">
                <Logo size="lg" className="justify-center" />
              </div>
              
              {/* Problem Statement */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Stop Optimizing a <br />
                <span className="text-red-600">Broken System</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Most businesses are stuck in a loop of doing things faster—without ever questioning if they're doing the right things. 
                <span className="font-semibold text-blue-600"> The Triple E Model helps you escape the trap of efficiency without direction.</span>
              </p>

              {/* Empathy & Authority */}
              <Card className="mb-12 max-w-3xl mx-auto shadow-xl border-0">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-lg text-gray-700 mb-4">
                    <span className="font-semibold">You're not alone.</span>
                  </p>
                  <p className="text-gray-600">
                    We've helped organizations move beyond chaos and complexity, making strategic clarity and scalable systems their new norm. 
                    Our framework is grounded in systems thinking, strategic design, and real-world execution.
                  </p>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 h-auto text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
                >
                  <Link href="/auth/register">
                    Start Your Health Check
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 px-8 py-4 h-auto text-lg font-semibold"
                >
                  <Link href="#how-it-works">
                    <PlayIcon className="mr-2 h-5 w-5" />
                    See How It Works
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <p className="text-sm text-gray-500">
                ✓ 5-minute health check  ✓ Immediate insights  ✓ No spam, ever
              </p>
            </div>
          </div>
        </section>

        {/* External Problem Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
                The External Problem
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-xl text-gray-600 mb-6">
                  You've streamlined operations. You've reduced waste. You've built dashboards.
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-6">
                  So why does it still feel like nothing's truly moving forward?
                </p>
                <p className="text-xl text-blue-600 font-semibold">
                  Because efficiency alone doesn't build strategic momentum.
                </p>
              </div>
            </div>

            {/* Problem Illustrations */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <RefreshCwIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Endless Optimization</h3>
                  <p className="text-gray-600">Always improving processes but never sure if they're the right processes</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <TargetIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Motion Without Direction</h3>
                  <p className="text-gray-600">Lots of activity and metrics but unclear strategic progress</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <CogIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Scaling Complexity</h3>
                  <p className="text-gray-600">Growing faster but systems becoming more complex, not simpler</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Triple E Model Introduction */}
        <section id="how-it-works" className="py-20 bg-gradient-to-br from-white to-purple-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Introducing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Triple E Model™</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                A strategic operating system designed to help organizations grow with purpose.
              </p>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Instead of getting stuck optimizing the wrong things, you'll start with <strong>Efficiency</strong> to stabilize, 
                shift into <strong>Effectiveness</strong> to make strategic choices, and build <strong>Excellence</strong> through systems that scale.
              </p>
            </div>

            {/* The Three Phases */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Phase 1: Efficiency */}
              <div className="relative">
                <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-4">
                        <TargetIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">Phase 1: Efficiency</h3>
                        <p className="text-blue-700 text-sm">"The Trojan Horse"</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6">
                      Most businesses start here—and stay here. Efficiency gives you momentum: clean SOPs, better tools, dashboards. 
                      But without direction, it's just motion.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm">Tame chaos with quick wins</span>
                      </div>
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm">Win trust through results</span>
                      </div>
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-sm">Identify system leaks</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRightIcon className="h-8 w-8 text-gray-300" />
                </div>
              </div>

              {/* Phase 2: Effectiveness */}
              <div className="relative">
                <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mr-4">
                        <TrendingUpIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">Phase 2: Effectiveness</h3>
                        <p className="text-green-700 text-sm">"Decisions with Purpose"</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6">
                      Once chaos is tamed, focus on strategic choice. Ask the right questions: 
                      "Where should we play? How will we win?"
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm">Strategy Choice Cascade</span>
                      </div>
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm">Archetype Detection</span>
                      </div>
                      <div className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm">Strategic Process Mapping</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRightIcon className="h-8 w-8 text-gray-300" />
                </div>
              </div>

              {/* Phase 3: Excellence */}
              <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mr-4">
                      <AwardIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-900">Phase 3: Excellence</h3>
                      <p className="text-purple-700 text-sm">"Systemic Adaptability"</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Strategy isn't a PowerPoint—it's a living system. Turn decisions into repeatable systems 
                    that make your business antifragile.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm">Build feedback loops</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm">Codify strategic choices</span>
                    </div>
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm">Develop recalibration muscle</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Circular Nature */}
            <Card className="text-center shadow-xl border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why It Works: The Circular Nature</h3>
                <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
                  The Triple E Model isn't linear—it loops. Each round creates more clarity, alignment, and momentum.
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <RefreshCwIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's at Stake */}
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                What's at Stake
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-red-600 mb-6">Without this system, you risk:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                        <span className="text-red-600 text-sm">✗</span>
                      </div>
                      <span className="text-gray-700">Optimizing a broken machine</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                        <span className="text-red-600 text-sm">✗</span>
                      </div>
                      <span className="text-gray-700">Wasting time on low-leverage decisions</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                        <span className="text-red-600 text-sm">✗</span>
                      </div>
                      <span className="text-gray-700">Scaling complexity, not clarity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-green-600 mb-6">With the Triple E Model:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-600 mr-4 mt-0.5" />
                      <span className="text-gray-700">Build the strategy muscle your business needs</span>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-600 mr-4 mt-0.5" />
                      <span className="text-gray-700">Scale with direction, not just speed</span>
                    </div>
                    <div className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-600 mr-4 mt-0.5" />
                      <span className="text-gray-700">Create systems that adapt and grow with you</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-20 bg-gradient-to-br from-white to-blue-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                What You'll Get
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A complete strategic operating system that grows with your business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
                    <BrainIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Organizational Health Check</h3>
                  <p className="text-gray-600">Comprehensive 20-question assessment across Efficiency, Effectiveness, and Excellence dimensions</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-4">
                    <ZapIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Systemic Pattern Detection</h3>
                  <p className="text-gray-600">AI-powered identification of organizational archetypes blocking your growth</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-4">
                    <TargetIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Personalized Quick Wins</h3>
                  <p className="text-gray-600">Actionable improvements tailored to your specific organizational context</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Strategy Choice Cascade</h3>
                  <p className="text-gray-600">Build your strategic decisions using the proven "Playing to Win" framework</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center mb-4">
                    <RefreshCwIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Evolving System</h3>
                  <p className="text-gray-600">A living framework that adapts and scales with your business growth</p>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center mb-4">
                    <AwardIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Excellence Systems</h3>
                  <p className="text-gray-600">Build feedback loops and strategic learning capabilities for continuous improvement</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Stop Spinning Your Wheels?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Create your free account now and start your Health Check in less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 h-auto text-lg font-semibold transition-all transform hover:scale-105 shadow-xl"
              >
                <Link href="/auth/register">
                  Sign Up - It's Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-white border-white hover:bg-white/10 px-8 py-4 h-auto text-lg font-semibold"
              >
                <Link href="/auth/login">
                  Already have an account? Sign In
                </Link>
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              No credit card required • Free health check • Immediate insights
            </p>
          </div>
        </section>

        {/* Trust & Footer */}
        <footer className="py-12 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Card className="max-w-2xl mx-auto shadow-xl border-0">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mr-4">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-semibold text-gray-900">Built for Privacy & Results</p>
                      <p className="text-gray-600">Your data is secure. No noise. Just strategic growth.</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Triple eOS is built on proven frameworks, real-world experience, and your privacy comes first.
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Let's build your system for strategic growth—starting today.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
