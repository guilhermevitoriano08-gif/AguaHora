import React from 'react';
import { Droplets, Bell, SlidersHorizontal, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'hourly' | 'history' | 'calculator';
  setActiveTab: (tab: 'dashboard' | 'hourly' | 'history' | 'calculator') => void;
  onOpenQuickLog: () => void;
  onOpenSettings: () => void;
  secondsToNextReminder: number;
  isReminderDue: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickLog,
  onOpenSettings,
  secondsToNextReminder,
  isReminderDue,
}) => {
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
            <Droplets className="w-5 h-5 stroke-[2.2]" />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors whitespace-nowrap">
              AquaHora
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'text-cyan-700 bg-cyan-50/80 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'hourly'
                ? 'text-cyan-700 bg-cyan-50/80 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Meta por Hora
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'text-cyan-700 bg-cyan-50/80 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Calculadora
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'text-cyan-700 bg-cyan-50/80 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Histórico
          </button>
        </nav>

        {/* Zone 3: Actions & Reminder Countdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Subtle reminder timer affordance */}
          <button
            onClick={onOpenSettings}
            title={isReminderDue ? 'Lembrete vencido!' : `Próximo lembrete em ${formatTimer(secondsToNextReminder)}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums transition-colors ${
              isReminderDue
                ? 'bg-amber-100 text-amber-800 animate-pulse font-semibold border border-amber-300'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${isReminderDue ? 'text-amber-600 animate-bounce' : 'text-slate-500'}`} />
            <span className="hidden sm:inline text-xs font-sans text-slate-500 mr-0.5">Lembrete:</span>
            <span>{isReminderDue ? 'Hora de beber!' : formatTimer(secondsToNextReminder)}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Configurações de som e rotina"
            aria-label="Configurações"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-lg shadow-sm shadow-cyan-600/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
