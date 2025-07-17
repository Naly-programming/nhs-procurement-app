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
  const [hasDataPolicy, setHasDataPolicy] = useState(false)
  const [hasICORegistration, setHasICORegistration] = useState(false)
  const [isDSPToolkitCompliant, setIsDSPToolkitCompliant] = useState(false)

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
        setHasDataPolicy(data.step_data.has_data_policy || false)
        setHasICORegistration(data.step_data.has_ico_registration || false)
        setIsDSPToolkitCompliant(data.step_data.is_dsp_toolkit_compliant || false)
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
      has_data_policy: hasDataPolicy,
      has_ico_registration: hasICORegistration,
      is_dsp_toolkit_compliant: isDSPToolkitCompliant,
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
      <h2 className="text-2xl font-bold mb-6">Step 2: Product & Compliance Info</h2>

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

      <label className="block mb-4">
        <input
          type="checkbox"
          checked={hasDataPolicy}
          onChange={(e) => setHasDataPolicy(e.target.checked)}
          className="mr-2"
        />
        Do you have a Data Protection Policy?
      </label>

      <label className="block mb-4">
        <input
          type="checkbox"
          checked={hasICORegistration}
          onChange={(e) => setHasICORegistration(e.target.checked)}
          className="mr-2"
        />
        Are you ICO Registered?
      </label>

      <label className="block mb-6">
        <input
          type="checkbox"
          checked={isDSPToolkitCompliant}
          onChange={(e) => setIsDSPToolkitCompliant(e.target.checked)}
          className="mr-2"
        />
        Are you DSP Toolkit Compliant?
      </label>

      <div className="flex justify-between">
        <button onClick={handleBack} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors"
        >
          Next Step
        </button>
      </div>
    </section>
  )
}
