import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="relative isolate">
        {/* Hero section */}
        <div className="relative pt-14">
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Triple eOS
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Transform your organization through Efficiency, Effectiveness, and Excellence.
                  A systematic approach to building adaptive, antifragile businesses.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link
                    href="/auth/register"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Get started
                  </Link>
                  <Link href="/auth/login" className="text-sm font-semibold leading-6 text-gray-900">
                    Sign in <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
