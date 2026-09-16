import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita } from '../types';
import { Calendar, Clock, AlertCircle, ArrowUpRight, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient.get('/citas');
        if (res.data.ok) {
          setCitas(res.data.citas);
        }
      } catch (e) {
        console.error('Error al cargar citas:', e);
      } finally {
        setCargando(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalCitas = citas.length;
  const citasPendientes = citas.filter((c) => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA').length;
  const citasAtendidas = citas.filter((c) => c.estado === 'ATENDIDA').length;

  const estadoBadgeClass: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PROGRAMADA: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    CONFIRMADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    ATENDIDA: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-600' },
    CANCELADA: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  };

  return (
    <div className="space-y-6">
      
      {/* =================================================================== */}
      {/* HERO BANNER PRINCIPAL CON GRADIENTE MÉDICO Y FORMAS SUAVES         */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-teal-950 to-sky-950 p-6 sm:p-10 text-white shadow-xl border border-white/10">
        
        {/* Círculos de luz ambiental */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Rol Activo: {user?.rol}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Hola, {user?.nombreCompleto} 👋
            </h1>
            <p className="text-sm text-teal-200/80 mt-2 max-w-2xl leading-relaxed">
              Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico (ECE). Monitoreo en tiempo real bajo la norma ISO/IEC 25010.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA') && (
              <Link
                to="/citas"
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all duration-300 flex items-center gap-2 active:scale-95"
              >
                <Calendar className="h-4 w-4" />
                <span>Programar Cita</span>
                <ArrowUpRight className="h-4 w-4 opacity-70" />
              </Link>
            )}
            {user?.rol === 'MEDICO' && (
              <Link
                to="/expediente"
                className="px-5 py-3 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-500/30 transition-all duration-300 flex items-center gap-2 active:scale-95"
              >
                <HeartPulse className="h-4 w-4 animate-pulse" />
                <span>Atender Consultas</span>
                <ArrowUpRight className="h-4 w-4 opacity-70" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TARJETAS DE MÉTRICAS CON GRADIENTES VIBRANTES EN VERDE / CELESTE / AZUL */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Citas (Celeste / Azul) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Citas</span>
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{totalCitas}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-sky-600 font-bold">●</span> Registradas en el sistema
          </p>
        </div>

        {/* Citas Pendientes (Ámbar / Naranja) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Por Atender</span>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2 tracking-tight">{citasPendientes}</div>
          <p className="text-xs text-amber-700/80 mt-1 font-medium">
            Programadas / Confirmadas
          </p>
        </div>

        {/* Citas Atendidas (Verde Esmeralda) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendidas</span>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">{citasAtendidas}</div>
          <p className="text-xs text-emerald-700/80 mt-1 font-medium">
            Con historia clínica y ECE
          </p>
        </div>

        {/* Criterio SQA (Verde Azulado / Teal) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calidad SQA</span>
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-600 mt-2 tracking-tight">100%</div>
          <p className="text-xs text-teal-700/80 mt-1 font-medium">
            Norma ISO/IEC 25010
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TABLA MODERNA DE AGENDA INMEDIATA                                   */}
      {/* =================================================================== */}
      <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-sm overflow-hidden">
        
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Agenda Inmediata de Consultas
              </h2>
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Turnos activos y seguimiento de atención clínica</p>
          </div>
          <Link
            to="/citas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/60 px-3.5 py-2 rounded-xl transition-colors"
          >
            <span>Ver Agenda Completa</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-sm text-slate-400">Cargando agenda...</div>
        ) : citas.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            No hay citas registradas por el momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Médico Asignado</th>
                  <th className="px-6 py-4">Sede / Servicio</th>
                  <th className="px-6 py-4">Horario</th>
                  <th className="px-6 py-4">Duración</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.slice(0, 5).map((c) => {
                  const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {c.paciente_nombre}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{c.motivo}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {c.profesional_nombre}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{c.servicio_nombre}</div>
                        <div className="text-xs text-slate-400">{c.sede_nombre}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {new Date(c.fecha_inicio).toLocaleString('es-GT', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                        {c.duracion_minutos} min
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {c.estado}
                        </span>
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
