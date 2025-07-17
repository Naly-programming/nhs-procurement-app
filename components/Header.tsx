'use client'

import Link from 'next/link'
import { useUser } from '@/lib/UserContext'
import { supabase } from '@/lib/supabaseClient'

export default function Header() {
  const { user, loading } = useUser()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900 text-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              <span className="text-white">NHS</span>
              <span className="text-blue-400">Ready</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/about" className="hover:text-blue-400 transition-colors">
                About
              </Link>
              <Link href="/pricing" className="hover:text-blue-400 transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && user ? (
              <>
                <span className="text-sm hidden md:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 hover:text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
