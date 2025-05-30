import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { AppLogo } from '@/components/AppLogo';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-background">
      <div className="mb-8">
        <AppLogo textSize="text-3xl sm:text-4xl" iconSize={32} />
      </div>
      <OnboardingForm />
    </div>
  );
}
