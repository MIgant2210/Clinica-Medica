import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita, Paciente } from '../types';
import { 
  Calendar, Clock, AlertCircle, ArrowUpRight, CheckCircle2, 
  Users, Stethoscope, Search, UserPlus, 
  FileText, Activity, Filter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros interactivos para la agenda del día
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA'>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setCargando(true);
      try {
        const [resCitas, resPacientes] = await Promise.all([
          apiClient.get('/citas'),
          apiClient.get('/pacientes'),
        ]);
        if (resCitas.data.ok) setCitas(resCitas.data.citas);
        if (resPacientes.data.ok) setPacientes(resPacientes.data.pacientes);
      } catch (e) {
        console.error('Error al cargar datos del dashboard:', e);
      } finally {
        setCargando(false);
      }
    };
    fetchDashboard();
  }, []);

  // Cálculos basados 100% en datos reales recibidos de la API
  const totalCitas = citas.length;
  const citasPendientes = citas.filter((c) => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA').length;
  const citasAtendidas = citas.filter((c) => c.estado === 'ATENDIDA').length;
  const totalPacientes = pacientes.length;

  // Filtrar citas según búsqueda y pestaña de estado
  const citasFiltradas = citas.filter((c) => {
    const coincideEstado = filtroEstado === 'TODAS' || c.estado === filtroEstado;
    const termino = busqueda.toLowerCase().trim();
    const coincideBusqueda = 
      !termino || 
      c.paciente_nombre.toLowerCase().includes(termino) ||
      c.profesional_nombre.toLowerCase().includes(termino) ||
      c.servicio_nombre.toLowerCase().includes(termino);
    return coincideEstado && coincideBusqueda;
  });

  const estadoBadgeClass: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PROGRAMADA: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
    CONFIRMADA: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    ATENDIDA: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-600' },
    CANCELADA: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  };

  // Fecha actual en formato amigable en español
  const fechaHoy = new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      
      {/* 1. ENCABEZADO DE BIENVENIDA Y ACCIONES RÁPIDAS */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <Stethoscope className="h-7 w-7 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Hola, {user?.nombreCompleto}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {user?.rol}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize mt-0.5">
              {fechaHoy} &bull; Centro de Control Clínico ClinicMed
            </p>
          </div>
        </div>

        {/* Acciones Rápidas Reales */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA' || user?.rol === 'MEDICO') && (
            <button
              onClick={() => navigate('/citas?nueva=true')}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              <span>Programar Cita</span>
            </button>
          )}

          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA') && (
            <button
              onClick={() => navigate('/pacientes?nuevo=true')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200/80 dark:border-slate-700 active:scale-95"
            >
              <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Nuevo Paciente</span>
            </button>
          )}

          {user?.rol === 'MEDICO' && (
            <button
              onClick={() => navigate('/expediente')}
              className="px-4 py-2.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-teal-200 dark:border-teal-800"
            >
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Ver Expediente ECE</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TARJETAS DE INDICADORES PRINCIPALES (DATOS 100% REALES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Citas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Citas</span>
            <div className="h-10 w-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {totalCitas}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <Activity className="h-3.5 w-3.5 text-sky-500" />
            <span>Turnos en historial</span>
          </div>
        </div>

        {/* Citas Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Citas Pendientes</span>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 tracking-tight">
            {citasPendientes}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400/90 mt-1">
            <span>Programadas y confirmadas</span>
          </div>
        </div>

        {/* Citas Atendidas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Citas Atendidas</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
            {citasAtendidas}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400/90 mt-1">
            <span>Consultas completadas en ECE</span>
          </div>
        </div>

        {/* Pacientes Registrados (Dato Real de la API) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pacientes Activos</span>
            <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2 tracking-tight">
            {totalPacientes}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400/90 mt-1">
            <span>Directorio de fichas activas</span>
          </div>
        </div>

      </div>

      {/* 3. AGENDA DE CONSULTAS: FILTRABLE, BUSCABLE Y RESPONSIVA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        
        {/* Barra superior de la tabla */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Agenda de Consultas Clínicas
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualización y seguimiento de turnos en tiempo real
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador de la tabla */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Filtrar por paciente, médico o servicio..."
                className="pl-8 pr-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
              />
            </div>

            <Link
              to="/citas"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/60 px-3.5 py-1.5 rounded-xl transition-colors border border-sky-200/60 dark:border-sky-800/60"
            >
              <span>Ver Agenda Completa</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Pestañas de Filtro por Estado */}
        <div className="px-5 sm:px-6 pt-3 pb-1 flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Estado:
          </span>
          {(['TODAS', 'PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                filtroEstado === estado
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Contenido de la Tabla / Lista */}
        {cargando ? (
          <div className="p-12 text-center text-sm text-slate-400">Cargando agenda de consultas...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <span>No se encontraron citas con los filtros seleccionados.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-xs uppercase text-slate-400 dark:text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Facultativo</th>
                  <th className="px-6 py-3.5">Sede / Servicio</th>
                  <th className="px-6 py-3.5">Horario</th>
                  <th className="px-6 py-3.5">Duración</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {citasFiltradas.slice(0, 8).map((c) => {
                  const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {c.paciente_nombre}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{c.motivo || 'Consulta médica general'}</div>
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
                          dateStyle: 'short',
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/expediente?pacienteId=${c.paciente_id}`)}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 font-semibold p-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors"
                          title="Ver Expediente de este Paciente"
                        >
                          Ver ECE
                        </button>
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
