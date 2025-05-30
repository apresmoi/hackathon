import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TrustGPT - Building Trust Through AI',
  description: 'An AI-powered platform designed to help you build, restore, and leverage trust in your relationships, workplace, and organization.',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      }
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
