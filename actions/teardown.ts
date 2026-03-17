'use server'

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { decrypt } from '@/lib/encryption';
import { deleteUserServices } from '@/lib/renderApi';

const prisma = new PrismaClient();

export async function teardownInfrastructure() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { vault: true, instance: true }
    });

    if (!user || !user.vault) throw new Error("User or vault not found");
    if (!user.instance) return { success: true, message: "No infrastructure to delete." };

    // 1. Decrypt Render API Key to authorize the deletion
    const decryptedString = decrypt(
      user.vault.encryptedData,
      user.vault.iv,
      user.vault.authTag
    );
    const keys = JSON.parse(decryptedString);

    // 2. Command Render to nuke the servers
    await deleteUserServices(keys.renderApiKey, user.id);

    // 3. Wipe the local database record
    await prisma.instance.delete({
      where: { userId: user.id }
    });

    return { success: true, message: "Infrastructure destroyed successfully." };
  } catch (error) {
    console.error("Teardown error:", error);
    return { success: false, message: "Failed to destroy infrastructure. Check logs." };
  }
}