import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChoreCoin - Welcome',
  description: 'Login or sign up for ChoreCoin.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
