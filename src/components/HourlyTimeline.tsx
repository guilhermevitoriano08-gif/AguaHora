import React, { useState } from 'react';
import {
  Clock,
  Check,
  Plus,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Droplet,
  ChevronRight,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { HourlySlot } from '../types/water';
import { formatMl } from '../utils/calculator';

interface HourlyTimelineProps {
  onOpenCalculator: () => void;
  onOpenPacing?: () => void;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ onOpenCalculator, onOpenPacing }) => {
  const { hourlySlots, settings, summary, addLog } = useWater();
  const [selectedHourForLogging, setSelectedHourForLogging] = useState<number | null>(null);
  const [quickCustomAmount, setQuickCustomAmount] = useState<number>(summary.hourlyRateMl);

  const getPacingLabel = () => {
    if (settings.pacingDistribution === 'front_loaded') return 'Foco Matutino (maior pela manhã)';
    if (settings.pacingDistribution === 'afternoon_focus') return 'Pico da Tarde (maior à tarde)';
    if (settings.pacingDistribution === 'custom_rate') return `Taxa Fixa (${settings.manualHourlyRateMl} ml/h)`;
    return 'Distribuição Uniforme';
  };

  const handleLogSpecificHour = (hour: number, amount: number) => {
    const targetDate = new Date();
    targetDate.setHours(hour, 15, 0, 0);
    addLog(amount, 'water', targetDate.getTime(), `Registro na faixa das ${hour}:00`);
    setSelectedHourForLogging(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-700">
                Cronograma Detalhado do Dia
              </span>
              <span className="text-[11px] font-medium text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200/60">
                {getPacingLabel()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Distribuição de Água por Hora
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Distribuímos sua meta diária de{' '}
              <strong className="text-slate-900">{formatMl(summary.dailyGoalMl)}</strong> em{' '}
              <strong>{hourlySlots.length} horas ativas</strong> ({settings.wakeTime} às{' '}
              {settings.sleepTime}).
              {settings.adaptivePacing && (
                <span className="text-cyan-700 ml-1 font-medium">
                  (Ritmo adaptativo ativo para compensar variações)
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2 text-center">
              <span className="text-[10px] text-cyan-800 font-medium block">Média Horária</span>
              <span className="text-lg font-bold font-mono tabular-nums text-cyan-950">
                {summary.hourlyRateMl} ml/h
              </span>
            </div>
            {onOpenPacing && (
              <button
                onClick={onOpenPacing}
                className="px-3.5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Alterar Ritmo
              </button>
            )}
            <button
              onClick={onOpenCalculator}
              className="px-3 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Horários
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Meta atingida na hora</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
            <span>Hora atual em andamento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Abaixo da meta esperada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
            <span>Horas futuras programadas</span>
          </div>
        </div>
      </div>

      {/* Hourly Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hourlySlots.map((slot) => {
          const isComplete = slot.consumedMl >= slot.targetMl;
          const isDeficit = slot.isPast && !isComplete;
          const progressPercent = Math.min(100, Math.round((slot.consumedMl / slot.targetMl) * 100));

          return (
            <div
              key={slot.hour}
              className={`rounded-2xl border transition-all p-4 flex flex-col justify-between ${
                slot.isCurrent
                  ? 'bg-cyan-50/50 border-cyan-300 shadow-sm ring-1 ring-cyan-200'
                  : isComplete
                  ? 'bg-white border-slate-200'
                  : isDeficit
                  ? 'bg-amber-50/30 border-amber-200/80'
                  : 'bg-white border-slate-200/70'
              }`}
            >
              {/* Card Header: Hour and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {slot.hourLabel}
                  </span>
                  {slot.isCurrent && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-800 bg-cyan-100/90 px-2 py-0.5 rounded-md">
                      Agora
                    </span>
                  )}
                </div>

                {isComplete ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <Check className="w-4 h-4" /> Batida
                  </span>
                ) : slot.isCurrent ? (
                  <span className="text-xs font-medium text-cyan-700">
                    Em progresso
                  </span>
                ) : isDeficit ? (
                  <span className="text-xs text-amber-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Abaixo
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Previsto
                  </span>
                )}
              </div>

              {/* Progress and Numbers */}
              <div className="my-3 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Consumido nesta hora:</span>
                  <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {slot.consumedMl}{' '}
                    <span className="text-xs font-normal text-slate-500">/ {slot.targetMl} ml</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-emerald-500'
                        : slot.isCurrent
                        ? 'bg-cyan-500'
                        : isDeficit
                        ? 'bg-amber-400'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cumulativo esperado: {slot.cumulativeTargetMl} ml</span>
                  <span>Real: {slot.cumulativeConsumedMl} ml</span>
                </div>
              </div>

              {/* Action: Add to this hour */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {selectedHourForLogging === slot.hour ? (
                  <div className="w-full flex items-center gap-1.5 animate-in fade-in duration-200">
                    <input
                      type="number"
                      step="50"
                      value={quickCustomAmount}
                      onChange={(e) => setQuickCustomAmount(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-mono border border-slate-300 rounded-md focus:outline-cyan-500"
                    />
                    <button
                      onClick={() => handleLogSpecificHour(slot.hour, quickCustomAmount)}
                      className="px-2.5 py-1 text-xs font-semibold bg-cyan-600 text-white rounded-md hover:bg-cyan-500"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setSelectedHourForLogging(null)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleLogSpecificHour(slot.hour, slot.targetMl)}
                      className="text-xs font-medium text-cyan-700 hover:text-cyan-800 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+{slot.targetMl} ml</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedHourForLogging(slot.hour);
                        setQuickCustomAmount(slot.targetMl);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Outro valor...
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hydration Pacing Note */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-slate-700">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-600" />
          Por que beber água hora a hora é tão importante?
        </h3>
        <p className="text-xs leading-relaxed text-slate-600 mt-2">
          O organismo humano só consegue absorver e utilizar eficientemente cerca de{' '}
          <strong>200 a 300 ml de água a cada 20–30 minutos</strong>. Beber 1 litro de uma vez só
          quando se sente sede extrema acaba sobrecarregando a filtração renal e é eliminado quase
          imediatamente na urina sem hidratar as células. Manter o ritmo hora a hora evita fadiga,
          dores de cabeça e melhora o metabolismo.
        </p>
      </div>
    </div>
  );
};
