import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/lib/UserContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Coentry',
  description: 'Healthcare Procurement Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <UserProvider>
          <Header />
          <main className="flex-grow px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:py-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  )
}
