import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, PlayIcon, TargetIcon, TrendingUpIcon, AwardIcon, RefreshCwIcon, ShieldCheckIcon, ZapIcon, BrainIcon, CogIcon, ChevronDownIcon } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">Triple eOS</span>
              </div>
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
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
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-12 max-w-3xl mx-auto border border-gray-200">
                <p className="text-lg text-gray-700 mb-4">
                  <span className="font-semibold">You're not alone.</span>
                </p>
                <p className="text-gray-600">
                  We've helped organizations move beyond chaos and complexity, making strategic clarity and scalable systems their new norm. 
                  Our framework is grounded in systems thinking, strategic design, and real-world execution.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center"
                >
                  Start Your Health Check
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  See How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <p className="text-sm text-gray-500">
                ✓ 5-minute health check  ✓ Immediate insights  ✓ No spam, ever
              </p>
            </div>
          </div>
        </section>

        {/* External Problem Section */}
        <section className="py-20 bg-gray-50">
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
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <RefreshCwIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Endless Optimization</h3>
                <p className="text-gray-600">Always improving processes but never sure if they're the right processes</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <TargetIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Motion Without Direction</h3>
                <p className="text-gray-600">Lots of activity and metrics but unclear strategic progress</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <CogIcon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Scaling Complexity</h3>
                <p className="text-gray-600">Growing faster but systems becoming more complex, not simpler</p>
              </div>
            </div>
          </div>
        </section>

        {/* Triple E Model Introduction */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Introducing the <span className="text-blue-600">Triple E Model™</span>
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
                <div className="bg-blue-50 rounded-2xl p-8 h-full border-2 border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
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
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRightIcon className="h-8 w-8 text-gray-300" />
                </div>
              </div>

              {/* Phase 2: Effectiveness */}
              <div className="relative">
                <div className="bg-green-50 rounded-2xl p-8 h-full border-2 border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
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
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRightIcon className="h-8 w-8 text-gray-300" />
                </div>
              </div>

              {/* Phase 3: Excellence */}
              <div className="bg-purple-50 rounded-2xl p-8 h-full border-2 border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
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
              </div>
            </div>

            {/* Circular Nature */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why It Works: The Circular Nature</h3>
              <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
                The Triple E Model isn't linear—it loops. Each round creates more clarity, alignment, and momentum.
              </p>
              <div className="flex items-center justify-center">
                <RefreshCwIcon className="h-12 w-12 text-blue-600" />
              </div>
            </div>
          </div>
        </section>

        {/* What's at Stake */}
        <section className="py-20 bg-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                What's at Stake
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
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
              </div>
              <div>
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
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-20 bg-white">
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
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <BrainIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Organizational Health Check</h3>
                <p className="text-gray-600">Comprehensive 20-question assessment across Efficiency, Effectiveness, and Excellence dimensions</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <ZapIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Systemic Pattern Detection</h3>
                <p className="text-gray-600">AI-powered identification of organizational archetypes blocking your growth</p>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <TargetIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Personalized Quick Wins</h3>
                <p className="text-gray-600">Actionable improvements tailored to your specific organizational context</p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUpIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Strategy Choice Cascade</h3>
                <p className="text-gray-600">Build your strategic decisions using the proven "Playing to Win" framework</p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <RefreshCwIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Evolving System</h3>
                <p className="text-gray-600">A living framework that adapts and scales with your business growth</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <AwardIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Excellence Systems</h3>
                <p className="text-gray-600">Build feedback loops and strategic learning capabilities for continuous improvement</p>
              </div>
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
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg flex items-center"
              >
                Sign Up - It's Free
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="text-white border border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors flex items-center"
              >
                Already have an account? Sign In
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              No credit card required • Free health check • Immediate insights
            </p>
          </div>
        </section>

        {/* Trust & Footer */}
        <footer className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-gray-600 mr-3" />
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
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
