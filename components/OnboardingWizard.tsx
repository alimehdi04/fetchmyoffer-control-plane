'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { saveUserVault } from '@/actions/onboarding'
import { triggerDeployment } from '@/actions/deploy'

// Assuming you pass these down from the page level after calling generateTelegramLink()
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
      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 4</CardTitle>
          <CardDescription>
            {step === 1 && "Link your Telegram Account for alerts."}
            {step === 2 && "Enter your AI API Keys (Groq & Gemini)."}
            {step === 3 && "Enter your Supabase Database credentials."}
            {step === 4 && "Enter your Render API Key for deployment."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="text-center space-y-4">
              <p>Click the button below to open Telegram and link your account to this platform.</p>
              <Button asChild variant="outline">
                <a href={`tg://resolve?domain=FetchMyOffer_Bot&start=${linkCode}`} target="_blank" rel="noreferrer">
                  Link Telegram
                </a>
              </Button>
            </div>
          )}

          {step === 2 && (
            <>
              <Input 
                placeholder="GROQ_API_KEY" 
                value={formData.groqKey} 
                onChange={e => setFormData({...formData, groqKey: e.target.value})} 
                type="password"
              />
              <Input 
                placeholder="GEMINI_API_KEY" 
                value={formData.geminiKey} 
                onChange={e => setFormData({...formData, geminiKey: e.target.value})} 
                type="password"
              />
            </>
          )}

          {step === 3 && (
            <>
              <Input 
                placeholder="Supabase Database URL" 
                value={formData.supabaseUrl} 
                onChange={e => setFormData({...formData, supabaseUrl: e.target.value})} 
              />
              <Input 
                placeholder="Supabase Service Role Key" 
                value={formData.supabaseServiceKey} 
                onChange={e => setFormData({...formData, supabaseServiceKey: e.target.value})} 
                type="password"
              />
            </>
          )}

          {step === 4 && (
            <Input 
              placeholder="RENDER_API_KEY" 
              value={formData.renderApiKey} 
              onChange={e => setFormData({...formData, renderApiKey: e.target.value})} 
              type="password"
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button disabled={step === 1} variant="ghost" onClick={handleBack}>Back</Button>
          
          {step < 4 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Encrypting..." : "Save & Deploy"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}