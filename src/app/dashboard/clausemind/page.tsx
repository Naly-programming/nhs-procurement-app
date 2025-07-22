'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import TiptapEditor from '@/components/TiptapEditor'

export default function ClauseMindPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [clause, setClause] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  const handleAction = async (action: 'explain' | 'rewrite' | 'simplify') => {
    if (!clause.trim()) return
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/clausemind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: clause })
      })
      const data = await res.json()
      if (res.ok) setResult(data.result)
      else setResult(data.error || 'Request failed')
    } catch (err) {
      setResult('Request failed')
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) {
    return <div className="max-w-4xl mx-auto px-6 py-16">Loading...</div>
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-primary">ClauseMind</h1>
      <p className="text-gray-700">AI-assisted clause editor</p>
      <TiptapEditor content={clause} onUpdate={setClause} />
      <div className="space-x-4">
        <button
          onClick={() => handleAction('explain')}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
        >
          Explain
        </button>
        <button
          onClick={() => handleAction('rewrite')}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
        >
          Rewrite
        </button>
        <button
          onClick={() => handleAction('simplify')}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
        >
          Simplify
        </button>
      </div>
      {result && (
        <div className="border rounded p-4 bg-gray-50 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </section>
  )
}
