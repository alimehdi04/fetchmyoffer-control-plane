import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Secure the cron job so only Vercel can trigger it
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch all successfully deployed instances
    const instances = await prisma.instance.findMany({
      where: { status: 'DEPLOYED' }
    });

    if (instances.length === 0) {
      return NextResponse.json({ message: 'No instances to wake up.' });
    }

    // 2. Prepare the fetch promises (so we don't wait for each one to finish)
    const wakeUpCalls = instances.flatMap((instance) => {
      const calls = [];
      
      if (instance.brainUrl) {
        calls.push(fetch(`${instance.brainUrl}/api/v1/public/health-check`).catch(e => console.error("Brain ping failed:", e)));
      }
      
      if (instance.scraperUrl) {
        calls.push(fetch(`${instance.scraperUrl}/ping`).catch(e => console.error("Scraper ping failed:", e)));
      }
      
      return calls;
    });

    // 3. Fire them all simultaneously!
    await Promise.allSettled(wakeUpCalls);

    return NextResponse.json({ 
      success: true, 
      message: `Pre-warm signals sent to ${instances.length} user instances.` 
    });

  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}