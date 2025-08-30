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
    type: 'website',
    images: [
      {
        url: '/steve.jpg',
        width: 1200,
        height: 630,
        alt: 'STEVE',
      }
    ],
    siteName: 'STEVE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STEVE',
    description: 'STEVE',
    images: ['/steve.jpg'],
    creator: '@dogstevecoin',
  },
  // Additional meta tags for better social sharing
  robots: 'index, follow',
  authors: [{ name: 'STEVE' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for iOS and social sharing */}
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image:alt" content="STEVE" />
        
        {/* iOS specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="STEVE" />
        <link rel="apple-touch-icon" href="/steve.jpg" />
        
        {/* Additional favicon and icon references */}
        <link rel="icon" href="/steve.jpg" />
        <link rel="shortcut icon" href="/steve.jpg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}