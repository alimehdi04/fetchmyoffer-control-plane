import { Bot } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-8 text-center mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-2 opacity-50 text-zinc-900 dark:text-white">
          <Bot className="w-5 h-5" />
          <span className="font-bold tracking-tight">FetchMyOffer</span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} FetchMyOffer. BYOK Serverless Architecture.
        </p>
      </div>
    </footer>
  )
}