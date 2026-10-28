import React, { useState } from 'react';
import {
  WaterProvider,
  useWater,
} from './context/WaterContext';
import { Header } from './components/Header';
import { WaterHero } from './components/WaterHero';
import { HourlyTimeline } from './components/HourlyTimeline';
import { HistoryView } from './components/HistoryView';
import { CalculatorModal } from './components/CalculatorModal';
import { QuickLogModal } from './components/QuickLogModal';
import { SettingsModal } from './components/SettingsModal';
import { PacingModal } from './components/PacingModal';
import {
  Droplets,
  Clock,
  Calculator,
  History,
  Plus,
  HeartPulse,
  Brain,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Gauge,
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hourly' | 'history' | 'calculator'>('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPacingOpen, setIsPacingOpen] = useState(false);

  const {
    secondsToNextReminder,
    isReminderDue,
    summary,
    hourlySlots,
    addLog,
  } = useWater();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-20 md:pb-8">
      {/* 3-Zone Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        secondsToNextReminder={secondsToNextReminder}
        isReminderDue={isReminderDue}
      />

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 flex-1">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Visual Reservoir & Hourly Rate Hero */}
            <WaterHero
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenQuickLog={() => setIsQuickLogOpen(true)}
              onOpenHourly={() => setActiveTab('hourly')}
              onOpenPacing={() => setIsPacingOpen(true)}
            />

            {/* Hourly Schedule Peek: Next 4 hours */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Seu Ritmo Horário Hoje
                  </h2>
                  <p className="text-xs text-slate-500">
                    Meta de <strong className="font-mono text-cyan-800">{summary.hourlyRateMl} ml/h</strong> dividida ao longo do seu dia
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('hourly')}
                  className="text-xs font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Ver todas as horas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {hourlySlots.slice(0, 4).map((slot) => {
                  const isDone = slot.consumedMl >= slot.targetMl;
                  return (
                    <div
                      key={slot.hour}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                        slot.isCurrent
                          ? 'bg-cyan-50/70 border-cyan-300 ring-1 ring-cyan-200'
                          : isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-800">{slot.hourLabel}</span>
                        {slot.isCurrent ? (
                          <span className="text-[10px] font-semibold text-cyan-700 uppercase">Agora</span>
                        ) : isDone ? (
                          <span className="text-[10px] font-semibold text-emerald-700">Concluído</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Meta: {slot.targetMl}ml</span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Bebido:</span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {slot.consumedMl} ml
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scientific Benefits of Drinking Water Hourly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Foco & Concentração</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Pequenos goles de água a cada hora evitam quedas de até 15% na capacidade
                    cognitiva e eliminam sonolência vespertina.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Proteção Renal Efetiva</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Distribuir o consumo dilui a urina de modo homogêneo durante o dia, prevenindo
                    cálculos renais e sobrecarga circulatória.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Absorção Celular Otimizada</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    O organismo absorve até 250ml a cada 20-30 minutos. Tomar muita água de uma vez só
                    faz o corpo excretar rapidamente sem hidratar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hourly' && (
          <div className="animate-in fade-in duration-200">
            <HourlyTimeline
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenPacing={() => setIsPacingOpen(true)}
            />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200">
            {/* Direct embedded trigger to open the full interactive calculator */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="max-w-xl">
                <div className="text-xs font-semibold tracking-wider uppercase text-cyan-700">
                  Ferramenta de Planejamento Hídrico
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Calculadora de Ingestão por Hora
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  A quantidade de água que cada pessoa precisa varia de acordo com o peso corporal,
                  rotina de exercícios e clima. Abra nossa calculadora para calibrar sua taxa exata
                  e definir horários de acordar e dormir.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setIsCalculatorOpen(true)}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Calcular Minha Meta Agora
                  </button>
                  <button
                    onClick={() => setIsPacingOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Alterar Ritmo / Curva
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar ao Painel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <HistoryView />
          </div>
        )}
      </main>

      {/* Modals */}
      <CalculatorModal
        isOpen={isCalculatorOpen || activeTab === 'calculator'}
        onClose={() => {
          setIsCalculatorOpen(false);
          if (activeTab === 'calculator') {
            setActiveTab('dashboard');
          }
        }}
      />

      <PacingModal
        isOpen={isPacingOpen}
        onClose={() => setIsPacingOpen(false)}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Mobile Bottom Thumb Tab Bar (Strict ergonomic standard: 44px+ hitboxes, fixed bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1">
        <div className="grid grid-cols-4 items-center h-14">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'dashboard' ? 'text-cyan-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('hourly')}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'hourly' ? 'text-cyan-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Por Hora</span>
          </button>

          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Calcular</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'history' ? 'text-cyan-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Histórico</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WaterProvider>
      <AppContent />
    </WaterProvider>
  );
}
