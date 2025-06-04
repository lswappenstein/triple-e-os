'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { CheckCircleIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    
    setError(null)
    setIsLoading(true)

    try {
      await signUp(email, password, fullName)
      setShowSuccess(true)
      // Reset form
      setEmail('')
      setPassword('')
      setFullName('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      title: 'Comprehensive Health Checks',
      description: 'Regular organizational assessments across all three pillars'
    },
    {
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations based on your data'
    },
    {
      title: 'Real-time Dashboards',
      description: 'Monitor your progress with beautiful, actionable dashboards'
    },
    {
      title: 'System Archetypes Detection',
      description: 'Identify and address problematic organizational patterns'
    }
  ]

  const stats = [
    { label: 'Organizations Transformed', value: '2,500+' },
    { label: 'Average Efficiency Gain', value: '35%' },
    { label: 'Customer Satisfaction', value: '4.9/5' },
    { label: 'Countries Served', value: '45+' }
  ]

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <Card className="shadow-xl border-0 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Please check your email to verify your account before signing in.
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex min-h-screen">
        {/* Left side - Platform Information */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-8 xl:px-16 2xl:px-20">
          <div className="max-w-2xl mx-auto">
            <Logo size="xl" className="mb-8" />
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Join the Triple E Revolution
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform your organization with the most comprehensive operating system 
              for <strong>Efficiency</strong>, <strong>Effectiveness</strong>, and <strong>Excellence</strong>.
            </p>

            <div className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-200/50">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-6 py-12 lg:px-8 xl:px-12 2xl:px-16">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 text-center">
              <Logo size="lg" className="justify-center" />
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Start your transformation journey today
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                        required
                        placeholder="John Doe"
                        disabled={isLoading}
                        className="h-11 pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Work Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        placeholder="john@company.com"
                        disabled={isLoading}
                        className="h-11 pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        disabled={isLoading}
                        className="h-11 pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      href="/auth/login" 
                      className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mobile features */}
            <div className="lg:hidden mt-8 space-y-4">
              {features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{feature.title}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 