import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mastical OS — AI-Powered Agency Operations',
  description: 'Your agency in your pocket. AI-powered content operations, neuromarketing scoring, and strategic consulting.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
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
        {children}
      </body>
    </html>
  )
}
