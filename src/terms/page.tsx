// app/terms/page.tsx
export default function TermsPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-4xl font-bold text-teal-700 mb-4">Terms & Conditions</h1>
      <p className="text-gray-700">
        By using Coentry, you agree to the following terms of service.
      </p>
      <p className="text-gray-700">
        The service is provided “as is” with no guarantees of accuracy or compliance. You are responsible for reviewing all output before using it in a formal procurement process.
      </p>
      <p className="text-gray-700">
        We reserve the right to suspend or terminate your account if you violate these terms or use the service inappropriately.
      </p>
      <p className="text-gray-700">
        These terms may change at any time. You will be notified of material changes via email or in-app notice.
      </p>
    </section>
  )
}

