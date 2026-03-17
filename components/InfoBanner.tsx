'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'

export default function InfoBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('hideDeploymentBanner') !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('hideDeploymentBanner', 'true');
    } catch {
      // Silently fail — banner simply won't stay dismissed across sessions
    }
  }

  if (!isVisible) return null;

  return (
    <div className="relative bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3 text-blue-800 dark:text-blue-300 shadow-sm transition-all duration-300 ease-in-out">
      <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="pr-6">
        <h4 className="font-semibold text-sm">Initial Deployment Notice</h4>
        <p className="text-sm opacity-90 mt-1">
          Because we provision brand new cloud infrastructure specifically for you, your first deployment will take approximately <strong>15-20 minutes</strong> to build and start on Render.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-md text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}