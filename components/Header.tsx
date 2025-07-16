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
    <header className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="font-bold text-teal-700 text-lg">NHS Ready</Link>
      <nav className="space-x-6 text-sm">
        <Link href="/about">About</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/contact">Contact</Link>

        {!loading && user ? (
          <>
            <span className="text-teal-700 font-medium">{user.email}</span>
            <button onClick={handleLogout} className="text-sm underline text-gray-600 ml-2">
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="font-semibold text-teal-700 hover:underline">Log In</Link>
        )}
      </nav>
    </header>
  )
}
