import React, { useState } from 'react';
import {
  X,
  Calculator,
  Scale,
  Activity,
  Sun,
  Clock,
  Sparkles,
  Check,
  Flame,
  Droplets,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { ActivityLevel, ClimateType, PacingDistribution, PacingIntensity } from '../types/water';
import {
  calculateDailyGoal,
  calculateActiveHours,
  calculateHourlyRate,
  formatMl,
} from '../utils/calculator';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useWater();

  const [weight, setWeight] = useState<number>(settings.weightKg || 70);
  const [activity, setActivity] = useState<ActivityLevel>(settings.activityLevel || 'moderate');
  const [climate, setClimate] = useState<ClimateType>(settings.climate || 'temperate');
  const [wakeTime, setWakeTime] = useState<string>(settings.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState<string>(settings.sleepTime || '23:00');
  const [reminderInterval, setReminderInterval] = useState<number>(settings.reminderIntervalMinutes || 60);
  const [useCustomGoal, setUseCustomGoal] = useState<boolean>(settings.useCustomDailyGoal);
  const [customGoal, setCustomGoal] = useState<number>(settings.customDailyGoalMl || 2500);
  const [pacingDist, setPacingDist] = useState<PacingDistribution>(settings.pacingDistribution || 'uniform');
  const [pacingInt, setPacingInt] = useState<PacingIntensity>(settings.pacingIntensity || 'balanced');
  const [manualRate, setManualRate] = useState<number>(settings.manualHourlyRateMl || 175);

  if (!isOpen) return null;

  const previewActiveHours = calculateActiveHours(wakeTime, sleepTime);
  const previewGoal = calculateDailyGoal(
    weight,
    activity,
    climate,
    useCustomGoal,
    customGoal,
    pacingInt,
    pacingDist,
    manualRate,
    previewActiveHours
  );
  const previewHourlyRate = calculateHourlyRate(
    previewGoal,
    previewActiveHours,
    pacingDist,
    manualRate
  );

  const previewPerReminder = Math.round((previewHourlyRate * (reminderInterval / 60)) / 5) * 5;

  const handleSave = () => {
    updateSettings({
      weightKg: weight,
      activityLevel: activity,
      climate,
      wakeTime,
      sleepTime,
      reminderIntervalMinutes: reminderInterval,
      useCustomDailyGoal: useCustomGoal,
      customDailyGoalMl: customGoal,
      pacingDistribution: pacingDist,
      pacingIntensity: pacingInt,
      manualHourlyRateMl: manualRate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Calculadora de Ingestão & Meta por Hora
              </h2>
              <p className="text-xs text-slate-500">
                Calcule a necessidade hídrica personalizada e a distribuição hora a hora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-600" />
                Seu Peso Corporal
              </label>
              <span className="text-lg font-bold font-mono text-cyan-700 tabular-nums">
                {weight} kg
              </span>
            </div>
            <input
              type="range"
              min="35"
              max="160"
              step="1"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>35 kg</span>
              <span>Recomendação padrão: 35 ml por kg</span>
              <span>160 kg</span>
            </div>
          </div>

          {/* Section 2: Activity Level */}
          <div>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2.5">
              <Activity className="w-4 h-4 text-cyan-600" />
              Nível de Atividade Física
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'sedentary', label: 'Sedentário', sub: 'Trabalho sentado', bonus: '+0 ml' },
                { id: 'light', label: 'Leve', sub: 'Caminhada diária', bonus: '+350 ml' },
                { id: 'moderate', label: 'Moderado', sub: 'Treino 45-60m', bonus: '+600 ml' },
                { id: 'intense', label: 'Intenso', sub: 'Atleta / Crossfit', bonus: '+950 ml' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivity(item.id as ActivityLevel)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activity === item.id
                      ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-medium ring-1 ring-cyan-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
                  <div className="text-[10px] text-cyan-600 font-mono mt-1">{item.bonus}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Climate */}
          <div>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2.5">
              <Sun className="w-4 h-4 text-cyan-600" />
              Clima Predominante da Sua Região
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'temperate', label: 'Ameno / Ar condicionado', bonus: '+0 ml' },
                { id: 'warm', label: 'Quente moderado', bonus: '+350 ml' },
                { id: 'hot_dry', label: 'Muito Quente / Seco', bonus: '+600 ml' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClimate(c.id as ClimateType)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    climate === c.id
                      ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-medium ring-1 ring-cyan-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold">{c.label}</div>
                  <div className="text-[10px] text-cyan-600 font-mono mt-1">{c.bonus}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Active Hours (Wake & Sleep) */}
          <div>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2.5">
              <Clock className="w-4 h-4 text-cyan-600" />
              Sua Janela de Vigília (Horas Ativas)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs text-slate-500 block mb-1">Horário que acorda:</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full text-base font-semibold font-mono bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-cyan-500"
                />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-xs text-slate-500 block mb-1">Horário que vai dormir:</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full text-base font-semibold font-mono bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-cyan-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Total de horas ativas estimadas:{' '}
              <strong className="text-slate-800">{previewActiveHours} horas</strong>. Sua meta será
              dividida exclusivamente por esse período.
            </p>
          </div>

          {/* Section 5: Reminder Interval */}
          <div>
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2.5">
              <Clock className="w-4 h-4 text-cyan-600" />
              Frequência dos Lembretes
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { min: 30, label: '30 min' },
                { min: 45, label: '45 min' },
                { min: 60, label: '1 hora' },
                { min: 90, label: '1h 30m' },
                { min: 120, label: '2 horas' },
              ].map((item) => (
                <button
                  key={item.min}
                  type="button"
                  onClick={() => setReminderInterval(item.min)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    reminderInterval === item.min
                      ? 'border-cyan-600 bg-cyan-600 text-white font-semibold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Rhythm & Pacing Distribution */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Ritmo da Distribuição Horária
              </label>
              <span className="text-xs text-cyan-700 font-medium">
                {pacingDist === 'front_loaded'
                  ? 'Foco Matutino'
                  : pacingDist === 'afternoon_focus'
                  ? 'Pico da Tarde'
                  : pacingDist === 'custom_rate'
                  ? 'Taxa Manual'
                  : 'Uniforme'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'uniform', label: 'Uniforme', desc: 'Doses iguais' },
                { id: 'front_loaded', label: 'Matutino', desc: 'Mais cedo, menos à noite' },
                { id: 'afternoon_focus', label: 'Tarde Ativa', desc: 'Pico 12h às 18h' },
                { id: 'custom_rate', label: 'Taxa Manual', desc: 'Você escolhe os ml/h' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPacingDist(p.id as PacingDistribution)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    pacingDist === p.id
                      ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs">{p.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>

            {pacingDist === 'custom_rate' && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Defina a taxa desejada por hora:</span>
                  <span className="font-mono text-cyan-700">{manualRate} ml/h</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="350"
                  step="5"
                  value={manualRate}
                  onChange={(e) => setManualRate(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>
            )}
          </div>

          {/* Live Result Highlights */}
          <div className="bg-gradient-to-br from-cyan-900 via-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-inner space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Resultado do Seu Plano de Hidratação
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-xs text-slate-300 block">Meta Diária Total</span>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {formatMl(previewGoal)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {(previewGoal / 250).toFixed(1)} copos de 250ml
                </span>
              </div>

              <div className="sm:border-l sm:border-slate-700 sm:pl-4">
                <span className="text-xs text-cyan-300 font-semibold block">
                  Meta Calculada por Hora
                </span>
                <span className="text-3xl font-extrabold font-mono text-cyan-300 tabular-nums">
                  {previewHourlyRate} ml/h
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Dividido em {previewActiveHours}h ativas
                </span>
              </div>

              <div className="sm:border-l sm:border-slate-700 sm:pl-4">
                <span className="text-xs text-slate-300 block">Dose por Lembrete</span>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  ~{previewPerReminder} ml
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  A cada {reminderInterval} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-xl shadow-sm transition-all"
          >
            Salvar e Aplicar Meta
          </button>
        </div>
      </div>
    </div>
  );
};
