import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FusionBridge - Bridge Your Future",
  description:
    "Learn, Grow, Earn, and Connect with FusionBridge - The ultimate platform for students and professionals.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {/* App shell locked to viewport */}
          <div className="h-screen overflow-hidden bg-white dark:bg-[#121212] transition-colors duration-500">
            {/* Top header (non-scrollable) */}
            <Header />

            {/* Content area below header */}
            <div className="h-[calc(100vh-64px)]">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
