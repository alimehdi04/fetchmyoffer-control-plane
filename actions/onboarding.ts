'use server'

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { encrypt } from '@/lib/encryption';

const prisma = new PrismaClient();

interface OnboardingData {
  groqKey: string;
  geminiKey: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  renderApiKey: string;
}

export async function saveUserVault(data: OnboardingData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  // 1. Bundle and Encrypt the keys!
  const sensitiveData = JSON.stringify(data);
  const { encryptedData, iv, authTag } = encrypt(sensitiveData);

  // 2. Save to the Vault (Upsert ensures we update if it already exists)
  await prisma.vault.upsert({
    where: { userId: user.id },
    update: {
      encryptedData,
      iv,
      authTag,
    },
    create: {
      userId: user.id,
      encryptedData,
      iv,
      authTag,
    }
  });

  // 3. Create a PENDING Instance record so the deployment engine knows it's ready
  await prisma.instance.upsert({
    where: { userId: user.id },
    update: { status: 'PENDING' },
    create: {
      userId: user.id,
      status: 'PENDING'
    }
  });

  return { success: true };
}