import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Figtree, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { LoginModalProvider } from '@/components/auth/login-modal-provider'
import { Navbar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme/theme-provider'

const figtree = Figtree({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CareerCommit | Premium Resume Workspace',
  description:
    'Maintain, edit, and version your resume with a polished, ATS-safe workflow. Upload, optimize, and export without losing your originals.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
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
    <html
      lang="en"
      className={`${figtree.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <LoginModalProvider>
              <Navbar />
              {children}
            </LoginModalProvider>
          </AuthProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
