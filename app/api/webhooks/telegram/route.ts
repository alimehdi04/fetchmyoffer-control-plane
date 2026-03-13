import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ensure this is a standard text message
    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = body.message.chat.id.toString();
    const text = body.message.text.trim();

    // Check if the message is a start command with a payload (e.g., "/start 8f72a")
    if (text.startsWith('/start ')) {
      const linkCode = text.split(' ')[1]; // Extracts "8f72a"

      // Find the user with this specific code
      const telegramLink = await prisma.telegramLink.findUnique({
        where: { linkCode: linkCode },
        include: { user: true }
      });

      if (telegramLink && !telegramLink.isLinked) {
        // Update the database to link the account!
        await prisma.telegramLink.update({
          where: { id: telegramLink.id },
          data: {
            chatId: chatId,
            isLinked: true,
          },
        });

        // Send a success message back to the user via Telegram API
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🎉 Success, ${telegramLink.user.name}! Your account is now linked. We will send your AI job matches here.`
          })
        });

        return NextResponse.json({ status: 'success' });
      }
    }

    return NextResponse.json({ status: 'unhandled' });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}