import { Zap } from 'lucide-react'; // Or any other icon you prefer
import { APP_NAME } from '@/lib/constants';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function AppLogo({ className, iconSize = 24, textSize = "text-2xl" }: AppLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Zap size={iconSize} className="text-primary" />
      <h1 className={`${textSize} font-bold text-primary`}>{APP_NAME}</h1>
    </div>
  );
}
