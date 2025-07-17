// app/page.tsx
export default function Home() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
          NHS Procurement, <span className="text-accent">Simplified</span>.
        </h1>
        <p className="text-lg sm:text-xl text-secondary mb-10 max-w-2xl mx-auto">
          We help digital health companies become NHS procurement-ready in days, not months.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/signup"
            className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary-hover transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            Get Started
          </a>
          <a
            href="/contact"
            className="px-8 py-4 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary/10 transition-all duration-300"
          >
            Book Demo
          </a>
        </div>
      </div>
    </section>
  )
}
