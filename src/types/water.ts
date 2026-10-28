export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense';
export type ClimateType = 'temperate' | 'warm' | 'hot_dry';
export type SoundType = 'droplet' | 'crystal' | 'zen' | 'gentle';

export type BeverageType = 
  | 'water' 
  | 'flavored_water' 
  | 'coconut_water' 
  | 'herbal_tea' 
  | 'isotonic' 
  | 'coffee';

export interface BeverageInfo {
  id: BeverageType;
  name: string;
  multiplier: number;
  iconName: string;
  description: string;
}

export type PacingDistribution = 'uniform' | 'front_loaded' | 'afternoon_focus' | 'custom_rate';
export type PacingIntensity = 'gentle' | 'balanced' | 'intense' | 'custom';

export interface UserSettings {
  weightKg: number;
  activityLevel: ActivityLevel;
  climate: ClimateType;
  wakeTime: string; // "07:00"
  sleepTime: string; // "23:00"
  useCustomDailyGoal: boolean;
  customDailyGoalMl: number;
  reminderIntervalMinutes: number; // 30, 45, 60, 90, 120
  soundEnabled: boolean;
  soundType: SoundType;
  volume: number; // 0 to 1
  browserNotificationsEnabled: boolean;
  // Rhythm / Pacing configurations
  pacingDistribution: PacingDistribution;
  pacingIntensity: PacingIntensity;
  manualHourlyRateMl: number; // e.g. 150, 180, 220 ml/h
  adaptivePacing: boolean; // dynamically re-adjust remaining hours if ahead or behind
}

export interface WaterLogEntry {
  id: string;
  timestamp: number;
  amountMl: number;
  beverageType: BeverageType;
  effectiveHydrationMl: number;
  note?: string;
}

export interface HourlySlot {
  hour: number; // 0 to 23
  hourLabel: string; // "07:00"
  targetMl: number;
  consumedMl: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  cumulativeTargetMl: number;
  cumulativeConsumedMl: number;
}

export interface HydrationSummary {
  dailyGoalMl: number;
  totalActiveHours: number;
  hourlyRateMl: number;
  consumedTodayMl: number;
  effectiveHydrationTodayMl: number;
  remainingTodayMl: number;
  percentageCompleted: number;
  remainingHours: number;
  adjustedHourlyRateMl: number;
  isGoalAchieved: boolean;
  currentStreakDays: number;
}

export interface DayHistoryRecord {
  date: string; // "YYYY-MM-DD"
  goalMl: number;
  consumedMl: number;
  hourlyRateMl: number;
  logsCount: number;
  achieved: boolean;
}
