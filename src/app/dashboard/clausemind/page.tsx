'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import TiptapEditor from '@/components/TiptapEditor'

export default function ClauseMindPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [clause, setClause] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const chatRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    setLoading(true)
    setShowChat(true)
    const history = [...messages, { role: 'user', text }]
    setMessages(history)
    try {
      const res = await fetch('/api/clausemind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, messages: history })
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(m => [...m, { role: 'ai', text: data.result }])
      } else {
        setMessages(m => [...m, { role: 'ai', text: data.error || 'Request failed' }])
      }
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Request failed' }])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'explain' | 'rewrite' | 'simplify') => {
    if (!clause.trim()) return
    const capital = action.charAt(0).toUpperCase() + action.slice(1)
    const prompt = `${capital} this clause:\n\n${clause}`
    await sendMessage(prompt)
  }

  if (!authChecked) {
    return <div className="max-w-4xl mx-auto px-6 py-16">Loading...</div>
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-primary">ClauseMind</h1>
      <p className="text-gray-700">AI-assisted clause editor</p>
      <div className="md:flex md:gap-6 mt-6">
        <div className="flex-1 flex flex-col space-y-4">
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
        </div>
        {showChat && (
          <div className="mt-6 md:mt-0 md:w-1/2 flex flex-col">
            <div
              ref={chatRef}
              className="border rounded p-4 bg-gray-50 flex-1 min-h-[24rem] overflow-y-auto space-y-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] whitespace-pre-wrap p-3 rounded-lg ${
                    m.role === 'user'
                      ? 'bg-primary text-white ml-auto'
                      : 'bg-white text-gray-900 shadow'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="italic text-gray-500">AI is thinking...</div>
              )}
            </div>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                const text = chatInput
                setChatInput('')
                sendMessage(text)
              }}
              className="mt-2 flex"
            >
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 border rounded-l px-3 py-2"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-r"
              >
                Send
              </button>
            </form>
          </div>
        )}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="mt-6 md:mt-0 md:w-1/2 border rounded p-2 text-sm text-gray-700"
          >
            Open AI Assistant
          </button>
        )}
      </div>
    </section>
  )
}
