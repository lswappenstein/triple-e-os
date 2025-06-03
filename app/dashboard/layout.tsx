'use client'

import { Fragment, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  ChartBarIcon,
  HomeIcon,
  XMarkIcon,
  AcademicCapIcon,
  LightBulbIcon,
  MapIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/context/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Health Check', href: '/dashboard/health-check', icon: ChartBarIcon },
  { name: 'System Archetypes', href: '/dashboard/archetypes', icon: MapIcon },
  { name: 'Quick Wins', href: '/dashboard/quick-wins', icon: LightBulbIcon },
  { name: 'Strategy Map', href: '/dashboard/strategy-map', icon: MapIcon },
  { name: 'Decisions', href: '/dashboard/decisions', icon: DocumentTextIcon },
  { name: 'Review Loop', href: '/dashboard/review', icon: ClockIcon },
  { name: 'Academy', href: '/dashboard/academy', icon: AcademicCapIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  console.log('[DashboardLayout] user:', user);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-xl font-bold">Triple eOS</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          {/* Always show sign out button for debugging */}
          <button
            onClick={() => signOut()}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 border rounded hover:bg-red-50"
          >
            Sign out
          </button>
          {/* Original menu for user email and sign out (can be restored after debug) */}
          {/*
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm w-full">
              <span className="sr-only">Open user menu</span>
              <span className="truncate">{user?.email}</span>
            </Menu.Button>
            <Transition ...>
              <Menu.Items ...>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={clsx(
                        active ? 'bg-gray-100' : '',
                        'block w-full px-4 py-2 text-left text-sm text-gray-700'
                      )}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
          */}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto py-6 px-6 lg:px-8">{children}</main>
    </div>
  )
} 
