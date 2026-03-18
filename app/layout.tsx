import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TapNet',
  description: 'tap the world around you',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black antialiased">{children}</body>
    </html>
  )
}
