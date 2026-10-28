import React from 'react';
import {
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Volume2,
  BellRing,
  RotateCcw,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { formatMl } from '../utils/calculator';

interface WaterHeroProps {
  onOpenCalculator: () => void;
  onOpenQuickLog: () => void;
  onOpenHourly: () => void;
  onOpenPacing: () => void;
}

export const WaterHero: React.FC<WaterHeroProps> = ({
  onOpenCalculator,
  onOpenQuickLog,
  onOpenHourly,
  onOpenPacing,
}) => {
  const {
    summary,
    settings,
    secondsToNextReminder,
    isReminderDue,
    addLog,
    snoozeReminder,
    dismissReminder,
    undoLastLog,
    todayLogs,
  } = useWater();

  const getPacingLabel = () => {
    if (settings.pacingDistribution === 'front_loaded') return 'Foco Matutino';
    if (settings.pacingDistribution === 'afternoon_focus') return 'Pico da Tarde';
    if (settings.pacingDistribution === 'custom_rate') return `${settings.manualHourlyRateMl} ml/h fixo`;
    return 'Uniforme';
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const percentage = Math.min(100, summary.percentageCompleted);

  return (
    <div className="space-y-6">
      {/* Active Reminder Banner (when timer fires) */}
      {isReminderDue && (
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-cyan-600/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                Hora de se hidratar! 💧
              </div>
              <p className="text-xs text-cyan-100 mt-0.5">
                Sua meta para esta hora é de cerca de{' '}
                <strong className="text-white font-mono tabular-nums">
                  {summary.hourlyRateMl} ml
                </strong>
                . Dê uma pausa e cuide do seu corpo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => snoozeReminder(10)}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors text-center"
            >
              Adiar 10m
            </button>
            <button
              onClick={() => {
                addLog(summary.hourlyRateMl, 'water');
                dismissReminder();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold bg-white text-cyan-900 hover:bg-cyan-50 active:scale-[0.98] rounded-lg shadow-sm transition-all text-center whitespace-nowrap"
            >
              Bebi {summary.hourlyRateMl} ml
            </button>
          </div>
        </div>
      )}

      {/* Main Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Fluid Container (Left / Column) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-3xl bg-slate-100/80 border-4 border-slate-200/90 shadow-inner overflow-hidden p-1 flex flex-col justify-end">
                {/* Measurement scale markers on the side */}
                <div className="absolute right-3 inset-y-4 flex flex-col justify-between items-end text-[10px] font-mono text-slate-400 select-none pointer-events-none z-10">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Animated Water Level */}
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 via-cyan-500 to-sky-400 rounded-2xl transition-all duration-700 ease-out relative overflow-hidden flex flex-col justify-start"
                  style={{ height: `${Math.max(6, percentage)}%` }}
                >
                  {/* Subtle surface wave overlay */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/25 blur-[1px] transform -translate-y-1/2" />
                  <div className="w-[200%] h-8 bg-cyan-300/30 absolute top-0 -left-1/2 rounded-[40%] animate-wave-slow opacity-60 pointer-events-none" />
                </div>

                {/* Water Volume Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <div className="bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 shadow-sm flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
                      {percentage}%
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 mt-0.5">
                      {formatMl(summary.effectiveHydrationTodayMl)} hidratados
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick status subtitle */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span>Meta: {formatMl(summary.dailyGoalMl)}</span>
                <span aria-hidden="true">·</span>
                <span>Faltam: {formatMl(summary.remainingTodayMl)}</span>
              </div>
            </div>

            {/* Core Hourly Calculation & Data (Right / Column) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wider uppercase text-cyan-700">
                      Cálculo de Ingestão por Hora
                    </span>
                    <button
                      onClick={onOpenPacing}
                      className="px-2 py-0.5 text-[11px] font-medium text-cyan-800 bg-cyan-100 hover:bg-cyan-200 rounded-md transition-colors cursor-pointer"
                      title="Clique para alterar a distribuição e velocidade da meta"
                    >
                      Ritmo: {getPacingLabel()}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenPacing}
                      className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Alterar Ritmo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onOpenCalculator}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Calculadora</span>
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2 text-balance">
                  {summary.isGoalAchieved ? (
                    <span className="text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 inline" /> Meta diária batida!
                    </span>
                  ) : (
                    <span>
                      Beba cerca de{' '}
                      <span className="text-cyan-600 font-mono tabular-nums">
                        {summary.hourlyRateMl} ml
                      </span>{' '}
                      por hora acordado
                    </span>
                  )}
                </h1>

                <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                  Para o seu peso de <strong>{settings.weightKg} kg</strong> e rotina ativa de{' '}
                  <strong>{summary.totalActiveHours} horas</strong> ({settings.wakeTime} às{' '}
                  {settings.sleepTime}), distribuir a água gradualmente previne sobrecarga nos rins e
                  garante energia estável.
                </p>
              </div>

              {/* 3 Metric Summary Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Metric 1: Taxa Recomendada por Hora */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Taxa Padrão</span>
                    <Clock className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {summary.hourlyRateMl}{' '}
                    <span className="text-xs font-sans font-normal text-slate-500">ml/h</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Ideal para o dia todo
                  </div>
                </div>

                {/* Metric 2: Ritmo Atual para as Horas Restantes */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-cyan-50/70 border border-cyan-100/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-cyan-800 mb-1">
                    <span>Ritmo Restante</span>
                    <TrendingUp className="w-4 h-4 text-cyan-700" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-cyan-900">
                    {summary.remainingTodayMl > 0 ? summary.adjustedHourlyRateMl : 0}{' '}
                    <span className="text-xs font-sans font-normal text-cyan-700">ml/h</span>
                  </div>
                  <div className="text-[11px] text-cyan-700 mt-1">
                    {summary.remainingHours > 0
                      ? `Próximas ${summary.remainingHours}h até dormir`
                      : 'Dia finalizado'}
                  </div>
                </div>

                {/* Metric 3: Próximo Lembrete */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Próximo Alerta</span>
                    <BellRing className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">
                    {formatTimer(secondsToNextReminder)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    A cada {settings.reminderIntervalMinutes} min
                  </div>
                </div>
              </div>

              {/* Action Strip: Quick drink buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addLog(summary.hourlyRateMl, 'water')}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-lg shadow-sm transition-all"
                  >
                    + Beber 1 Hora ({summary.hourlyRateMl} ml)
                  </button>
                  <button
                    onClick={() => addLog(250, 'water')}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-lg transition-colors"
                  >
                    + Copo (250 ml)
                  </button>
                  <button
                    onClick={onOpenQuickLog}
                    className="px-3 py-2 text-xs font-medium text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                    Outras opções...
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {todayLogs.length > 0 && (
                    <button
                      onClick={undoLastLog}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                      title="Desfazer último registro"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Desfazer</span>
                    </button>
                  )}
                  <button
                    onClick={onOpenHourly}
                    className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:underline"
                  >
                    <span>Ver agenda hora a hora</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
