import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { TrazaAuditoria } from '../types';
import { ShieldCheck, RefreshCw, Database, Clock, CheckCircle2, Lock } from 'lucide-react';

export const AuditoriaPage: React.FC = () => {
  const [trazas, setTrazas] = useState<TrazaAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarAuditoria = async () => {
    setCargando(true);
    try {
      const res = await apiClient.get('/auditoria');
      if (res.data.ok) {
        setTrazas(res.data.trazas);
      }
    } catch (e) {
      console.error('Error al cargar trazas de auditoría:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  const badgeAccion: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    INSERT: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    UPDATE: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
    DELETE: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado con Badges de Calidad */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1 border border-purple-100 dark:border-purple-800">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Norma ISO/IEC 25010 &bull; Seguridad e Integridad
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bitácora de Auditoría y Trazabilidad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registro cronológico inmutable de cambios en tablas clínicas y operativas
          </p>
        </div>

        <button
          onClick={cargarAuditoria}
          disabled={cargando}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${cargando ? 'animate-spin text-teal-600 dark:text-teal-400' : ''}`} />
          <span>Refrescar Bitácora</span>
        </button>
      </div>

      {/* Tarjeta de Trazabilidad */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Transacciones Auditadas</span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-600 dark:text-slate-400">
              {trazas.length} eventos
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Evidencia SQA Verificada</span>
          </div>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-sm text-slate-400">Cargando trazas de auditoría...</div>
        ) : trazas.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No se han registrado eventos de auditoría aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-xs uppercase text-slate-400 dark:text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">Entidad Afectada</th>
                  <th className="px-6 py-4">Operación y Detalle</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Fecha y Hora (Local)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {trazas.map((t) => {
                  const style = badgeAccion[t.accion] || badgeAccion.INSERT;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {t.accion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-800 dark:text-slate-200 font-bold">
                          <Database className="h-3.5 w-3.5 text-teal-500" />
                          <span>{t.tabla}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 text-xs font-medium">
                        {t.detalles}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.usuario_nombre}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-300 dark:text-slate-500" />
                        {new Date(t.fecha_accion).toLocaleString('es-GT', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
