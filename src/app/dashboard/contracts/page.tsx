'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/lib/UserContext'

  interface Doc {
    id: string
    title: string
    created_at: string
    signature_url?: string | null
    sign_token?: string | null
  }

export default function ContractsPage() {
  const { user } = useUser()
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setDocs(data || [])
    }
    fetchDocs()
  }, [user])

  const handleNew = async () => {
    if (!user?.id) return
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, title: 'Untitled Document' })
    })
    const data = await res.json()
    if (data.id) {
      location.href = `/dashboard/contracts/${data.id}`
    }
  }

  const createSignLink = async (docId: string) => {
    const res = await fetch(`/api/contracts/${docId}/sign-request`, { method: 'POST' })
    const data = await res.json()
    if (data.link) {
      await navigator.clipboard.writeText(location.origin + data.link)
      alert('Sign link copied to clipboard')
    }
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Your Contracts</h1>
      <button
        onClick={handleNew}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
      >
        New Document
      </button>
      <ul className="divide-y">
        {docs.map(doc => (
          <li key={doc.id} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <Link href={`/dashboard/contracts/${doc.id}`} className="text-primary underline mr-2">
                {doc.title}
              </Link>
              <a href={`/api/contracts/${doc.id}/export`} className="text-sm underline mr-2">PDF</a>
            </div>
            <div className="flex gap-2 text-sm items-center">
              {doc.signature_url ? (
                <span className="text-green-600">Signed</span>
              ) : (
                <>
                  <Link href={`/dashboard/contracts/${doc.id}/sign`} className="text-primary underline">
                    Sign
                  </Link>
                  <button onClick={() => createSignLink(doc.id)} className="underline">Share Link</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
