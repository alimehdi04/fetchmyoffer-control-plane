// src/lib/renderApi.ts

// Helper to make API calls to Render securely
async function fetchRender(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.render.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Extract the raw text first instead of calling .json() blindly
  const text = await response.text();

  if (!response.ok) {
    let errorMessage = text;
    try {
      const errorJson = JSON.parse(text);
      errorMessage = JSON.stringify(errorJson);
    } catch (e) {
      // It was plain text, keep it as is
    }
    throw new Error(`Render API Error (${response.status}): ${errorMessage}`);
  }
  
  // Safe JSON parsing: If Render returns an empty body (like on a redeploy), return an empty object
  if (!text || text.trim() === "") {
    return {};
  }

  return JSON.parse(text);
}

// 1. Get the user's Render Owner ID
export async function getRenderOwnerId(apiKey: string) {
  // Hit the /owners endpoint, which returns an array of accounts/teams you own
  const data = await fetchRender('/owners', apiKey);
  
  if (Array.isArray(data) && data.length > 0) {
    return data[0].owner.id; // Usually starts with 'usr-' or 'tea-'
  }
  
  throw new Error("No Render owner found for this API key.");
}

// 2. Deploy the Python Scraper (Using Docker!)
export async function deployScraper(apiKey: string, ownerId: string, userId: string) {
  const payload = {
    type: "web_service",
    name: `fmo-scraper-${userId.substring(0, 6)}`,
    ownerId: ownerId,
    repo: "https://github.com/alimehdi04/scraperPython_fetchMyOffer", // 🛑 UPDATE THIS!
    autoDeploy: "yes",
    branch: "main",
    serviceDetails: {
      env: "docker", // 🛑 Changed to docker!
      plan: "free",
      region: "oregon"
    }
  };

  return fetchRender('/services', apiKey, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// 3. Deploy the Spring Boot Brain
export async function deployBrain(
  apiKey: string, 
  ownerId: string, 
  userId: string,
  envVars: Array<{key: string, value: string}>
) {
  const payload = {
    type: "web_service",
    name: `fmo-brain-${userId.substring(0, 6)}`,
    ownerId: ownerId,
    repo: "https://github.com/alimehdi04/fetchMyOffer", // 🛑 UPDATE THIS
    autoDeploy: "yes",
    branch: "main",
    envVars: envVars,
    serviceDetails: {
      env: "docker", // Assuming your Spring Boot uses a Dockerfile
      plan: "free",
      region: "oregon"
    }
  };

  return fetchRender('/services', apiKey, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// 4. Update Environment Variables (For the Webhook URL fix)
export async function updateServiceEnvVars(apiKey: string, serviceId: string, envVars: Array<{key: string, value: string}>) {
  // Render's PUT endpoint wants the raw array of {key, value} objects!
  return fetchRender(`/services/${serviceId}/env-vars`, apiKey, {
    method: 'PUT',
    body: JSON.stringify(envVars)
  });
}

// 5. Force a fresh deployment (To apply injected Env Vars)
export async function triggerServiceDeploy(apiKey: string, serviceId: string) {
  return fetchRender(`/services/${serviceId}/deploys`, apiKey, {
    method: 'POST'
  });
}