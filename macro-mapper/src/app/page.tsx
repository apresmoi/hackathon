'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/localStorage';
import { Loader2 } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
    // A small delay to prevent flash of content if redirect is too fast
    // setLoading(false) isn't strictly needed here as redirection will happen
    // but good for UX if there's a brief moment.
    const timer = setTimeout(() => setLoading(false), 200); 
    return () => clearTimeout(timer);

  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <AppLogo textSize="text-4xl" iconSize={40} />
      {loading && (
        <div className="mt-8 flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-foreground">Loading MacroMapper...</p>
        </div>
      )}
    </div>
  );
}
