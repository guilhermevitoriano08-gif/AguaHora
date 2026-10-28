import React from 'react';
import {
  Calendar,
  Clock,
  Trash2,
  TrendingUp,
  Award,
  Droplet,
  Coffee,
  Sparkles,
  Palmtree,
  Zap,
  CupSoda,
  RotateCcw,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { BeverageType } from '../types/water';
import { BEVERAGES, formatMl } from '../utils/calculator';

export const HistoryView: React.FC = () => {
  const {
    historyRecords,
    todayLogs,
    deleteLog,
    resetTodayLogs,
    summary,
  } = useWater();

  const getBeverageIcon = (type: BeverageType) => {
    switch (type) {
      case 'water':
        return <Droplet className="w-4 h-4 text-cyan-600" />;
      case 'flavored_water':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'coconut_water':
        return <Palmtree className="w-4 h-4 text-amber-600" />;
      case 'herbal_tea':
        return <Coffee className="w-4 h-4 text-orange-600" />;
      case 'isotonic':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'coffee':
        return <CupSoda className="w-4 h-4 text-amber-800" />;
    }
  };

  const formatLogTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top 7-Day Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-cyan-700">
              Desempenho Semanal
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Últimos 7 Dias de Hidratação
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Acompanhe sua regularidade para consolidar o hábito
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl text-emerald-800 text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Hábito em Progresso</span>
            </div>
          </div>
        </div>

        {/* 7-Day Chart Bars */}
        <div className="pt-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pb-2 border-b border-slate-100">
            {historyRecords.map((rec) => {
              const maxScale = Math.max(rec.goalMl * 1.2, 3500);
              const heightPercent = Math.min(100, Math.round((rec.consumedMl / maxScale) * 100));
              const goalPercent = Math.min(100, Math.round((rec.goalMl / maxScale) * 100));
              const isAchieved = rec.consumedMl >= rec.goalMl;

              const dateObj = new Date(rec.date + 'T12:00:00');
              const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              const dayNum = dateObj.getDate();

              return (
                <div key={rec.date} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {rec.consumedMl}ml
                  </div>

                  {/* Bar container */}
                  <div className="w-full max-w-[42px] h-36 bg-slate-100 rounded-xl relative flex flex-col justify-end overflow-hidden">
                    {/* Goal guideline line */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-slate-400 z-10"
                      style={{ bottom: `${goalPercent}%` }}
                      title={`Meta: ${rec.goalMl}ml`}
                    />

                    {/* Progress Bar */}
                    <div
                      className={`w-full rounded-b-xl transition-all duration-500 ${
                        isAchieved
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-cyan-600 to-sky-400'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <div className="text-center mt-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase block">
                      {dayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dayNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" />
              <span>Linha pontilhada = Meta diária individual</span>
            </div>
            <div className="text-[11px]">
              Hoje: <strong>{formatMl(summary.effectiveHydrationTodayMl)}</strong> de{' '}
              <strong>{formatMl(summary.dailyGoalMl)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Log List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registros de Hoje</h3>
            <p className="text-xs text-slate-500">Histórico de cada gole e bebida registrada</p>
          </div>

          {todayLogs.length > 0 && (
            <button
              onClick={resetTodayLogs}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar registros de hoje</span>
            </button>
          )}
        </div>

        {todayLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Droplet className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-600">Nenhum registro hoje ainda</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Toque no botão "+ Registrar" ou na página inicial para começar seu dia!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {todayLogs.map((log) => {
              const bev = BEVERAGES[log.beverageType] || BEVERAGES.water;
              return (
                <div
                  key={log.id}
                  className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getBeverageIcon(log.beverageType)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <span>{bev.name}</span>
                        <span className="text-xs font-mono font-bold text-cyan-700 tabular-nums">
                          +{log.amountMl} ml
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{formatLogTime(log.timestamp)}</span>
                        {log.note && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{log.note}</span>
                          </>
                        )}
                        {bev.multiplier !== 1 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Hidratação útil: {log.effectiveHydrationMl} ml</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteLog(log.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remover registro"
                    aria-label="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
