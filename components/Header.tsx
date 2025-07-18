'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/UserContext'
import { supabase } from '@/lib/supabaseClient'

export default function Header() {
  const { user, loading } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <header className="fixed top-0 inset-x-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nav Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.svg"
                alt="Coentry"
                className="h-16 w-auto"
              />
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
          </div>


          {/* Notification & User */}
          <div className="flex items-center space-x-4">
            {!loading && user ? (
              <>
                <button className="relative text-gray-600 hover:text-gray-900 focus:outline-none">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <img
                    src={user.user_metadata?.avatar_url || "https://placehold.co/400"}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full border border-gray-200"
                  />
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-40">
              <div className="px-4 py-2 space-y-2">
                <Link href="/dashboard" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Dashboard
                </Link>
                <Link href="/about" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  About
                </Link>
                <Link href="/pricing" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Pricing
                </Link>
                <Link href="/contact" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                  Contact
                </Link>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Log Out
                  </button>
                ) : (
                  <Link href="/login" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
