import type { Metadata } from 'next'
import { MobileWall } from '@/components/mobile-wall'
import './globals.css'

export const metadata: Metadata = {
  title: 'Propstical Canvas — See it before you spend on it',
  description: 'India\u2019s first AI home decision canvas. Lay out your renovation visually, let AI catch conflicts before you commit.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Propstical Canvas',
    description: 'India\u2019s first AI home decision canvas. Think clearly before you commit.',
    url: 'https://propstical.com',
    siteName: 'Propstical',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propstical Canvas',
    description: 'India\u2019s first AI home decision canvas. Think clearly before you commit.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <MobileWall />
        {children}
      </body>
    </html>
  )
}
