import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  UserSettings,
  WaterLogEntry,
  BeverageType,
  HourlySlot,
  HydrationSummary,
  DayHistoryRecord,
} from '../types/water';
import {
  DEFAULT_SETTINGS,
  BEVERAGES,
  calculateDailyGoal,
  getHydrationSummary,
  generateHourlySlots,
} from '../utils/calculator';
import { audioSynthesizer } from '../utils/audio';
import {
  isNotificationSupported,
  requestNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';

interface WaterContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  logs: WaterLogEntry[];
  todayLogs: WaterLogEntry[];
  addLog: (amountMl: number, beverageType?: BeverageType, customTimestamp?: number, note?: string) => void;
  deleteLog: (id: string) => void;
  undoLastLog: () => void;
  summary: HydrationSummary;
  hourlySlots: HourlySlot[];
  historyRecords: DayHistoryRecord[];
  secondsToNextReminder: number;
  isReminderDue: boolean;
  snoozeReminder: (minutes?: number) => void;
  dismissReminder: () => void;
  testReminderSound: () => void;
  enableNotifications: () => Promise<boolean>;
  resetTodayLogs: () => void;
  clearAllData: () => void;
}

const SETTINGS_KEY = 'aquahora_settings_v1';
const LOGS_KEY = 'aquahora_logs_v1';
const LAST_REMINDER_KEY = 'aquahora_last_reminder_v1';

const WaterContext = createContext<WaterContextType | undefined>(undefined);

