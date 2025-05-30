import { NextResponse } from 'next/server';
import { userData, calculateLevelInfo } from '@/lib/db';
import type { UserLevelInfo } from '@/types/user';

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const levelInfo: UserLevelInfo = calculateLevelInfo(userData.xp);
  return NextResponse.json(levelInfo);
}
