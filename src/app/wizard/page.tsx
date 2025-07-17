'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface StepOneData {
  company_name: string
  website: string
}

interface IntakeInsertResponse {
  id: number
}

export default function WizardStepOne() {
  const { user } = useUser()
  const router = useRouter()
  const [companyName, setCompanyName] = useState<string>('')
  const [website, setWebsite] = useState<string>('')

  const handleNext = async () => {
    if (!user?.id) {
      alert('User not authenticated')
      return
    }

    const stepData: StepOneData = {
      company_name: companyName,
      website,
    }

    const { data, error } = await supabase
      .from('intake_responses')
      .insert([
        {
          user_id: user.id,
          step_data: stepData,
        },
      ])
      .select()
      .single<IntakeInsertResponse>()

    if (error || !data) {
      console.error('Insert error:', error)
      alert('Error starting wizard')
      return
    }

    router.push(`/wizard/step-2?intake_id=${data.id}`)
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
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors"
      >
        Next Step
      </button>
    </section>
  )
}
