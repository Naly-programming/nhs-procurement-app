'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // You can replace this with an API call (e.g., Resend, Formspree, Netlify Forms)
    console.log({ name, email, message })

    setSubmitted(true)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-teal-700 mb-4">Get in Touch</h1>
      <p className="text-gray-600 mb-8">
        Have questions or want a personalised demo? Fill out the form or book time directly using the calendar below.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4 mb-12">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full border rounded p-2"
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full border rounded p-2"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              className="w-full border rounded p-2 h-32"
              value={message}
              required
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700">
            Send Message
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mb-12">
          Thanks for getting in touch! We'll respond soon.
        </div>
      )}

      {/* Calendly Embed (optional) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Book a Demo Call</h2>
        <iframe
          src="https://calendly.com/YOUR_USERNAME/15min"
          className="w-full h-[600px] border rounded"
          frameBorder="0"
        />
      </div>
    </section>
  )
}
