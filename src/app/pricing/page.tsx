// app/pricing/page.tsx
export default function PricingPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Simple, Transparent Pricing</h1>
        <p className="text-gray-600">No hidden fees. Cancel anytime.</p>
      </div>

      {/* Pricing Tiers */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Free */}
        <div className="border rounded-xl p-6 shadow-sm bg-white flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <p className="text-3xl font-bold text-primary mb-4">£0</p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li>1 Procurement Plan</li>
            <li>Basic NHS Guidance</li>
            <li>Email Support</li>
          </ul>
          <a href="/signup" className="bg-primary text-white px-5 py-2 rounded hover:bg-primary-hover transition-colors">Get Started</a>
        </div>

        {/* Pro */}
        <div className="border-2 border-primary rounded-xl p-6 shadow-md bg-white flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-3xl font-bold text-primary mb-4">£99<span className="text-base font-medium">/month</span></p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li>Unlimited Plans</li>
            <li>PDF Export</li>
            <li>AI-Generated Suggestions</li>
            <li>NHS Readiness Score</li>
          </ul>
          <a href="/signup" className="bg-primary text-white px-5 py-2 rounded hover:bg-primary-hover transition-colors">Start Trial</a>
        </div>

        {/* Enterprise */}
        <div className="border rounded-xl p-6 shadow-sm bg-white flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
          <p className="text-3xl font-bold text-primary mb-4">Custom</p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li>Team Access</li>
            <li>Dedicated Consultant</li>
            <li>Tender Support</li>
            <li>Custom Features</li>
          </ul>
          <a href="/contact" className="bg-primary text-white px-5 py-2 rounded hover:bg-primary-hover transition-colors">Contact Sales</a>
        </div>
      </div>

      {/* FAQ (optional starter structure) */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-2xl mx-auto text-sm text-gray-600">
          <details className="border p-4 rounded">
            <summary className="font-semibold text-gray-800 cursor-pointer">Can I cancel anytime?</summary>
            <p className="mt-2">Yes, you can cancel your subscription from your account dashboard with no penalty.</p>
          </details>
          <details className="border p-4 rounded">
            <summary className="font-semibold text-gray-800 cursor-pointer">What happens if I exceed the free plan?</summary>
            <p className="mt-2">You&apos;ll be prompted to upgrade to Pro if you want to generate more documents or export them.</p>
          </details>
        </div>
      </div>
    </section>
  )
}
