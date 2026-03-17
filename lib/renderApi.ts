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
    repo: "https://github.com/alimehdi04/scraperPython_fetchMyOffer", 
    autoDeploy: "yes",
    branch: "main",
    serviceDetails: {
      env: "docker", 
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
    repo: "https://github.com/alimehdi04/fetchMyOffer", 
    autoDeploy: "yes",
    branch: "main",
    envVars: envVars,
    serviceDetails: {
      env: "docker", 
      plan: "free",
      region: "oregon"
    }
  };

  return fetchRender('/services', apiKey, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// 4. Update Environment Variables (For the Webhook URL)
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

// 6. Delete user infrastructure (Teardown)
export async function deleteUserServices(apiKey: string, userId: string) {
  // 1. Fetch all services on their Render account
  const servicesResponse = await fetchRender('/services?limit=100', apiKey);
  
  const targetScraperName = `fmo-scraper-${userId.substring(0, 6)}`;
  const targetBrainName = `fmo-brain-${userId.substring(0, 6)}`;

  // 2. Filter out only the ones created by FetchMyOffer
  const servicesToDelete = servicesResponse.filter((s: any) => 
    s.service.name === targetScraperName || s.service.name === targetBrainName
  );

  // 3. Fire the DELETE requests
  const deletePromises = servicesToDelete.map(async (s: any) => {
    const res = await fetch(`https://api.render.com/v1/services/${s.service.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      console.error(`Failed to delete ${s.service.name} from Render.`);
    }
  });

  await Promise.allSettled(deletePromises);
}