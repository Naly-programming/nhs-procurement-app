'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'

export default function SignPage() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const router = useRouter()
  const sigPad = useRef<SignatureCanvas | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!sigPad.current) return
    const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png')
    setLoading(true)
    const token = search.get('token') || ''
    await fetch(`/api/contracts/${params.id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, token })
    })
    router.push('/dashboard/contracts')
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-12 space-y-4">
      <h1 className="text-xl font-bold">Sign Document</h1>
      <SignatureCanvas
        penColor="black"
        ref={sigPad}
        canvasProps={{ className: 'border w-full h-48' }}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover"
      >
        {loading ? 'Saving...' : 'Submit Signature'}
      </button>
    </section>
  )
}
