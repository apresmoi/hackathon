
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a fallback or primary, Geist might need specific setup
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// If Geist is preferred and set up correctly:
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';

// Using Inter as a robust default
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Changed to --font-sans for broader compatibility with shadcn
});

export const metadata: Metadata = {
  title: 'Improving ComeTogether',
  description: 'Monthly "Come Together" event coordination app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased", // Use font-sans which maps to Inter
        inter.variable // Add Inter variable to HTML
        // GeistSans.variable, // If using Geist
        // GeistMono.variable // If using Geist Mono
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
