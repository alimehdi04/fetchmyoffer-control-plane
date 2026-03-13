'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { uploadResumeToBrain } from '@/actions/resume'
import { FileText, UploadCloud, CheckCircle } from 'lucide-react'

export default function ResumeUpload() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        e.target.value = '';
        setFileName(null);
        return;
      }
      setFileName(file.name);
      setSuccess(false); // Reset success state for new files
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const file = formData.get('resume') as File;
    if (!file || file.size === 0) {
      alert('Please select a file first.');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadResumeToBrain(formData);
      if (result.success) {
        setSuccess(true);
        alert("✅ " + result.message);
        formRef.current?.reset();
        setTimeout(() => setFileName(null), 3000); // Clear filename after a few seconds
      } else {
        alert("⚠️ " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
        
        {/* Invisible file input covering the whole dashed box */}
        <input 
          type="file" 
          name="resume" 
          accept=".pdf" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
          {success ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : fileName ? (
            <FileText className="w-10 h-10 text-blue-500" />
          ) : (
            <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-blue-500 transition-colors" />
          )}
          
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {success 
              ? "Upload Complete!" 
              : fileName 
                ? fileName 
                : "Drag & drop your PDF resume here, or click to browse"}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={loading || !fileName} className="w-full">
        {loading ? "Transmitting to Brain..." : "Upload & Analyze Resume"}
      </Button>
    </form>
  )
}