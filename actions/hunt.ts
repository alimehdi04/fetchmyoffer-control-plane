'use server'

export async function triggerRemoteHunt(brainUrl: string) {
  try {
    const response = await fetch(`${brainUrl}/api/v1/profile/force-hunt`, {
      method: 'GET', // 🛑 Change this from 'POST' to 'GET'
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' 
    });

    if (!response.ok) {
      console.error(`Brain server returned status: ${response.status}`);
      return { success: false, message: 'Server returned an error. It might still be waking up.' };
    }

    return { success: true, message: 'Hunt initiated successfully!' };
  } catch (error) {
    console.error("Force hunt network error:", error);
    return { success: false, message: 'Failed to contact your server. Try again in 60 seconds.' };
  }
}