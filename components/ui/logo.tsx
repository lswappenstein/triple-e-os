import React from 'react'
import { clsx } from 'clsx'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      {/* Triple E Logo - Stylized E's in a circular arrangement */}
      <div className={clsx(
        'relative rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-3 shadow-lg',
        sizeClasses[size]
      )}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
        <div className="relative flex items-center justify-center h-full w-full">
          <div className="grid grid-cols-3 gap-0.5 w-full h-full">
            {/* Three E's arranged in a pattern */}
            <div className="bg-white rounded-sm opacity-90"></div>
            <div className="bg-white rounded-sm opacity-80"></div>
            <div className="bg-white rounded-sm opacity-70"></div>
            <div className="bg-white rounded-sm opacity-80"></div>
            <div className="bg-white rounded-sm opacity-90"></div>
            <div className="bg-white rounded-sm opacity-80"></div>
            <div className="bg-white rounded-sm opacity-70"></div>
            <div className="bg-white rounded-sm opacity-80"></div>
            <div className="bg-white rounded-sm opacity-90"></div>
          </div>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1 className={clsx(
            'font-bold text-gray-900 tracking-tight',
            textSizeClasses[size]
          )}>
            Triple <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">eOS</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            Efficiency • Effectiveness • Excellence
          </p>
        </div>
      )}
    </div>
  )
} 