import "./globals.css"
import Providers from "./providers"
import Header from "@/components/header"
import NavbarLayout from "@/components/navbar/navbar-layout"

export const metadata = {
  title: "FusionBridge",
  description: "Learn • Grow • Earn",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* App Shell */}
          <div className="h-screen flex flex-col overflow-hidden">
            
            {/* Top Navbar */}
            <Header />

            {/* Sidebar + Page Content */}
            <div className="flex flex-1 overflow-hidden">
              <NavbarLayout>
                {children}
              </NavbarLayout>
            </div>

          </div>
        </Providers>
      </body>
    </html>
  )
}
