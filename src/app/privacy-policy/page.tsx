// app/privacy-policy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-4xl font-bold text-teal-700 mb-4">Privacy Policy</h1>
      <p className="text-gray-700">
        We take your privacy seriously. This policy explains how we collect, use, and protect your personal data when using NHS Ready.
      </p>
      <p className="text-gray-700">
        We only collect information that is necessary to provide our services. This may include your email, name, company, and any data you submit via the platform.
      </p>
      <p className="text-gray-700">
        We do not share your data with third parties unless required by law. All data is stored securely using industry-standard encryption on Supabase.
      </p>
      <p className="text-gray-700">
        You can request deletion of your account or data at any time by contacting support@nhsready.io.
      </p>
    </section>
  )
}
