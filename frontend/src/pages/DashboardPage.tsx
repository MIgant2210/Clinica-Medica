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
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up">
      
      {/* 1. ENCABEZADO DE BIENVENIDA Y ACCIONES RÁPIDAS */}
      <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl shadow-sky-900/5 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex items-center gap-5 z-10">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0 transform transition-transform hover:scale-105">
            <Stethoscope className="h-8 w-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hola, {user?.nombreCompleto}
              </h1>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
                {user?.rol}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize mt-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {fechaHoy} &bull; Centro de Control Clínico
            </p>
          </div>
        </div>

        {/* Acciones Rápidas Reales */}
        <div className="relative flex flex-wrap items-center gap-3 z-10">
          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA' || user?.rol === 'MEDICO') && (
            <button
              onClick={() => navigate('/citas?nueva=true')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 hover:-translate-y-1 cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              <span>Programar Cita</span>
            </button>
          )}

          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA') && (
            <button
              onClick={() => navigate('/pacientes?nuevo=true')}
              className="px-5 py-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-white/60 dark:border-white/10 hover:-translate-y-1 shadow-sm cursor-pointer backdrop-blur-md"
            >
              <UserPlus className="h-4 w-4 text-teal-500" />
              <span>Nuevo Paciente</span>
            </button>
          )}

          {user?.rol === 'MEDICO' && (
            <button
              onClick={() => navigate('/expediente')}
              className="px-5 py-3 bg-teal-50/50 dark:bg-teal-900/30 hover:bg-teal-100/80 text-teal-800 dark:text-teal-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-teal-200/50 dark:border-teal-800/50 hover:-translate-y-1 shadow-sm cursor-pointer backdrop-blur-md"
            >
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Ver Expediente ECE</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. BENTO BOX GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Citas */}
        <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-400/20 to-transparent rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <Calendar className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <Activity className="h-3 w-3 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Global</span>
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                {totalCitas}
              </div>
              <div className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-wider">
                Total Turnos
              </div>
            </div>
            <div className="h-8 w-16 bg-gradient-to-t from-sky-500/10 to-transparent rounded-t-md border-b-2 border-sky-400" />
          </div>
        </div>

        {/* Citas Pendientes */}
        <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Activas</span>
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                {citasPendientes}
              </div>
              <div className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-wider">
                En Espera
              </div>
            </div>
            <div className="h-6 w-16 bg-gradient-to-t from-amber-500/10 to-transparent rounded-t-md border-b-2 border-amber-400" />
          </div>
        </div>

        {/* Citas Atendidas */}
        <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">ECE</span>
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                {citasAtendidas}
              </div>
              <div className="text-[10px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-wider">
                Completadas
              </div>
            </div>
            <div className="h-10 w-16 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-t-md border-b-2 border-emerald-400" />
          </div>
        </div>

        {/* Pacientes Registrados */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 p-5 rounded-3xl border border-teal-400/50 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none transform translate-x-10 -translate-y-10" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-md shadow-inner">
              <Users className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-lg backdrop-blur-md border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-200 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-teal-50">Red</span>
            </div>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <div className="text-3xl font-black text-white tracking-tighter drop-shadow-md">
                {totalPacientes}
              </div>
              <div className="text-[10px] font-extrabold text-teal-100 mt-0.5 uppercase tracking-wider">
                Pacientes Activos
              </div>
            </div>
            <div className="flex gap-1 items-end h-8">
              <div className="w-1.5 h-3 bg-white/40 rounded-t-sm" />
              <div className="w-1.5 h-5 bg-white/60 rounded-t-sm" />
              <div className="w-1.5 h-8 bg-white rounded-t-sm shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. AGENDA DE CONSULTAS: BENTO LIST */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden transition-colors">
        
        {/* Barra superior de la tabla */}
        <div className="p-6 sm:p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Agenda del Día
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 ml-13">
              Monitoreo en tiempo real de los turnos programados
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Buscador de la tabla */}
            <div className="relative group">
              <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por paciente, DPI..."
                className="pl-11 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border-2 border-white/80 dark:border-slate-700/80 rounded-2xl text-sm font-semibold text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 shadow-sm w-full sm:w-64 transition-all"
              />
            </div>

            <Link
              to="/citas"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl transition-transform hover:-translate-y-0.5 shadow-md"
            >
              <span>Ver Todo</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Pestañas de Filtro por Estado estilo píldora */}
        <div className="px-6 sm:px-8 py-4 flex flex-wrap items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filtros
          </span>
          {(['TODAS', 'PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                filtroEstado === estado
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transform scale-105'
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {estado === 'TODAS' ? 'Mostrar Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Contenido de la Tabla / Lista */}
        {cargando ? (
          <div className="p-16 text-center text-sm font-bold text-slate-400 animate-pulse">Sincronizando agenda...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-sm font-bold text-slate-500">No se encontraron citas con estos filtros.</span>
          </div>
        ) : (
          <div className="p-4 sm:p-6 grid grid-cols-1 gap-3">
            {citasFiltradas.slice(0, 8).map((c) => {
              const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
              return (
                <div
                  key={c.id}
                  className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/80 dark:border-slate-700/80 rounded-[1.5rem] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/expediente?pacienteId=${c.paciente_id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400 items-center justify-center font-bold text-lg border border-slate-100 dark:border-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/30 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {c.paciente_nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {c.paciente_nombre}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-1">
                        <span className="text-slate-700 dark:text-slate-300 font-bold">{c.profesional_nombre}</span>
                        &bull;
                        <span>{c.servicio_nombre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                    <div className="text-left md:text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {new Date(c.fecha_inicio).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {new Date(c.fecha_inicio).toLocaleDateString('es-GT', { month: 'short', day: 'numeric' })} &bull; {c.duracion_minutos} min
                      </div>
                    </div>
                    
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border ${style.bg} ${style.text} ${style.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`} />
                      {c.estado}
                    </span>
                    
                    <div className="hidden lg:flex h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
