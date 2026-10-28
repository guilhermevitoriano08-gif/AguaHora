import React, { useState } from 'react';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Play,
  CheckCircle,
  AlertCircle,
  Sliders,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useWater } from '../context/WaterContext';
import { SoundType } from '../types/water';
import {
  isNotificationSupported,
  getNotificationPermission,
} from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    testReminderSound,
    enableNotifications,
    clearAllData,
  } = useWater();

  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentPermission = getNotificationPermission();

  const handleTestSound = () => {
    testReminderSound();
  };

  const handleToggleNotifications = async () => {
    const granted = await enableNotifications();
    if (granted) {
      setNotificationMsg('Notificações ativadas com sucesso!');
    } else {
      setNotificationMsg('Permissão de notificação negada no navegador.');
    }
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const sounds: { id: SoundType; name: string; desc: string }[] = [
    { id: 'droplet', name: "Gota d'Água Físico", desc: 'Efeito acústico realista de gota caindo na água' },
    { id: 'crystal', name: 'Cristal Harmônico', desc: 'Acorde cristalino suave e relaxante' },
    { id: 'zen', name: 'Sino Zen Tibetano', desc: 'Frequência 432 Hz para foco e bem-estar' },
    { id: 'gentle', name: 'Tom Duplo Discreto', desc: 'Aviso suave para ambientes de trabalho' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lembretes & Som</h2>
              <p className="text-xs text-slate-500">Configure avisos sonoros e notificações</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section: Frequency */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Intervalo dos Lembretes
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
                  onClick={() => updateSettings({ reminderIntervalMinutes: item.min })}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                    settings.reminderIntervalMinutes === item.min
                      ? 'border-cyan-600 bg-cyan-600 text-white font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Sound Tones */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm font-semibold text-slate-900 block">
                  Avisos Sonoros
                </label>
                <span className="text-xs text-slate-500">
                  Toca um efeito suave quando o lembrete vencer
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundEnabled ? 'bg-cyan-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="space-y-2 mt-3 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  {sounds.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => updateSettings({ soundType: s.id })}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        settings.soundType === s.id
                          ? 'border-cyan-600 bg-cyan-50/70 ring-1 ring-cyan-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">{s.desc}</div>
                      </div>
                      {settings.soundType === s.id && (
                        <div className="w-2 h-2 rounded-full bg-cyan-600" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Volume & Test Button */}
                <div className="pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Volume2 className="w-4 h-4 text-slate-500" />
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={settings.volume}
                      onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTestSound}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-100 hover:bg-cyan-200 rounded-lg transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Testar Som</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Browser Notifications */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 block">
                  Notificações do Navegador
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receba avisos na área de trabalho mesmo se a aba estiver em segundo plano.
                </p>
              </div>

              {isNotificationSupported() ? (
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
                    currentPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  {currentPermission === 'granted' ? 'Ativado ✓' : 'Ativar'}
                </button>
              ) : (
                <span className="text-xs text-slate-400">Não suportado</span>
              )}
            </div>

            {notificationMsg && (
              <p className="text-xs text-cyan-700 font-medium mt-2 animate-in fade-in">
                {notificationMsg}
              </p>
            )}
          </div>

          {/* Section: Danger Zone / Reset */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-semibold uppercase tracking-wider text-rose-500 block mb-2">
              Gerenciar Dados
            </label>
            {confirmClear ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="text-xs text-rose-800 font-medium">
                  Tem certeza que deseja apagar todos os registros e reiniciar o app?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      clearAllData();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
                  >
                    Sim, apagar tudo
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar todos os dados salvos</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
