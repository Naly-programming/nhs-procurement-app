'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUser(user)
    }
    getUser()
  }, [router])

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-teal-700 mb-4">Welcome to Your Dashboard</h1>
      {user && (
        <p className="mb-6 text-gray-700">
          Logged in as <span className="font-semibold">{user.email}</span>
        </p>
      )}
      <div className="bg-white p-6 rounded-lg shadow border space-y-4">
        <p className="text-gray-700">You're just a few steps away from being NHS procurement-ready.</p>
        <a
          href="/wizard"
          className="inline-block bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
        >
          Start NHS Readiness Wizard
        </a>
      </div>
    </section>
  )
}
