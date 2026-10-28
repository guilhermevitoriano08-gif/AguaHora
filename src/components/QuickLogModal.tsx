import React, { useState } from 'react';
import {
  X,
  Plus,
  Droplet,
  Sparkles,
  Palmtree,
  Coffee,
  Zap,
  CupSoda,
  Check,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { BeverageType } from '../types/water';
import { BEVERAGES, formatMl } from '../utils/calculator';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose }) => {
  const { addLog, summary } = useWater();
  const [amount, setAmount] = useState<number>(250);
  const [beverage, setBeverage] = useState<BeverageType>('water');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const presets = [
    { label: 'Copo pequeno', amount: 150 },
    { label: 'Copo comum', amount: 250 },
    { label: 'Caneca / Grande', amount: 350 },
    { label: 'Garrafinha', amount: 500 },
    { label: 'Squeeze esportivo', amount: 750 },
    { label: 'Garrafa 1 Litro', amount: 1000 },
    { label: `Meta horária (${summary.hourlyRateMl}ml)`, amount: summary.hourlyRateMl },
  ];

  const handleBeverageSelect = (b: BeverageType) => {
    setBeverage(b);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addLog(amount, beverage, undefined, note.trim() || undefined);
    onClose();
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registrar Ingestão</h2>
            <p className="text-xs text-slate-500">Adicione água ou bebida consumida</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount input & display */}
          <div className="text-center py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Quantidade de Água
            </span>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="10"
                max="3000"
                step="25"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="text-4xl font-extrabold font-mono text-cyan-600 w-36 text-center focus:outline-none border-b-2 border-cyan-500 pb-1"
                autoFocus
              />
              <span className="text-xl font-bold text-slate-500">ml</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Tamanhos mais comuns
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label + p.amount}
                  type="button"
                  onClick={() => setAmount(p.amount)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    amount === p.amount
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-xs">{p.label}</div>
                  <div className="text-xs font-mono font-bold text-cyan-700">{p.amount} ml</div>
                </button>
              ))}
            </div>
          </div>

          {/* Beverage Type Selection */}
          <div>
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Tipo de Bebida
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(BEVERAGES) as BeverageType[]).map((bevKey) => {
                const b = BEVERAGES[bevKey];
                const isSelected = beverage === bevKey;
                return (
                  <button
                    key={bevKey}
                    type="button"
                    onClick={() => handleBeverageSelect(bevKey)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/80 ring-1 ring-cyan-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-slate-100 shrink-0">
                      {getBeverageIcon(bevKey)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-900 truncate">{b.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Fator: {Math.round(b.multiplier * 100)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note (optional) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Observação (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Água com gelo, durante reunião..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-cyan-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar {amount} ml</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
