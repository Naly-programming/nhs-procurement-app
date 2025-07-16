'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WizardStepTwo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intakeId = searchParams.get('intake_id')

  const [productDesc, setProductDesc] = useState('')
  const [usedInNHS, setUsedInNHS] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('intake_responses')
        .select('step_data')
        .eq('id', intakeId)
        .single()

      if (data?.step_data) {
        setProductDesc(data.step_data.product_desc || '')
        setUsedInNHS(data.step_data.used_in_nhs || false)
      }
    }

    if (intakeId) fetchData()
  }, [intakeId])

  const handleNext = async () => {
    const { data: existing } = await supabase
      .from('intake_responses')
      .select('step_data')
      .eq('id', intakeId)
      .single()

    const updated = {
      ...existing?.step_data,
      product_desc: productDesc,
      used_in_nhs: usedInNHS,
    }

    await supabase
      .from('intake_responses')
      .update({ step_data: updated })
      .eq('id', intakeId)

    router.push(`/wizard/step-3?intake_id=${intakeId}`)
  }

  const handleBack = () => {
    router.push(`/wizard/step-1`)
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Step 2: Product Details</h2>
      <textarea
        placeholder="Product Description"
        value={productDesc}
        onChange={(e) => setProductDesc(e.target.value)}
        className="w-full border p-2 mb-4"
      />
      <label className="block mb-4">
        <input
          type="checkbox"
          checked={usedInNHS}
          onChange={(e) => setUsedInNHS(e.target.checked)}
          className="mr-2"
        />
        Has your product ever been used in the NHS?
      </label>

      <div className="flex justify-between">
        <button onClick={handleBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          Next Step
        </button>
      </div>
    </section>
  )
}
