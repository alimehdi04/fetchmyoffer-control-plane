import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-0 w-full h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200 via-zinc-50 to-zinc-50 dark:from-zinc-800 dark:via-zinc-950 dark:to-zinc-950 -z-10" />
      
      <div className="max-w-3xl space-y-8 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          FetchMyOffer v1.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Your Autonomous <span className="text-blue-600 dark:text-blue-500">AI Recruiter.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Deploy your own private server that hunts for jobs on auto-pilot. Zero monthly fees. 100% your infrastructure. Alerts delivered straight to your Telegram.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/onboarding">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-md px-8 py-6">
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-zinc-200 dark:border-zinc-800 mt-16 text-left">
          <div className="space-y-2">
            <Bot className="w-8 h-8 text-blue-500" />
            <h3 className="font-bold">Automated Hunting</h3>
            <p className="text-sm text-zinc-500">Scrapes top job boards while you sleep and analyzes matches with AI.</p>
          </div>
          <div className="space-y-2">
            <ShieldCheck className="w-8 h-8 text-green-500" />
            <h3 className="font-bold">Military-Grade Vault</h3>
            <p className="text-sm text-zinc-500">Your API keys are AES-256 encrypted. We never see your raw data.</p>
          </div>
          <div className="space-y-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h3 className="font-bold">Zero Platform Fees</h3>
            <p className="text-sm text-zinc-500">Built on a Bring-Your-Own-Key model. Pay nothing to use the platform.</p>
          </div>
        </div>
      </div>
    </main>
  );
}