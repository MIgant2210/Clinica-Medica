import React, { useState } from 'react';
import { Sparkles, X, Loader2, Send } from 'lucide-react';
import { apiClient } from '../api/client';
import { ExpedienteClinico, Paciente } from '../types';

interface MedicalAICopilotProps {
  expediente: ExpedienteClinico;
  paciente: Paciente;
}

const FormattedMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const isHeader =
          trimmed.startsWith('#') ||
          trimmed.startsWith('📋') ||
          trimmed.startsWith('⚠️') ||
          trimmed.startsWith('🩺') ||
          trimmed.startsWith('💡') ||
          trimmed.startsWith('🔍');

        const renderText = (str: string) => {
          const parts = str.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });
        };

        if (isHeader) {
          return (
            <div
              key={idx}
              className="font-bold text-indigo-900 dark:text-indigo-300 pt-2 pb-0.5 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center gap-1.5 text-xs uppercase tracking-wide"
            >
              {renderText(trimmed.replace(/^#+\s*/, ''))}
            </div>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-indigo-500 font-bold mt-1 text-[10px] leading-none">•</span>
              <span className="flex-1 text-slate-700 dark:text-slate-300">{renderText(trimmed.slice(2))}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-700 dark:text-slate-300">
            {renderText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const MedicalAICopilot: React.FC<MedicalAICopilotProps> = ({ expediente, paciente }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumen, setResumen] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{rol: 'user' | 'ai', msj: string}[]>([]);

  const handleGenerarResumen = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/ia/resumir', {
        expedienteData: {
          paciente: paciente.nombre_completo,
          alergias: expediente.antecedentes_alergias,
          patologias: expediente.antecedentes_patologicos,
          consultasRecientes: expediente.consultas.slice(0, 3)
        }
      });
      if (res.data.ok) {
        setResumen(res.data.resumen);
      }
    } catch (error) {
      console.error(error);
      setResumen('Error al generar resumen. Verifica la conexión o la API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { rol: 'user', msj: userMsg }]);
    setIsLoading(true);

    try {
      const res = await apiClient.post('/ia/chat', {
        mensaje: userMsg,
        historial: `Paciente: ${paciente.nombre_completo}. Alergias: ${expediente.antecedentes_alergias}. Patologías: ${expediente.antecedentes_patologicos}.`
      });
      if (res.data.ok) {
        setChatHistory(prev => [...prev, { rol: 'ai', msj: res.data.respuesta }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { rol: 'ai', msj: 'Ocurrió un error al procesar tu solicitud.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-40 border-2 border-white/20"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Panel de Cristal */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-l border-white/40 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold shadow-inner text-2xl">
                👨🏻‍⚕️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">Dr. Simi IA</h3>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">Asistente Clínico Inteligente</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-800/50 p-2 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
            
            {/* Resumen Rápido */}
            <div className="space-y-3">
              <button
                onClick={handleGenerarResumen}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.99]"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generar Resumen Clínico
              </button>
              
              {resumen && (
                <div className="p-4 bg-indigo-50/90 dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                  <FormattedMarkdown text={resumen} />
                </div>
              )}
            </div>

            <hr className="border-slate-200/50 dark:border-slate-800/50" />

            {/* Chatbot */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Chat de Asistencia Médica</div>
              
              <div className="space-y-3">
                {chatHistory.length === 0 && (
                  <div className="text-center text-sm text-slate-400 italic">
                    Haz preguntas sobre CIE-10, tratamientos o síntomas.
                  </div>
                )}
                
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm ${
                      msg.rol === 'user' 
                        ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-tr-sm shadow-sm' 
                        : 'bg-indigo-50 dark:bg-slate-800/90 rounded-tl-sm border border-indigo-100 dark:border-slate-700 shadow-sm'
                    }`}>
                      {msg.rol === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.msj}</p>
                      ) : (
                        <FormattedMarkdown text={msg.msj} />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && chatInput === '' && (
                  <div className="flex justify-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl rounded-tl-sm text-indigo-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50">
            <form onSubmit={handleChat} className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pregunta a la IA..."
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isLoading}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
