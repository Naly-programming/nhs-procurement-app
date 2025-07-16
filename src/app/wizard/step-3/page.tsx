import { Suspense } from 'react'
import WizardStepThree from './WizardStepThree'

export default function StepThreePage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading step...</p>}>
      <WizardStepThree />
    </Suspense>
  )
}
