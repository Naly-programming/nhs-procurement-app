// app/page.tsx
export default function Home() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4">
        NHS Procurement, Simplified.
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        We help digital health companies become NHS procurement-ready in days, not months.
      </p>
      <div className="space-x-4">
        <a href="/signup" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition">
          Get Started
        </a>
        <a href="/contact" className="text-teal-600 font-semibold hover:underline">
          Book Demo
        </a>
      </div>
    </section>
  )
}
