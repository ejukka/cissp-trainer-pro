'use client'

import { Navigation } from '@/components/navigation'
import { Dashboard } from '@/components/dashboard'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 safe-top safe-bottom max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              CISSP Trainer Pro
            </h1>
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto">
              Master the CISSP certification with our professional training platform
            </p>
          </div>

          <Dashboard />
        </motion.div>
      </main>
    </div>
  )
}
