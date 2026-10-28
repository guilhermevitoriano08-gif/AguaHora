import {
  ActivityLevel,
  ClimateType,
  UserSettings,
  WaterLogEntry,
  HourlySlot,
  HydrationSummary,
  BeverageType,
  BeverageInfo
} from '../types/water';

export const BEVERAGES: Record<BeverageType, BeverageInfo> = {
  water: {
    id: 'water',
    name: 'Água Pura',
    multiplier: 1.0,
    iconName: 'Droplet',
    description: '100% de hidratação pura e zero calorias',
  },
  flavored_water: {
    id: 'flavored_water',
    name: 'Água com Limão / Frutas',
    multiplier: 1.0,
    iconName: 'Sparkles',
    description: 'Água aromatizada naturalmente sem açúcar',
  },
  coconut_water: {
    id: 'coconut_water',
    name: 'Água de Coco',
    multiplier: 1.0,
    iconName: 'Palmtree',
    description: 'Rica em eletrólitos naturais (potássio e magnésio)',
  },
  herbal_tea: {
    id: 'herbal_tea',
    name: 'Chá / Infusão (sem açúcar)',
    multiplier: 0.95,
    iconName: 'Coffee',
    description: 'Camomila, hortelã ou verde com alta retenção',
  },
  isotonic: {
    id: 'isotonic',
    name: 'Isotônico / Eletrólitos',
    multiplier: 0.95,
    iconName: 'Zap',
    description: 'Excelente para reposição pós-treino intenso',
  },
  coffee: {
    id: 'coffee',
    name: 'Café / Chá Preto',
    multiplier: 0.8,
    iconName: 'CupSoda',
    description: 'Contém cafeína moderada com efeito hídrico parcial',
  },
};

export const DEFAULT_SETTINGS: UserSettings = {
  weightKg: 70,
  activityLevel: 'moderate',
  climate: 'temperate',
  wakeTime: '07:00',
  sleepTime: '23:00',
  useCustomDailyGoal: false,
  customDailyGoalMl: 2500,
  reminderIntervalMinutes: 60,
  soundEnabled: true,
  soundType: 'droplet',
  volume: 0.8,
  browserNotificationsEnabled: false,
  pacingDistribution: 'uniform',
  pacingIntensity: 'balanced',
  manualHourlyRateMl: 175,
  adaptivePacing: true,
};

/**
 * Calculates recommended daily water intake in ml
 */
export const calculateDailyGoal = (
  weightKg: number,
  activityLevel: ActivityLevel,
  climate: ClimateType,
  useCustom: boolean,
  customGoal: number,
  intensity: 'gentle' | 'balanced' | 'intense' | 'custom' = 'balanced',
  distribution: 'uniform' | 'front_loaded' | 'afternoon_focus' | 'custom_rate' = 'uniform',
  manualHourlyRate = 175,
  activeHours = 16
): number => {
  if (distribution === 'custom_rate' && manualHourlyRate > 0) {
    return Math.round(manualHourlyRate * activeHours);
  }

  if (useCustom && customGoal > 0) {
    return Math.round(customGoal);
  }

  // Baseline factor according to intensity
  let mlPerKg = 35;
  if (intensity === 'gentle') mlPerKg = 30;
  if (intensity === 'intense') mlPerKg = 42;

  const safeWeight = Math.max(30, Math.min(weightKg || 70, 250));
  let baseMl = safeWeight * mlPerKg;

  // Activity adjustment
  switch (activityLevel) {
    case 'sedentary':
      baseMl += 0;
      break;
    case 'light':
      baseMl += 350;
      break;
    case 'moderate':
      baseMl += 600;
      break;
    case 'intense':
      baseMl += 950;
      break;
  }

  // Climate adjustment
  switch (climate) {
    case 'temperate':
      baseMl += 0;
      break;
    case 'warm':
      baseMl += 350;
      break;
    case 'hot_dry':
      baseMl += 600;
      break;
  }

  return Math.round(baseMl / 50) * 50;
};

/**
 * Parse time string "HH:MM" into decimal hours or total minutes
 */
export const parseTimeToHours = (timeStr: string): number => {
  const [h, m] = (timeStr || '07:00').split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};

/**
 * Calculate total waking/active hours between wake time and sleep time
 */
