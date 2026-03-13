import OnboardingWizard from '@/components/OnboardingWizard';
import { generateTelegramLink } from '@/actions/telegram';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  // 1. Check if the user is logged in!
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    // If not logged in, send them to the NextAuth login page
    redirect('/api/auth/signin?callbackUrl=/onboarding'); 
  }

  // 2. Now it's safe to fetch their data because we know they exist
  const telegramData = await generateTelegramLink();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">Welcome to FetchMyOffer</h1>
        <p className="text-zinc-500 mt-2">Let&apos;s set up your autonomous AI recruiter.</p>
      </div>
      
      <OnboardingWizard linkCode={telegramData.linkCode} />
    </main>
  );
}