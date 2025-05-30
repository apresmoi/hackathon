'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, ThermometerSnowflake, ThermometerSun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThermometerLikeProps {
  initialLikeCount: number;
  maxLikes?: number; // For progress calculation, e.g., target for "fully warm"
  onLike: () => void; // Placeholder for like action
}

const TEMP_MIN = 0; // °C
const TEMP_MAX_VISUAL = 40; // Max visual temperature for color scaling
const LIKES_FOR_MAX_TEMP = 50; // Likes needed to reach max visual temperature

export function ThermometerLike({ initialLikeCount, maxLikes = 100, onLike }: ThermometerLikeProps) {
  const [likes, setLikes] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false); // Placeholder for user's like state

  // Calculate temperature based on likes
  // This is a visual representation, not actual temperature
  const temperature = Math.min(TEMP_MAX_VISUAL, (likes / LIKES_FOR_MAX_TEMP) * TEMP_MAX_VISUAL);
  
  // Progress bar value based on likes relative to a max (e.g., 100 likes for full bar)
  const progressValue = Math.min(100, (likes / maxLikes) * 100);

  const handleLikeClick = () => {
    // Placeholder: In a real app, this would call an API
    const newLikes = isLiked ? likes - 1 : likes + 1;
    setLikes(newLikes);
    setIsLiked(!isLiked);
    onLike();
  };

  // Color transition logic for the thermometer fill
  // hsl(startHue, saturation, lightness) to hsl(endHue, saturation, lightness)
  // Blue (cold) to Red (hot)
  // Cold: ~200-240 (blue), Warm: ~0-30 (red/orange)
  const hue = 200 - (200 * (temperature / TEMP_MAX_VISUAL)); // 200 (blue) down to 0 (red)
  const fillStyle = { backgroundColor: `hsl(${hue}, 80%, 60%)` };

  // Effect for "warming up" card - this is a placeholder concept
  // In a real app, this might emit an event or pass props to parent card
  useEffect(() => {
    // console.log(`Current visual temperature: ${temperature.toFixed(0)}°C`);
    // Potentially change parent card's background based on 'temperature'
  }, [temperature]);


  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={handleLikeClick} className={cn(isLiked && "text-red-500 hover:text-red-600", "hover:bg-accent/50 rounded-full")}>
          <Heart className={cn("h-5 w-5", isLiked ? "fill-current" : "")} />
          <span className="sr-only">Like</span>
        </Button>
        <span className="font-medium text-sm text-foreground/80">{likes} likes</span>
      </div>
      <div className="flex items-center w-full max-w-[150px] space-x-1">
        <ThermometerSnowflake className="h-5 w-5 text-blue-400" />
        <Progress value={progressValue} className="h-3 flex-1" indicatorClassName="transition-all duration-500 ease-out" style={fillStyle} />
        <ThermometerSun className="h-5 w-5 text-orange-400" />
      </div>
      <p className="text-xs text-muted-foreground">Visual Temp: {temperature.toFixed(0)}°C</p>
    </div>
  );
}
