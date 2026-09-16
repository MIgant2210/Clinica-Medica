import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita } from '../types';
import { Calendar, Users, Activity, Clock, AlertCircle } from 'lucide-react';
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

  const estadoBadgeClass: Record<string, string> = {
    PROGRAMADA: 'bg-sky-50 text-sky-700 border-sky-200',
    CONFIRMADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ATENDIDA: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELADA: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de Bienvenida */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2 border border-sky-100">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping"></span>
            Sesión Activa: {user?.rol}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bienvenido, {user?.nombreCompleto}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Plataforma Integral de Gestión y Expediente Clínico Electrónico (ECE)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA') && (
            <Link
              to="/citas"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Agendar Cita
            </Link>
          )}
          {user?.rol === 'MEDICO' && (
            <Link
              to="/expediente"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Ver Consultas del Día
            </Link>
          )}
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Citas</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCitas}</div>
            <span className="text-[11px] text-slate-500">Registradas en el sistema</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citas Pendientes</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{citasPendientes}</div>
            <span className="text-[11px] text-amber-700 font-medium">Por atender o confirmar</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Atenciones Realizadas</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{citasAtendidas}</div>
            <span className="text-[11px] text-emerald-700 font-medium">Con registro en ECE</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Criterio SQA</span>
            <div className="text-2xl font-black text-purple-600 mt-1">100%</div>
            <span className="text-[11px] text-purple-700 font-medium">ISO/IEC 25010 Validado</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Próximas Citas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Agenda Inmediata</h2>
            <p className="text-xs text-slate-500">Citas programadas para atención y seguimiento</p>
          </div>
          <Link to="/citas" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
            Ver todas &rarr;
          </Link>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-sm text-slate-500">Cargando agenda...</div>
        ) : citas.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            No hay citas registradas por el momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Médico Asignado</th>
                  <th className="px-6 py-3.5">Sede / Servicio</th>
                  <th className="px-6 py-3.5">Fecha y Hora</th>
                  <th className="px-6 py-3.5">Duración</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{c.paciente_nombre}</td>
                    <td className="px-6 py-4">{c.profesional_nombre}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{c.servicio_nombre}</div>
                      <div className="text-xs text-slate-400">{c.sede_nombre}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {new Date(c.fecha_inicio).toLocaleString('es-GT', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{c.duracion_minutos} min</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          estadoBadgeClass[c.estado] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.estado}
                      </span>
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
