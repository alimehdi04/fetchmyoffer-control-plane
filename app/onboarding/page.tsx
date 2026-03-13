import OnboardingWizard from '@/components/OnboardingWizard';
import { generateTelegramLink } from '@/actions/telegram';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/onboarding'); 
  }

  // Check if they already have a deployed instance
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { instance: true }
  });

  if (user?.instance && user.instance.status === 'DEPLOYED') {
      // Prevent double deployment
      redirect('/dashboard?error=already_deployed');
    }

  const telegramData = await generateTelegramLink();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
      <OnboardingWizard linkCode={telegramData.linkCode} />
    </main>
  );
}