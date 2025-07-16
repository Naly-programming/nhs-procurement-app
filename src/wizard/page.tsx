'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@lib/supabaseClient'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 1, label: 'Company Info' },
  { id: 2, label: 'Product Summary' },
  { id: 3, label: 'NHS Readiness' },
]

export default function WizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<any>({})
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.push('/login')
      else setUserId(data.user.id)
    }
    getUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const saveStepData = async () => {
    if (!userId) return
    await supabase.from('intake_responses').upsert({
      user_id: userId,
      step_data: formData,
      submitted_at: new Date().toISOString(),
    })
  }

  const next = async () => {
    await saveStepData()
    setStep((s) => Math.min(s + 1, steps.length))
  }

  const prev = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <label className="block mb-2 font-medium">Company Name</label>
            <input className="w-full border p-2 mb-4" name="companyName" onChange={handleChange} />
            <label className="block mb-2 font-medium">Website</label>
            <input className="w-full border p-2" name="website" onChange={handleChange} />
          </>
        )
      case 2:
        return (
          <>
            <label className="block mb-2 font-medium">Product Description</label>
            <textarea className="w-full border p-2" name="productDescription" onChange={handleChange} />
          </>
        )
      case 3:
        return (
          <>
            <label className="block mb-2 font-medium">Do you have an NHS contract?</label>
            <input className="w-full border p-2" name="nhsContract" onChange={handleChange} />
            <label className="block mb-2 mt-4 font-medium">Is your product compliant with DTAC?</label>
            <input className="w-full border p-2" name="dtacStatus" onChange={handleChange} />
          </>
        )
      default:
        return <p>All done!</p>
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-2xl font-bold text-teal-700">NHS Readiness Wizard</h1>
      <p className="text-gray-600">Step {step} of {steps.length}: {steps[step - 1]?.label}</p>

      <form className="space-y-6">
        {renderStep()}
        <div className="flex gap-4 mt-6">
          {step > 1 && <button type="button" onClick={prev} className="px-4 py-2 border rounded">Back</button>}
          {step < steps.length
            ? <button type="button" onClick={next} className="bg-teal-600 text-white px-4 py-2 rounded">Next</button>
            : <button type="button" onClick={saveStepData} className="bg-teal-600 text-white px-4 py-2 rounded">Save</button>}
        </div>
      </form>
    </section>
  )
}
