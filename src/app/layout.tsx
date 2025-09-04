import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOBI - 스마트 결제 비교 플랫폼',
  description: '결제수단별 최저가 비교로 최대 절약하세요',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}