export const WaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Load logs
  const [logs, setLogs] = useState<WaterLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WaterLogEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Default starter logs for today so the user sees immediate lively data
    const now = new Date();
    const morning1 = new Date(now);
    morning1.setHours(7, 30, 0, 0);
    const morning2 = new Date(now);
    morning2.setHours(9, 15, 0, 0);
    const morning3 = new Date(now);
    morning3.setHours(11, 0, 0, 0);

    const initialEntries: WaterLogEntry[] = [];
    if (now.getHours() >= 8) {
      initialEntries.push({
        id: 'seed-1',
        timestamp: morning1.getTime(),
        amountMl: 250,
        beverageType: 'water',
        effectiveHydrationMl: 250,
        note: 'Copo matinal ao acordar',
      });
    }
    if (now.getHours() >= 10) {
      initialEntries.push({
        id: 'seed-2',
        timestamp: morning2.getTime(),
        amountMl: 300,
        beverageType: 'water',
        effectiveHydrationMl: 300,
        note: 'Água fresca no trabalho',
      });
    }
    if (now.getHours() >= 12) {
      initialEntries.push({
        id: 'seed-3',
        timestamp: morning3.getTime(),
        amountMl: 200,
        beverageType: 'herbal_tea',
        effectiveHydrationMl: 190,
        note: 'Chá verde',
      });
    }

    return initialEntries;
  });

  // Track next reminder countdown
  const [secondsToNextReminder, setSecondsToNextReminder] = useState<number>(() => {
    return (settings.reminderIntervalMinutes || 60) * 60;
  });
  const [isReminderDue, setIsReminderDue] = useState<boolean>(false);
  const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState<number>(Date.now());

  // Save settings
  const updateSettings = useCallback((newPartial: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Save logs
  useEffect(() => {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  // Filter logs for today
  const todayLogs = useMemo(() => {
    const today = new Date();
    return logs
      .filter(l => {
        const d = new Date(l.timestamp);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs]);

  // Hydration summary
  const summary = useMemo(() => {
    return getHydrationSummary(settings, logs);
  }, [settings, logs]);

  // Hourly slots breakdown
  const hourlySlots = useMemo(() => {
    return generateHourlySlots(settings, logs);
  }, [settings, logs]);

  // Historical records for previous 7 days
  const historyRecords = useMemo((): DayHistoryRecord[] => {
    const records: DayHistoryRecord[] = [];
    const today = new Date();
    const activeHours = (settings.reminderIntervalMinutes || 60);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayLogs = logs.filter(l => {
        const logDate = new Date(l.timestamp);
        return (
          logDate.getFullYear() === d.getFullYear() &&
          logDate.getMonth() === d.getMonth() &&
          logDate.getDate() === d.getDate()
        );
      });

      const consumed = dayLogs.reduce((acc, curr) => acc + curr.effectiveHydrationMl, 0);
      const goal = calculateDailyGoal(
        settings.weightKg,
        settings.activityLevel,
        settings.climate,
        settings.useCustomDailyGoal,
        settings.customDailyGoalMl,
        settings.pacingIntensity,
        settings.pacingDistribution,
        settings.manualHourlyRateMl
      );

      records.push({
        date: dateStr,
        goalMl: goal,
        consumedMl: consumed,
        hourlyRateMl: summary.hourlyRateMl,
        logsCount: dayLogs.length,
        achieved: consumed >= goal,
      });
    }

    return records;
  }, [logs, settings, summary.hourlyRateMl]);

  // Add water log
  const addLog = useCallback(
    (
      amountMl: number,
      beverageType: BeverageType = 'water',
      customTimestamp?: number,
      note?: string
    ) => {
      const bev = BEVERAGES[beverageType] || BEVERAGES.water;
      const effective = Math.round(amountMl * bev.multiplier);

      const newEntry: WaterLogEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: customTimestamp || Date.now(),
        amountMl,
        beverageType,
        effectiveHydrationMl: effective,
        note,
      };

      setLogs(prev => [newEntry, ...prev]);

      // Play soft confirmation sound
      if (settings.soundEnabled) {
        audioSynthesizer.playSound(settings.soundType, settings.volume);
      }

      // Check if this drink achieved the daily goal for the first time
      const currentEffective = summary.effectiveHydrationTodayMl;
      if (currentEffective < summary.dailyGoalMl && currentEffective + effective >= summary.dailyGoalMl) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#0ea5e9', '#3b82f6', '#38bdf8', '#67e8f9'],
          });
        } catch {
          // ignore
        }
      }

      // Reset reminder countdown since user just drank water!
      setSecondsToNextReminder((settings.reminderIntervalMinutes || 60) * 60);
      setIsReminderDue(false);
      setLastNotificationTimestamp(Date.now());
    },
    [settings, summary]
  );

  // Delete specific log
  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  // Undo last log
  const undoLastLog = useCallback(() => {
    if (todayLogs.length > 0) {
      const lastId = todayLogs[0].id;
      deleteLog(lastId);
    }
  }, [todayLogs, deleteLog]);

  // Reset today
  const resetTodayLogs = useCallback(() => {
    const today = new Date();
    setLogs(prev =>
      prev.filter(l => {
        const d = new Date(l.timestamp);
        return !(
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      })
    );
  }, []);

  const clearAllData = useCallback(() => {
    setLogs([]);
    localStorage.removeItem(LOGS_KEY);
  }, []);

  // Snooze reminder
  const snoozeReminder = useCallback((minutes = 10) => {
    setSecondsToNextReminder(minutes * 60);
    setIsReminderDue(false);
  }, []);

  // Dismiss reminder
  const dismissReminder = useCallback(() => {
    setSecondsToNextReminder((settings.reminderIntervalMinutes || 60) * 60);
    setIsReminderDue(false);
  }, [settings.reminderIntervalMinutes]);

  // Test sound
  const testReminderSound = useCallback(() => {
    audioSynthesizer.playSound(settings.soundType, settings.volume);
  }, [settings.soundType, settings.volume]);

  // Request notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    updateSettings({ browserNotificationsEnabled: granted });
    if (granted) {
      sendBrowserNotification(
        'AquaHora Ativado!',
        'Você receberá lembretes nos intervalos configurados para manter sua meta horária.'
      );
    }
    return granted;
  }, [updateSettings]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNextReminder(prev => {
        if (prev <= 1) {
          // Reminder is due!
          if (!isReminderDue) {
            setIsReminderDue(true);

            // Play sound if enabled
            if (settings.soundEnabled) {
              audioSynthesizer.playSound(settings.soundType, settings.volume);
            }

            // Send browser notification if enabled
            if (settings.browserNotificationsEnabled) {
              const hourlyAmount = summary.hourlyRateMl || 180;
              sendBrowserNotification(
                'Hora de Beber Água! 💧',
                `Meta horária: beba cerca de ${hourlyAmount} ml agora para manter seu ritmo saudável.`
              );
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, isReminderDue, summary.hourlyRateMl]);

  return (
    <WaterContext.Provider
      value={{
        settings,
        updateSettings,
        logs,
        todayLogs,
        addLog,
        deleteLog,
        undoLastLog,
        summary,
        hourlySlots,
        historyRecords,
        secondsToNextReminder,
        isReminderDue,
        snoozeReminder,
        dismissReminder,
        testReminderSound,
        enableNotifications,
        resetTodayLogs,
        clearAllData,
      }}
    >
      {children}
    </WaterContext.Provider>
  );
};

export const useWater = (): WaterContextType => {
  const context = useContext(WaterContext);
  if (!context) {
    throw new Error('useWater must be used within a WaterProvider');
  }
  return context;
};
