import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust this path if your authOptions is stored elsewhere

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FetchMyOffer - Autonomous AI Recruiter',
  description: 'Deploy your own private AI job hunter on serverless infrastructure.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch session directly on the server to pass to the Header
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      {/* The flex & min-h-screen classes here ensure that the footer 
        always gets pushed to the absolute bottom of the screen!
      */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}>
        
        <Header session={session} />
        
        {/* Main content expands to fill available space */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        <Footer />
        
      </body>
    </html>
  )
}