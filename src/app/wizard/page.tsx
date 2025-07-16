'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WizardStepOne() {
  const { user } = useUser()
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')

  const handleNext = async () => {
    try {
          console.log('Full user object:', user)
    console.log('Current user ID:', user?.id)
    const session = await supabase.auth.getSession()
console.log('Supabase session:', session)
      const { data, error } = await supabase
        .from('intake_responses')
        .insert([
          {
            user_id: user?.id,
            step_data: {
              company_name: companyName,
              website,
            },
          },
        ])
        .select()
        .single()

      if (error || !data) {
        console.error('Insert error:', error)
        alert('Error starting wizard')
        return
      }

      const intakeId = data.id
      router.push(`/wizard/step-2?intake_id=${intakeId}`)
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Unexpected error starting wizard')
    }
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Step 1: Company Info</h2>

      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <input
        type="text"
        placeholder="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="w-full border p-2 mb-4"
      />

      <button
        onClick={handleNext}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
      >
        Next Step
      </button>
    </section>
  )
}
