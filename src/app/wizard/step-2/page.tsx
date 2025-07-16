import { Suspense } from 'react'
import WizardStepTwo from './WizardStepTwo'

export default function StepTwoPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading step...</p>}>
      <WizardStepTwo />
    </Suspense>
  )
}
