'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { saveUserVault } from '@/actions/onboarding'
import { triggerDeployment } from '@/actions/deploy'
import { ExternalLink, Info } from 'lucide-react';

function HintBox({ title, text, link, linkText }: { title: string, text: string, link: string, linkText: string }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md p-3 mt-2 text-sm text-blue-800 dark:text-blue-300">
      <div className="flex gap-2 font-semibold mb-1 items-center">
        <Info className="w-4 h-4" /> {title}
      </div>
      <p className="mb-2 opacity-90">{text}</p>
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold hover:underline">
        {linkText} <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

export default function OnboardingWizard({ linkCode }: { linkCode: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State for our keys
  const [formData, setFormData] = useState({
    groqKey: '',
    geminiKey: '',
    supabaseUrl: '',
    supabaseServiceKey: '',
    renderApiKey: ''
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveUserVault(formData);
      alert("✅ Keys securely vaulted! Starting deployment (this takes a few seconds)...");
      
      // TRIGGER THE DEPLOYMENT!
      await triggerDeployment();
      
      alert("🚀 Deployment triggered! Check your Render dashboard.");
      window.location.href = '/dashboard'; // Redirect them
    } catch (error) {
      console.error(error);
      alert("Failed to deploy. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20">
      <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl">Step {step} of 4</CardTitle>
          <CardDescription className="text-md">
            {step === 1 && "Link your Telegram Account for alerts."}
            {step === 2 && "Enter your AI API Keys (Groq & Gemini)."}
            {step === 3 && "Enter your Supabase Database credentials."}
            {step === 4 && "Enter your Render API Key for deployment."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="text-center space-y-4 py-4">
              <p className="text-zinc-600 dark:text-zinc-400">Click the button below to open Telegram and link your account to this platform.</p>
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href={`tg://resolve?domain=FetchMyOffer_Bot&start=${linkCode}`} target="_blank" rel="noreferrer">
                  Link Telegram Account
                </a>
              </Button>
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <Input 
                  placeholder="GROQ_API_KEY (gsk_...)" 
                  value={formData.groqKey} 
                  onChange={e => setFormData({...formData, groqKey: e.target.value})} 
                  type="password"
                />
                <HintBox 
                  title="How to get a Groq Key" 
                  text="Create a free account on GroqCloud, navigate to 'API Keys', and click 'Create API Key'." 
                  link="https://console.groq.com/keys" 
                  linkText="Go to Groq Console" 
                />
              </div>
              
              <div>
                <Input 
                  placeholder="GEMINI_API_KEY (AIza...)" 
                  value={formData.geminiKey} 
                  onChange={e => setFormData({...formData, geminiKey: e.target.value})} 
                  type="password"
                />
                <HintBox 
                  title="How to get a Gemini Key" 
                  text="Open Google AI Studio, click 'Get API key' in the sidebar, and generate a new key in a new project." 
                  link="https://aistudio.google.com/app/apikey" 
                  linkText="Go to Google AI Studio" 
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <Input 
                  placeholder="Supabase JDBC Connection String (jdbc:postgresql://...)" 
                  value={formData.supabaseUrl} 
                  onChange={e => setFormData({...formData, supabaseUrl: e.target.value})} 
                />
                <HintBox 
                  title="Finding your JDBC URL" 
                  text="Go to Project Dashboard, click the 'Connection' button at Navbar. Switch to 'Connection String', check the 'Session Pooler'[IPV4 compatible] box in Method tab, choose the Type = 'JDBC', and copy the string. Don't forget to replace [YOUR-PASSWORD] with your actual DB password!" 
                  link="https://supabase.com/dashboard/projects" 
                  linkText="Go to Supabase Dashboard" 
                />
              </div>

              <div>
                <Input 
                  placeholder="Supabase Service Role Key" 
                  value={formData.supabaseServiceKey} 
                  onChange={e => setFormData({...formData, supabaseServiceKey: e.target.value})} 
                  type="password"
                />
                <p className="text-xs text-zinc-500 mt-2 px-1">
                  Found in Project Settings -&gt; Under Sidebar, API keys -&gt; select &apos;Legacy anon, service_role API keys&apos; tab -&gt; service_role secret.
                </p>
              </div>
            </>
          )}

          {step === 4 && (
            <div>
              <Input 
                placeholder="RENDER_API_KEY (rnd_...)" 
                value={formData.renderApiKey} 
                onChange={e => setFormData({...formData, renderApiKey: e.target.value})} 
                type="password"
              />
              <HintBox 
                title="How to get a Render API Key" 
                text="Go to your Render Account Settings, click on 'API Keys' on the left menu, and click 'Create API Key'." 
                link="https://dashboard.render.com/user/settings#api-keys" 
                linkText="Go to Render Settings" 
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4 border-t dark:border-zinc-800">
          <Button disabled={step === 1} variant="ghost" onClick={handleBack}>Back</Button>
          
          {step < 4 ? (
            <Button onClick={handleNext}>Next Step</Button>
          ) : (
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Encrypting & Deploying..." : "Save & Deploy"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}