export const calculateActiveHours = (wakeTime: string, sleepTime: string): number => {
  const wakeHours = parseTimeToHours(wakeTime);
  let sleepHours = parseTimeToHours(sleepTime);

  // If sleep time is on the next calendar day (e.g., wake 08:00, sleep 01:00)
  if (sleepHours <= wakeHours) {
    sleepHours += 24;
  }

  const duration = sleepHours - wakeHours;
  return Math.max(4, Math.min(duration, 20));
};

/**
 * Calculates hourly intake rate in ml/h
 */
export const calculateHourlyRate = (
  goalMl: number,
  activeHours: number,
  distribution: 'uniform' | 'front_loaded' | 'afternoon_focus' | 'custom_rate' = 'uniform',
  manualRate = 175
): number => {
  if (distribution === 'custom_rate' && manualRate > 0) {
    return manualRate;
  }
  if (activeHours <= 0) return 0;
  const rate = goalMl / activeHours;
  return Math.round(rate / 5) * 5;
};

/**
 * Computes slot weights based on pacing profile
 */
export const getPacingWeights = (
  totalSlots: number,
  distribution: 'uniform' | 'front_loaded' | 'afternoon_focus' | 'custom_rate'
): number[] => {
  const weights: number[] = [];

  for (let i = 0; i < totalSlots; i++) {
    const fraction = i / Math.max(1, totalSlots - 1); // 0 (start of day) to 1 (end of day)

    if (distribution === 'front_loaded') {
      // High in morning (1.3), moderate in middle (1.0), low at night (0.55) to prevent night urination
      if (fraction < 0.4) {
        weights.push(1.35);
      } else if (fraction < 0.75) {
        weights.push(1.05);
      } else {
        weights.push(0.55);
      }
    } else if (distribution === 'afternoon_focus') {
      // Moderate in morning, peak afternoon, tapering evening
      if (fraction < 0.3) {
        weights.push(0.85);
      } else if (fraction < 0.75) {
        weights.push(1.35);
      } else {
        weights.push(0.75);
      }
    } else {
      // Uniform or custom rate
      weights.push(1.0);
    }
  }

  return weights;
};

/**
 * Generates hour-by-hour slots with pacing profiles and adaptive rebalancing
 */
export const generateHourlySlots = (
  settings: UserSettings,
  logs: WaterLogEntry[],
  currentDate = new Date()
): HourlySlot[] => {
  const currentHour = currentDate.getHours();
  const [wakeH] = settings.wakeTime.split(':').map(Number);

  const activeHours = calculateActiveHours(settings.wakeTime, settings.sleepTime);
  const totalSlotsCount = Math.max(1, Math.round(activeHours));

  const goalMl = calculateDailyGoal(
    settings.weightKg,
    settings.activityLevel,
    settings.climate,
    settings.useCustomDailyGoal,
    settings.customDailyGoalMl,
    settings.pacingIntensity,
    settings.pacingDistribution,
    settings.manualHourlyRateMl,
    activeHours
  );

  // Build list of active hours
  const hoursList: number[] = [];
  let h = wakeH;
  for (let i = 0; i < totalSlotsCount; i++) {
    hoursList.push(h % 24);
    h++;
  }

  // Pre-aggregate consumption by hour for today
  const consumedByHour: Record<number, number> = {};
  logs.forEach(log => {
    const logDate = new Date(log.timestamp);
    if (
      logDate.getFullYear() === currentDate.getFullYear() &&
      logDate.getMonth() === currentDate.getMonth() &&
      logDate.getDate() === currentDate.getDate()
    ) {
      const logH = logDate.getHours();
      consumedByHour[logH] = (consumedByHour[logH] || 0) + log.effectiveHydrationMl;
    }
  });

  const weights = getPacingWeights(totalSlotsCount, settings.pacingDistribution);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Base planned targets
  const plannedTargets: number[] = weights.map(w =>
    Math.round((goalMl * (w / totalWeight)) / 5) * 5
  );

  // If adaptive pacing is active, re-apportion remaining required water
  // across remaining (current and future) hours
  let effectiveTargets = [...plannedTargets];

  if (settings.adaptivePacing) {
    const currentIndex = hoursList.indexOf(currentHour);

    if (currentIndex >= 0 && currentIndex < totalSlotsCount) {
      // Past consumed up to current hour
      let pastConsumed = 0;
      for (let i = 0; i < currentIndex; i++) {
        const hour = hoursList[i];
        pastConsumed += consumedByHour[hour] || 0;
      }

      const remainingMl = Math.max(0, goalMl - pastConsumed);
      const remainingIndices = [];
      let remainingWeight = 0;

      for (let i = currentIndex; i < totalSlotsCount; i++) {
        remainingIndices.push(i);
        remainingWeight += weights[i];
      }

      if (remainingWeight > 0) {
        remainingIndices.forEach(idx => {
          const share = (weights[idx] / remainingWeight) * remainingMl;
          effectiveTargets[idx] = Math.round(share / 5) * 5;
        });
      }
    }
  }

  let runningTarget = 0;
  let runningConsumed = 0;

  return hoursList.map((hour, index) => {
    const target = effectiveTargets[index] || 150;
    runningTarget += target;
    const consumed = Math.round(consumedByHour[hour] || 0);
    runningConsumed += consumed;

    const isPast = hour < currentHour;
    const isCurrent = hour === currentHour;
    const isFuture = hour > currentHour;

    return {
      hour,
      hourLabel: `${String(hour).padStart(2, '0')}:00`,
      targetMl: target,
      consumedMl: consumed,
      isPast,
      isCurrent,
      isFuture,
      cumulativeTargetMl: Math.round(runningTarget),
      cumulativeConsumedMl: Math.round(runningConsumed),
    };
  });
};

