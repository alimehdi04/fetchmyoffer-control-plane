'use server'

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function uploadResumeToBrain(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instance: true }
    });

    if (!user?.instance?.brainUrl) {
      return { success: false, message: "Infrastructure not deployed yet." };
    }

    const file = formData.get('resume') as File;
    if (!file) {
      return { success: false, message: "No file provided." };
    }

    // Prepare the form data exactly how Spring Boot expects it
    const uploadData = new FormData();
    
    uploadData.append('file', file); 
  
    const targetEndpoint = `${user.instance.brainUrl}/api/v1/profile/upload-resume`;

    const response = await fetch(targetEndpoint, {
      method: 'POST',
      body: uploadData,
      // Note: Do NOT set the 'Content-Type' header here. 
      // Node's fetch automatically sets it to 'multipart/form-data' with the correct boundary.
    });

    if (!response.ok) {
      console.error("Brain rejected the resume. Status:", response.status);
      return { success: false, message: "Server rejected the upload. It might be waking up." };
    }

    return { success: true, message: "Resume successfully analyzed and vaulted!" };

  } catch (error) {
    console.error("Upload network error:", error);
    return { success: false, message: "Network error. Make sure your server is awake." };
  }
}