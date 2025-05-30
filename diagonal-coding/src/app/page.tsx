
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import UserRegistration from '@/components/UserRegistration';
import EventModule from '@/components/EventModule';
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { PartyPopper } from 'lucide-react';

export default function HomePage() {
  const [userName, setUserName] = useLocalStorage<string | null>('officeConnectUserName', null);
  const [currentMonthYear, setCurrentMonthYear] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const date = new Date();
    setCurrentMonthYear(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
  }, []);

  const handleRegister = useCallback((name: string) => {
    setUserName(name);
  }, [setUserName]);

  const handleLogout = useCallback(() => {
    setUserName(null);
    // Optionally clear event data for the logged-out user, or handle it within EventModule/useLocalStorage logic.
    // For simplicity, current setup will retain data if same name is re-entered.
  }, [setUserName]);

  if (!isClient) {
    // Render nothing or a loading indicator on the server to avoid hydration mismatch
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="animate-pulse text-primary">
                <PartyPopper size={48} />
            </div>
            <p className="text-muted-foreground mt-2">Loading Improving ComeTogether...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 selection:bg-primary/30 selection:text-primary-foreground">
      <main className="w-full max-w-lg">
        <Card className="shadow-2xl overflow-hidden rounded-xl border-2 border-primary/10">
          {!userName || !currentMonthYear ? (
            <UserRegistration onRegister={handleRegister} />
          ) : (
            <EventModule userName={userName} currentMonthYear={currentMonthYear} onLogout={handleLogout} />
          )}
        </Card>
        <footer className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Connect & Collaborate with <span className="font-semibold text-primary">Improving ComeTogether</span>
          </p>
        </footer>
      </main>
      <Toaster />
    </div>
  );
}
