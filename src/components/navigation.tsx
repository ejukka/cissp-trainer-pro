'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  BookOpen, 
  Brain, 
  Trophy, 
  ChartBar, 
  Settings, 
  Menu, 
  X, 
  Moon, 
  Sun,
  GraduationCap
} from 'lucide-react'
import { useTheme } from './theme-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: BookOpen, label: 'Study', href: '/study' },
  { icon: Brain, label: 'Practice', href: '/practice' },
  { icon: Trophy, label: 'Achievements', href: '/achievements' },
  { icon: ChartBar, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 z-50 glass-dark border-b border-dark-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <GraduationCap className="w-8 h-8 text-primary-500" />
                <span className="text-xl font-bold gradient-text">CISSP Pro</span>
              </Link>

              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg
                        transition-all duration-200 
                        ${isActive 
                          ? 'bg-primary-500/20 text-primary-400' 
                          : 'text-dark-300 hover:text-white hover:bg-dark-800'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary-400" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden sticky top-0 z-50 glass-dark border-b border-dark-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">CISSP Pro</span>
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-primary-400" />
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors touch-target"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-dark-800"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg
                          transition-all duration-200 touch-target
                          ${isActive 
                            ? 'bg-primary-500/20 text-primary-400' 
                            : 'text-dark-300 hover:text-white hover:bg-dark-800'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-lg">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
