// components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 px-6 text-sm text-gray-600 border-t">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <span className="mb-2 sm:mb-0">
          © {new Date().getFullYear()} NHS Ready Ltd. All rights reserved.
        </span>
        <div className="space-x-4">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
