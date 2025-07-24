'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { templates } from '@/lib/templates'
import { useUser } from '@/lib/UserContext'

export default function TemplateWizardPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useUser()
  const template = templates.find(t => t.id === params.id)
  const [values, setValues] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)

  if (!template) return <div className="p-8">Template not found</div>

  const handleCreate = async () => {
    if (!user?.id) return
    const filled = template.clauses.map(c => {
      let text = c
      template.questions.forEach(q => {
        text = text.replace(`{{${q.key}}}`, values[q.key] || '')
      })
      return text
    })
    setCreating(true)
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        title: template.title,
        content: JSON.stringify(filled)
      })
    })
    const data = await res.json()
    router.push(`/dashboard/contracts/${data.id}`)
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-2xl font-bold">{template.title}</h1>
      {template.questions.map(q => (
        <div key={q.key} className="space-y-1">
          <label className="block text-sm font-medium">{q.label}</label>
          <input
            className="border px-3 py-2 rounded w-full"
            value={values[q.key] || ''}
            onChange={e => setValues({ ...values, [q.key]: e.target.value })}
          />
        </div>
      ))}
      <button
        onClick={handleCreate}
        disabled={creating}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        {creating ? 'Creating...' : 'Create Document'}
      </button>
    </section>
  )
}
