'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { teardownInfrastructure } from '@/actions/teardown'
import { AlertTriangle } from 'lucide-react'

export default function TeardownButton() {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleTeardown = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      const result = await teardownInfrastructure();
      if (result.success) {
        alert("💥 " + result.message);
        // Force a hard reload to reset the dashboard state and push them to onboarding
        window.location.href = '/onboarding'; 
      } else {
        alert("⚠️ " + result.message);
        setConfirming(false);
      }
    } catch (error) {
      console.error(error);
      alert("❌ An unexpected error occurred.");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-red-200 dark:border-red-900/30">
      <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" /> Danger Zone
      </h3>
      <p className="text-xs text-zinc-500 mb-4">
        This will permanently delete your live Spring Boot and Python servers from Render. You will stop receiving job matches until you deploy again.
      </p>
      <Button 
        onClick={handleTeardown} 
        disabled={loading}
        variant={confirming ? "destructive" : "outline"}
        className={confirming ? "w-full" : "w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"}
      >
        {loading ? "Destroying Infrastructure..." : confirming ? "Click again to confirm destruction" : "Delete Infrastructure"}
      </Button>
    </div>
  )
}