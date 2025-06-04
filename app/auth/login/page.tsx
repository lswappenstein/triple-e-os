'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('🔓 LoginPage: User state changed:', { hasUser: !!user, userEmail: user?.email });
    
    // If user is already authenticated, redirect them
    if (user) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      console.log('🔓 LoginPage: User authenticated, redirecting to:', redirectTo);
      router.push(redirectTo)
    }
  }, [user, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    setError(null)
    setIsLoading(true)
    
    try {
      console.log('🔓 LoginPage: Attempting to sign in...')
      await signIn(email, password)
      console.log('🔓 LoginPage: Sign in successful, auth context will handle redirect')
      // Reset loading state so redirect can happen
      setIsLoading(false)
    } catch (err) {
      console.error('🔓 LoginPage: Login error:', err)
      setError('Invalid email or password')
      setIsLoading(false)
    }
  }

  const benefits = [
    'Optimize your organization\'s efficiency with data-driven insights',
    'Measure effectiveness across all business processes',
    'Achieve excellence through systematic improvements',
    'Real-time health check assessments and recommendations'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left side - Branding and Information */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-8 xl:px-16 2xl:px-20">
          <div className="max-w-2xl mx-auto">
            <Logo size="xl" className="mb-8" />
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Transform Your Organization with the Triple E Model
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The Triple E Operating System helps organizations achieve peak performance through 
              three fundamental pillars: <strong>Efficiency</strong>, <strong>Effectiveness</strong>, 
              and <strong>Excellence</strong>.
            </p>

            <div className="space-y-6 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to get started?</h3>
              <p className="text-gray-600 mb-4">
                Join thousands of organizations already using Triple eOS to drive measurable improvements.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>Sign in to your dashboard</span>
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-6 py-12 lg:px-8 xl:px-12 2xl:px-16">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 text-center">
              <Logo size="lg" className="justify-center" />
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Sign in to access your Triple eOS dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      disabled={isLoading}
                      className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      href="/auth/register" 
                      className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                    >
                      Create your account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mobile benefits */}
            <div className="lg:hidden mt-8 space-y-3">
              {benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 