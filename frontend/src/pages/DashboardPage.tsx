import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita } from '../types';
import { 
  Calendar, Clock, AlertCircle, ArrowUpRight, CheckCircle2, 
  ShieldCheck, HeartPulse, Sparkles, Stethoscope, Activity, UserCheck
} from 'lucide-react';
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
    PROGRAMADA: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
    CONFIRMADA: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    ATENDIDA: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-600' },
    CANCELADA: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  };

  return (
    <div className="space-y-5">
      
      {/* =================================================================== */}
      {/* BANNER DE BIENVENIDA COMPACTO & ELEGANTE (SIN EMOJIS, CON ICONOS)   */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-sky-950 p-5 sm:p-6 text-white shadow-lg border border-white/10">
        
        {/* Luces sutiles de fondo */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Bienvenido, {user?.nombreCompleto}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <UserCheck className="h-3 w-3" />
                  {user?.rol}
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Expediente Clínico Electrónico &bull; Monitoreo en tiempo real bajo norma ISO/IEC 25010
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA') && (
              <Link
                to="/citas"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Programar Cita</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            )}
            {user?.rol === 'MEDICO' && (
              <Link
                to="/expediente"
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <HeartPulse className="h-3.5 w-3.5 animate-pulse" />
                <span>Atender Consultas</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* TARJETAS DE MÉTRICAS VIBRANTES CON ADAPTACIÓN CLARO/OSCURO          */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Citas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Citas</span>
            <div className="h-11 w-11 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{totalCitas}</div>
          <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-semibold mt-1">
            <Activity className="h-3.5 w-3.5" />
            <span>Registradas en el sistema</span>
          </div>
        </div>

        {/* Citas Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Por Atender</span>
            <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 tracking-tight">{citasPendientes}</div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400/90 font-semibold mt-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Programadas / Confirmadas</span>
          </div>
        </div>

        {/* Citas Atendidas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendidas</span>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">{citasAtendidas}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400/90 font-semibold mt-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Con historia clínica en ECE</span>
          </div>
        </div>

        {/* Calidad SQA */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calidad SQA</span>
            <div className="h-11 w-11 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2 tracking-tight">100%</div>
          <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400/90 font-semibold mt-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Norma ISO/IEC 25010</span>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* AGENDA INMEDIATA: TABLA MODERNA LIMPIA                              */}
      {/* =================================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Agenda Inmediata de Consultas
              </h2>
              <p className="text-xs text-slate-400">Turnos activos y seguimiento de atención clínica</p>
            </div>
          </div>

          <Link
            to="/citas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100/60 px-3.5 py-1.5 rounded-xl transition-colors"
          >
            <span>Ver Agenda Completa</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {cargando ? (
          <div className="p-10 text-center text-sm text-slate-400">Cargando agenda...</div>
        ) : citas.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-7 w-7 text-slate-300" />
            No hay citas registradas por el momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Médico Asignado</th>
                  <th className="px-6 py-3.5">Sede / Servicio</th>
                  <th className="px-6 py-3.5">Horario</th>
                  <th className="px-6 py-3.5">Duración</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {citas.slice(0, 5).map((c) => {
                  const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {c.paciente_nombre}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{c.motivo}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {c.profesional_nombre}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.servicio_nombre}</div>
                        <div className="text-xs text-slate-400">{c.sede_nombre}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {new Date(c.fecha_inicio).toLocaleString('es-GT', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
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
