import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brainUrl = searchParams.get('brainUrl');
  const scraperUrl = searchParams.get('scraperUrl');

  if (!brainUrl || !scraperUrl) {
    return NextResponse.json({ error: 'Missing URLs' }, { status: 400 });
  }

  // Helper function to ping a URL with a strict timeout
  const ping = async (url: string) => {
    try {
      // Set a 3-second timeout limit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) return 'awake';
      return 'error';
    } catch (error: any) {
      // If the abort controller triggered, it means the server is cold-starting
      if (error.name === 'AbortError') return 'sleeping';
      return 'error';
    }
  };

  // Ping both servers concurrently so it never takes longer than 3 seconds total
  const [brainStatus, scraperStatus] = await Promise.all([
    ping(`${brainUrl}/api/v1/public/health-check`),
    ping(`${scraperUrl}/health`) // Ensure this matches your Python scraper's actual health endpoint!
  ]);

  return NextResponse.json({ brain: brainStatus, scraper: scraperStatus });
}