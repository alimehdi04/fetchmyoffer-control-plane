'use server'

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { decrypt } from '@/lib/encryption';
import { getRenderOwnerId, deployScraper, deployBrain } from '@/lib/renderApi';
import { updateServiceEnvVars } from '@/lib/renderApi'; // Add this to your imports at the top!

const prisma = new PrismaClient();

export async function triggerDeployment() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vault: true, telegramLink: true }
  });

  if (!user || !user.vault) throw new Error("Vault not found");

  // 1. Decrypt the keys!
  const decryptedString = decrypt(
    user.vault.encryptedData,
    user.vault.iv,
    user.vault.authTag
  );
  
  const keys = JSON.parse(decryptedString);

  try {
    // 2. Get Render Owner ID
    const ownerId = await getRenderOwnerId(keys.renderApiKey);

    // 3. Deploy Scraper
    const scraperService = await deployScraper(keys.renderApiKey, ownerId, user.id);
    const scraperUrl = scraperService.service.serviceDetails.url;

    // // 4. Prepare Environment Variables for the Brain
    // const dbUrl = keys.supabaseUrl;
    // const userMatch = dbUrl.match(/user=([^&]+)/);
    // const passMatch = dbUrl.match(/password=([^&]+)/);
    
    // const dbUsername = userMatch ? userMatch[1] : "postgres";
    // const dbPassword = passMatch ? passMatch[1] : keys.supabaseServiceKey;

    // const brainEnvVars = [
    //   { key: "DB_URL", value: dbUrl },
    //   { key: "DB_USERNAME", value: dbUsername }, // 🛑 Injects the correct pooler username
    //   { key: "DB_PASSWORD", value: dbPassword }, // 🛑 Injects your actual password
    //   { key: "GROQ_API_KEY", value: keys.groqKey },
    //   { key: "GEMINI_API_KEY", value: keys.geminiKey },
    //   { key: "TELEGRAM_BOT_TOKEN", value: process.env.TELEGRAM_BOT_TOKEN || "" },
    //   { key: "TELEGRAM_CHAT_ID", value: user.telegramLink?.chatId || "" },
    //   { key: "SCRAPER_URL", value: `${scraperUrl}/api/v1/scrape` }
    // ];

    // // 5. Deploy Brain
    // const brainService = await deployBrain(keys.renderApiKey, ownerId, user.id, brainEnvVars);
    // const brainUrl = brainService.service.serviceDetails.url;

    // // 6. Update Database with the live URLs
    // await prisma.instance.update({
    //   where: { userId: user.id },
    //   data: {
    //     scraperUrl: scraperUrl,
    //     brainUrl: brainUrl,
    //     status: 'DEPLOYED'
    //   }
    // });

    // 4. Prepare Environment Variables for the Brain
    // (Notice we applied your SCRAPER_URL fix here too!)
    const dbUrl = keys.supabaseUrl;
    const userMatch = dbUrl.match(/user=([^&]+)/);
    const passMatch = dbUrl.match(/password=([^&]+)/);
    
    const brainEnvVars = [
      { key: "DB_URL", value: dbUrl },
      { key: "DB_USERNAME", value: userMatch ? userMatch[1] : "postgres" }, 
      { key: "DB_PASSWORD", value: passMatch ? passMatch[1] : keys.supabaseServiceKey }, 
      { key: "GROQ_API_KEY", value: keys.groqKey },
      { key: "GEMINI_API_KEY", value: keys.geminiKey },
      { key: "TELEGRAM_BOT_TOKEN", value: process.env.TELEGRAM_BOT_TOKEN || "" },
      { key: "TELEGRAM_CHAT_ID", value: user.telegramLink?.chatId || "" },
      { key: "SCRAPER_URL", value: `${scraperUrl}/api/v1/scrape` } // 🛑 Your brilliant fix
    ];

    // 5. Deploy Brain (Initial Creation)
    const brainService = await deployBrain(keys.renderApiKey, ownerId, user.id, brainEnvVars);
    const brainUrl = brainService.service.serviceDetails.url;
    const brainServiceId = brainService.service.id;

    // 6. The Webhook Injection! (Two-Step Deploy)
    // Now that Render has assigned a URL, we inject it back into the instance
    brainEnvVars.push({ 
      key: "WEBHOOK_URL", 
      value: `${brainUrl}/api/v1/webhooks/scrape-results` 
    });
    
    // Fire the PUT request we just wrote to update the variables
    
    await updateServiceEnvVars(keys.renderApiKey, brainServiceId, brainEnvVars);

    // 7. Update Database with the live URLs
    await prisma.instance.update({
      where: { userId: user.id },
      data: {
        scraperUrl: scraperUrl,
        brainUrl: brainUrl,
        status: 'DEPLOYED'
      }
    });

    return { success: true, scraperUrl, brainUrl };

  } catch (error) {
    console.error("Deployment failed:", error);
    await prisma.instance.update({
      where: { userId: user.id },
      data: { status: 'FAILED' }
    });
    throw error;
  }
}