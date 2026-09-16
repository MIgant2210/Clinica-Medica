import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { TrazaAuditoria } from '../types';
import { ShieldCheck, RefreshCw, Database, Clock } from 'lucide-react';

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

  const badgeAccion: Record<string, string> = {
    INSERT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UPDATE: 'bg-sky-50 text-sky-700 border-sky-200',
    DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            Aseguramiento de Calidad (SQA) • ISO/IEC 25010
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Bitácora de Auditoría y Trazabilidad
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro inmutable de transacciones críticas en la base de datos clínica
          </p>
        </div>

        <button
          onClick={cargarAuditoria}
          disabled={cargando}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${cargando ? 'animate-spin' : ''}`} />
          Refrescar Trazas
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-sm text-slate-500">Cargando trazas de auditoría...</div>
        ) : trazas.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No se han registrado eventos de auditoría aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Acción</th>
                  <th className="px-6 py-3.5">Entidad Afectada</th>
                  <th className="px-6 py-3.5">Detalle / Operación</th>
                  <th className="px-6 py-3.5">Usuario Responsable</th>
                  <th className="px-6 py-3.5">Fecha y Hora (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trazas.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          badgeAccion[t.accion] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 font-bold">
                        <Database className="h-3.5 w-3.5 text-slate-400" />
                        {t.tabla}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 text-xs font-medium">
                      {t.detalles}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                      {t.usuario_nombre}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-300" />
                      {new Date(t.fecha_accion).toLocaleString('es-GT', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
