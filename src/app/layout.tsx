import './globals.css'
import './styles/animations.css'
import { Inter } from 'next/font/google'
import Web3Provider from './context/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LinkLocker - Web3 Link Manager',
  description: 'Simpan dan bagikan link dengan aman menggunakan teknologi blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900`}>
        {/* Stars background effect */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                '--twinkle-duration': `${Math.random() * 5 + 3}s`,
                '--twinkle-delay': `${Math.random() * 5}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
        
        <Web3Provider>
          {children}
        </Web3Provider>
        
        <footer className="text-center py-4 backdrop-blur-md bg-gray-900/70 border-t border-indigo-500/20 shadow-lg mt-8">
          <p className="text-gray-300 text-sm font-medium">
            LinkLocker &copy; {new Date().getFullYear()} - Dibangun dengan teknologi
            <span className="text-indigo-400 font-bold"> Web3</span> untuk masa depan
          </p>
        </footer>
      </body>
    </html>
  )
}
