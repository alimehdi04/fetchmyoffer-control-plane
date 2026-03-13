import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ForceHuntButton from '@/components/ForceHuntButton';
import ResumeUpload from '@/components/ResumeUpload';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect('/api/auth/signin?callbackUrl=/dashboard');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      instance: true,
      telegramLink: true,
    }
  });

  // If they haven't deployed anything, send them to onboarding
  if (!user?.instance) {
    redirect('/onboarding');
  }

  const { instance, telegramLink } = user;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name?.split(' ')[0]}!</h1>
          <p className="text-zinc-500">Manage your autonomous AI recruiter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Your personal infrastructure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Deployment</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  instance.status === 'DEPLOYED' ? 'bg-green-100 text-green-800' : 
                  instance.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {instance.status}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Brain Server (Java):</p>
                <a href={instance.brainUrl || '#'} target="_blank" className="text-xs text-blue-500 hover:underline break-all">
                  {instance.brainUrl || 'Provisioning...'}
                </a>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Scraper Server (Python):</p>
                <a href={instance.scraperUrl || '#'} target="_blank" className="text-xs text-blue-500 hover:underline break-all">
                  {instance.scraperUrl || 'Provisioning...'}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Controls</CardTitle>
              <CardDescription>Trigger actions on demand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg mb-4">
                <p className="text-sm text-center">
                  Telegram Linked: {telegramLink?.isLinked ? "✅ Yes" : "❌ No"}
                </p>
              </div>

              {instance.status === 'DEPLOYED' && instance.brainUrl ? (
                <ForceHuntButton brainUrl={instance.brainUrl} />
              ) : (
                <p className="text-sm text-center text-zinc-500">
                  Controls will unlock once deployment finishes.
                </p>
              )}
            </CardContent>
          </Card>
          {/* AI Knowledge Base Card */}
          <Card>
            <CardHeader>
              <CardTitle>AI Knowledge Base</CardTitle>
              <CardDescription>Upload your latest resume to calibrate your AI recruiter.</CardDescription>
            </CardHeader>
            <CardContent>
              {instance.status === 'DEPLOYED' && instance.brainUrl ? (
                <ResumeUpload />
              ) : (
                <p className="text-sm text-center text-zinc-500">
                  Upload unlocks once deployment finishes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}