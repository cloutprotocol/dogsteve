import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'STEVE',
  description: 'STEVE',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  openGraph: {
    title: 'STEVE',
    description: 'STEVE',
    images: ['/steve.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STEVE',
    description: 'STEVE',
    images: ['/steve.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}