/**
 * Computes full hydration summary with current status, remaining pace, etc.
 */
export const getHydrationSummary = (
  settings: UserSettings,
  logs: WaterLogEntry[],
  currentDate = new Date()
): HydrationSummary => {
  const activeHours = calculateActiveHours(settings.wakeTime, settings.sleepTime);
  const goalMl = calculateDailyGoal(
    settings.weightKg,
    settings.activityLevel,
    settings.climate,
    settings.useCustomDailyGoal,
    settings.customDailyGoalMl,
    settings.pacingIntensity,
    settings.pacingDistribution,
    settings.manualHourlyRateMl,
    activeHours
  );

  const hourlyRate = calculateHourlyRate(
    goalMl,
    activeHours,
    settings.pacingDistribution,
    settings.manualHourlyRateMl
  );

  // Filter logs for today
  const todayLogs = logs.filter(log => {
    const d = new Date(log.timestamp);
    return (
      d.getFullYear() === currentDate.getFullYear() &&
      d.getMonth() === currentDate.getMonth() &&
      d.getDate() === currentDate.getDate()
    );
  });

  const consumedTodayRaw = todayLogs.reduce((acc, curr) => acc + curr.amountMl, 0);
  const effectiveHydrationToday = todayLogs.reduce(
    (acc, curr) => acc + curr.effectiveHydrationMl,
    0
  );

  const remaining = Math.max(0, goalMl - effectiveHydrationToday);
  const percentage = goalMl > 0 ? Math.min(100, Math.round((effectiveHydrationToday / goalMl) * 100)) : 0;

  // Calculate remaining waking hours
  const currentHour = currentDate.getHours() + currentDate.getMinutes() / 60;
  const [sleepH, sleepM] = settings.sleepTime.split(':').map(Number);
  let sleepTimeHours = sleepH + (sleepM || 0) / 60;
  if (sleepTimeHours <= parseTimeToHours(settings.wakeTime)) {
    sleepTimeHours += 24;
  }

  let remainingHours = Math.max(0, sleepTimeHours - currentHour);
  if (currentHour < parseTimeToHours(settings.wakeTime)) {
    // Before wake up time: whole day is ahead
    remainingHours = activeHours;
  }

  const adjustedHourlyRate =
    remainingHours > 0.5 ? Math.round((remaining / remainingHours) / 5) * 5 : remaining;

  return {
    dailyGoalMl: goalMl,
    totalActiveHours: Math.round(activeHours * 10) / 10,
    hourlyRateMl: hourlyRate,
    consumedTodayMl: consumedTodayRaw,
    effectiveHydrationTodayMl: Math.round(effectiveHydrationToday),
    remainingTodayMl: Math.round(remaining),
    percentageCompleted: percentage,
    remainingHours: Math.round(remainingHours * 10) / 10,
    adjustedHourlyRateMl: Math.round(adjustedHourlyRate),
    isGoalAchieved: effectiveHydrationToday >= goalMl,
    currentStreakDays: 1, // Can be computed from history
  };
};

/**
 * Format volume in Liters or Milliliters
 */
export const formatMl = (ml: number): string => {
  if (ml >= 1000) {
    const l = (ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1);
    return `${l} L`;
  }
  return `${Math.round(ml)} ml`;
};
