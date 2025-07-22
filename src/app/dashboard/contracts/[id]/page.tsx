'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/lib/UserContext'
import TiptapEditor from '@/components/TiptapEditor'

export default function ContractEditor() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [clauses, setClauses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchDoc = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', params.id)
        .maybeSingle()
      if (data) {
        setTitle(data.title)
        try {
          const arr = JSON.parse(data.content || '[]')
          setClauses(Array.isArray(arr) ? arr : [])
        } catch {
          setClauses([])
        }
      }
      setLoading(false)
    }
    fetchDoc()
  }, [user, params.id])

  const scheduleSave = (nextClauses: string[], nextTitle: string) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      await fetch(`/api/contracts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: nextTitle, content: JSON.stringify(nextClauses) }),
      })
    }, 1000)
  }

  const updateClause = (index: number, text: string) => {
    const copy = [...clauses]
    copy[index] = text
    setClauses(copy)
    scheduleSave(copy, title)
  }

  const addClause = () => {
    const copy = [...clauses, '']
    setClauses(copy)
    scheduleSave(copy, title)
  }

  const removeClause = (index: number) => {
    const copy = clauses.filter((_, i) => i !== index)
    setClauses(copy)
    scheduleSave(copy, title)
  }

  const moveClause = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= clauses.length) return
    const copy = [...clauses]
    const [item] = copy.splice(index, 1)
    copy.splice(newIndex, 0, item)
    setClauses(copy)
    scheduleSave(copy, title)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <input
        value={title}
        onChange={e => { setTitle(e.target.value); scheduleSave(clauses, e.target.value) }}
        className="w-full border px-3 py-2 rounded"
      />
      <ul className="space-y-4">
        {clauses.map((clause, i) => (
          <li key={i} className="border p-3 rounded space-y-2">
            <TiptapEditor
              content={clause}
              onUpdate={html => updateClause(i, html)}
            />
            <div className="flex gap-2 text-sm">
              <button onClick={() => moveClause(i, -1)} className="underline">Up</button>
              <button onClick={() => moveClause(i, 1)} className="underline">Down</button>
              <button onClick={() => removeClause(i)} className="underline text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={addClause} className="bg-primary text-white px-4 py-2 rounded">Add Clause</button>
      <div>
        <button onClick={() => router.push('/dashboard/contracts')} className="mt-4 underline">Back</button>
      </div>
    </section>
  )
}
