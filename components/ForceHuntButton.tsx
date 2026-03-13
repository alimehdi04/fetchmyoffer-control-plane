'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { triggerRemoteHunt } from '@/actions/hunt'

export default function ForceHuntButton({ brainUrl }: { brainUrl: string }) {
  const [loading, setLoading] = useState(false);

  const handleForceHunt = async () => {
    setLoading(true);
    try {
      // Call our Next.js backend action instead of the Render URL directly
      const result = await triggerRemoteHunt(brainUrl);

      if (result.success) {
        alert("🚀 " + result.message + " Check your Telegram in a few minutes for job matches.");
      } else {
        alert("⚠️ " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleForceHunt} 
      disabled={loading}
      className="w-full"
    >
      {loading ? "Triggering Hunt..." : "🚀 Force Job Hunt Now"}
    </Button>
  )
}