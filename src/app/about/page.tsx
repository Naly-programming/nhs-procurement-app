// app/about/page.tsx
export default function AboutPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      {/* Mission Section */}
      <div>
        <h1 className="text-4xl font-bold text-teal-700 mb-4">Our Mission</h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          We help digital health companies access the NHS faster by removing the friction of procurement, compliance, and integration. Our tools and consulting services make it simple to become NHS-ready—no jargon, no delays.
        </p>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Meet the Team</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg bg-white shadow-sm text-center">
              <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-gray-200" />
              <h3 className="text-lg font-bold">Name Placeholder</h3>
              <p className="text-sm text-gray-600">Role Placeholder</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Journey</h2>
        <ul className="border-l border-gray-300 pl-6 space-y-4">
          <li>
            <span className="block text-teal-600 font-bold">2023</span>
            Founded with the goal of simplifying NHS adoption.
          </li>
          <li>
            <span className="block text-teal-600 font-bold">2024</span>
            Built our first AI-powered procurement pack wizard.
          </li>
          <li>
            <span className="block text-teal-600 font-bold">2025</span>
            Launched publicly with NHS pilot and early adopters.
          </li>
        </ul>
      </div>

      {/* Partners Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Partners</h2>
        <div className="flex gap-6 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-32 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm"
            >
              Logo
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
