import React, { useState } from 'react';
import {
  X,
  Gauge,
  Sunrise,
  Sun,
  Activity,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { PacingDistribution, PacingIntensity } from '../types/water';
import {
  calculateDailyGoal,
  calculateActiveHours,
  calculateHourlyRate,
  getPacingWeights,
  formatMl,
} from '../utils/calculator';

interface PacingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PacingModal: React.FC<PacingModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, summary } = useWater();

  const [intensity, setIntensity] = useState<PacingIntensity>(
    settings.pacingIntensity || 'balanced'
  );
  const [distribution, setDistribution] = useState<PacingDistribution>(
    settings.pacingDistribution || 'uniform'
  );
  const [manualRate, setManualRate] = useState<number>(
    settings.manualHourlyRateMl || summary.hourlyRateMl || 175
  );
  const [adaptive, setAdaptive] = useState<boolean>(
    settings.adaptivePacing !== undefined ? settings.adaptivePacing : true
  );

  if (!isOpen) return null;

  const activeHours = calculateActiveHours(settings.wakeTime, settings.sleepTime);
  const totalSlots = Math.max(1, Math.round(activeHours));

  // Preview calculations
  const previewGoal = calculateDailyGoal(
    settings.weightKg,
    settings.activityLevel,
    settings.climate,
    settings.useCustomDailyGoal,
    settings.customDailyGoalMl,
    intensity,
    distribution,
    manualRate,
    activeHours
  );

  const previewHourlyRate = calculateHourlyRate(
    previewGoal,
    activeHours,
    distribution,
    manualRate
  );

  // Compute preview curve
  const weights = getPacingWeights(totalSlots, distribution);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const previewSlots = weights.map((w, idx) => {
    const val = distribution === 'custom_rate' ? manualRate : Math.round((previewGoal * (w / totalWeight)) / 5) * 5;
    return {
      index: idx,
      ml: val,
    };
  });
  const maxSlotMl = Math.max(...previewSlots.map(s => s.ml), 1);

  const handleSave = () => {
    updateSettings({
      pacingIntensity: intensity,
      pacingDistribution: distribution,
      manualHourlyRateMl: manualRate,
      adaptivePacing: adaptive,
    });
    onClose();
  };

  const handleResetDefault = () => {
    setIntensity('balanced');
    setDistribution('uniform');
    setManualRate(175);
    setAdaptive(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ajustar Ritmo de Hidratação</h2>
              <p className="text-xs text-slate-500">
                Altere a velocidade, taxa e distribuição hora a hora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Distribution Pattern (Curva do Dia) */}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-1">
              Curva de Distribuição do Dia
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Como você prefere espalhar a quantidade de água pelas horas acordado?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Uniform */}
              <button
                type="button"
                onClick={() => setDistribution('uniform')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  distribution === 'uniform'
                    ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  <span>Uniforme / Constante</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mesma quantidade dividida igualmente em todas as horas do dia.
                </p>
              </button>

              {/* Option B: Front-Loaded (Foco Matutino) */}
              <button
                type="button"
                onClick={() => setDistribution('front_loaded')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  distribution === 'front_loaded'
                    ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Sunrise className="w-4 h-4 text-amber-600" />
                  <span>Foco Matutino (Sono Melhor)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mais água pela manhã e tarde, diminuindo à noite para evitar acordar de madrugada.
                </p>
              </button>

              {/* Option C: Afternoon Peak */}
              <button
                type="button"
                onClick={() => setDistribution('afternoon_focus')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  distribution === 'afternoon_focus'
                    ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Sun className="w-4 h-4 text-orange-500" />
                  <span>Pico da Tarde</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ritmo mais forte entre 12h e 18h, ideal para quem treina ou trabalha à tarde.
                </p>
              </button>

              {/* Option D: Custom Direct Hourly Rate */}
              <button
                type="button"
                onClick={() => setDistribution('custom_rate')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  distribution === 'custom_rate'
                    ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Definir Taxa Fixa Manual</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Escolha você mesmo exatamente quantos ml quer beber por hora (ex: 200 ml/h).
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Direct Rate Slider (if custom_rate chosen or intensity tuning) */}
          {distribution === 'custom_rate' ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Sua Taxa por Hora Personalizada
                </span>
                <span className="text-xl font-bold font-mono text-cyan-700 tabular-nums">
                  {manualRate} ml/h
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="350"
                step="5"
                value={manualRate}
                onChange={(e) => setManualRate(Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>80 ml/h (Mais leve)</span>
                <span>Meta total resultante: {formatMl(manualRate * activeHours)}</span>
                <span>350 ml/h (Muito intenso)</span>
              </div>
            </div>
          ) : (
            /* Section 2B: Intensity Selector */
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-1">
                Intensidade do Ritmo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'gentle',
                    title: 'Suave',
                    sub: '30 ml/kg',
                    desc: 'Ritmo mais calmo e acessível',
                  },
                  {
                    id: 'balanced',
                    title: 'Equilibrado',
                    sub: '35 ml/kg',
                    desc: 'Recomendação clínica padrão',
                  },
                  {
                    id: 'intense',
                    title: 'Intenso',
                    sub: '42 ml/kg',
                    desc: 'Alto rendimento e calor',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIntensity(item.id as PacingIntensity)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      intensity === item.id
                        ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500 font-medium'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                    <div className="text-[10px] text-cyan-700 font-mono mt-0.5">{item.sub}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Adaptive Pacing Toggle */}
          <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-cyan-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Ritmo Adaptativo Dinâmico
              </span>
              <p className="text-[11px] text-cyan-800 leading-relaxed">
                Se você beber a mais ou a menos em determinada hora, o AquaHora recalcula
                automaticamente a quantidade das horas seguintes para você atingir a meta sem
                esforço.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAdaptive(!adaptive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                adaptive ? 'bg-cyan-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adaptive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 4: Live Visual Curve Preview */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Simulação da Curva Horária
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-300">
                Média: {previewHourlyRate} ml/h
              </span>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1 sm:gap-1.5 h-20 pt-2 border-b border-slate-700">
              {previewSlots.map((slot) => {
                const heightPercent = Math.min(100, Math.round((slot.ml / maxSlotMl) * 100));
                return (
                  <div key={slot.index} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div
                      className="w-full bg-cyan-400 rounded-t-sm transition-all duration-300 group-hover:bg-cyan-200"
                      style={{ height: `${Math.max(12, heightPercent)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{settings.wakeTime} (Acordar)</span>
              <span>Meta resultante: <strong className="text-white">{formatMl(previewGoal)}</strong></span>
              <span>{settings.sleepTime} (Dormir)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar padrão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Novo Ritmo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
