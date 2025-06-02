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
import { useAuth } from '@/lib/context/auth-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Health Check', href: '/dashboard/health-check', icon: ChartBarIcon },
  { name: 'System Archetypes', href: '/dashboard/arquetipos', icon: MapIcon },
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
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm w-full">
              <span className="sr-only">Open user menu</span>
              <span className="truncate">{user?.email}</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto py-6 px-6 lg:px-8">{children}</main>
    </div>
  )
} 
