'use client'

import { useEffect, useState } from 'react';
import { Activity, Moon, XCircle, Loader2 } from 'lucide-react';

export default function ServerStatus({ brainUrl, scraperUrl }: { brainUrl: string, scraperUrl: string }) {
  const [status, setStatus] = useState<{brain: string, scraper: string}>({ brain: 'loading', scraper: 'loading' });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/health-check?brainUrl=${encodeURIComponent(brainUrl)}&scraperUrl=${encodeURIComponent(scraperUrl)}`);
        const data = await res.json();
        setStatus({ brain: data.brain, scraper: data.scraper });
      } catch (error) {
        setStatus({ brain: 'error', scraper: 'error' });
      }
    };

    checkStatus();
    
    // Optional: Re-ping every 15 seconds to auto-update the UI when they wake up!
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [brainUrl, scraperUrl]);

  // A tiny helper component for the badges
  const Badge = ({ state }: { state: string }) => {
    if (state === 'loading') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"><Loader2 className="w-3 h-3 animate-spin" /> Pinging...</span>;
    if (state === 'awake') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 dark:border-green-900/50 dark:bg-green-900/30 dark:text-green-400"><Activity className="w-3 h-3" /> Awake</span>;
    if (state === 'sleeping') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 dark:border-indigo-900/50 dark:bg-indigo-900/30 dark:text-indigo-400"><Moon className="w-3 h-3" /> Sleeping (Waking up...)</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3" /> Unreachable</span>;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Brain Server (Java):</p>
          <Badge state={status.brain} />
        </div>
        <a href={`${brainUrl}/api/v1/public/health-check`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all block">
          {brainUrl}
        </a>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Scraper Server (Python):</p>
          <Badge state={status.scraper} />
        </div>
        <a href={`${scraperUrl}/health`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all block">
          {scraperUrl}
        </a>
      </div>
    </div>
  );
}