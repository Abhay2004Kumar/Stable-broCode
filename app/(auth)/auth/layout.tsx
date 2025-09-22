import React from 'react'
import { ThemeToggle } from '@/components/ui/toggle-theme'

const AuthLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <main className='flex justify-center items-center h-screen flex-col bg-background transition-colors duration-300 relative'>
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="animate-fade-in">
          {children}
        </div>
    </main>
  )
}

export default AuthLayout