'use client'

import Link from 'next/link'
import { templates } from '@/lib/templates'

export default function TemplatesPage() {
  const grouped = templates.reduce<Record<string, typeof templates>>( (acc, t) => {
    acc[t.category] = acc[t.category] || []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Templates</h1>
      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">{cat}</h2>
          <ul className="space-y-3">
            {list.map(t => (
              <li key={t.id} className="border p-4 rounded">
                <h3 className="font-medium">{t.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{t.description}</p>
                <Link href={`/dashboard/templates/${t.id}`} className="text-primary underline">Use Template</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
