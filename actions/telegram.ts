'use server'

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 

const prisma = new PrismaClient();

export async function generateTelegramLink() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  // Check if they already have a code
  let linkRecord = await prisma.telegramLink.findUnique({
    where: { userId: user.id }
  });

  // If not, generate a random 6-character code and save it
  if (!linkRecord) {
    const code = crypto.randomBytes(3).toString('hex'); 
    
    linkRecord = await prisma.telegramLink.create({
      data: {
        userId: user.id,
        linkCode: code,
      }
    });
  }

  return {
    linkCode: linkRecord.linkCode,
    isLinked: linkRecord.isLinked,
    botUsername: process.env.TELEGRAM_BOT_USERNAME
  };
}