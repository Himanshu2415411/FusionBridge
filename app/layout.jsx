import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FusionBridge - Bridge Your Future",
  description:
    "Learn, Grow, Earn, and Connect with FusionBridge - The ultimate platform for students and professionals.",
  keywords: "education, learning, career development, freelancing, community",
  authors: [{ name: "FusionBridge Team" }],
  creator: "FusionBridge",
  publisher: "FusionBridge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: "v0.dev",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors duration-500">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
