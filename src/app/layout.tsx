import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PWA with Notifications',
  description: 'A Next.js PWA with notification functionality',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}