import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita, Paciente } from '../types';
import { 
  Calendar, Clock, UserPlus, FileText, Activity, Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);

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

  const totalCitas = citas.length;
  const citasPendientes = citas.filter((c) => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA').length;
  const citasAtendidas = citas.filter((c) => c.estado === 'ATENDIDA').length;
  const totalPacientes = pacientes.length;

  const fechaHoy = new Date().toLocaleDateString('es-GT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (cargando) {
    return <div className="p-10 text-center animate-pulse text-slate-400 font-bold">Cargando tablero...</div>;
  }

  // --- COMPONENTES COMUNES ---
  const WelcomeHeader = () => (
    <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl shadow-sky-900/5 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex items-center gap-5 z-10">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
          <Stethoscope className="h-8 w-8 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hola, {user?.nombreCompleto}
            </h1>
            <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              {user?.rol}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize mt-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {fechaHoy} &bull; Panel de Control
          </p>
        </div>
      </div>
    </div>
  );

  const DashboardAdmin = () => (
    <div className="space-y-6">
      <WelcomeHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-xs font-black uppercase mb-2">Total Citas</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalCitas}</div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-xs font-black uppercase mb-2">Pacientes</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalPacientes}</div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-xs font-black uppercase mb-2">Atendidas</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{citasAtendidas}</div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-xs font-black uppercase mb-2">Pendientes</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{citasPendientes}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black mb-4">Agenda General</h2>
          <button onClick={() => navigate('/citas')} className="w-full py-3 bg-sky-50 dark:bg-sky-900/30 text-sky-600 font-bold rounded-xl text-sm">Ver Calendario Completo</button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black mb-4">Gestión de Usuarios</h2>
          <button onClick={() => navigate('/usuarios')} className="w-full py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-bold rounded-xl text-sm">Administrar Accesos</button>
        </div>
      </div>
    </div>
  );

  const DashboardMedico = () => {
    // Filtrar citas del médico de hoy o próximas
    const misCitas = citas.filter(c => c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA').slice(0, 5);

    return (
      <div className="space-y-6">
        <WelcomeHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2"><Calendar className="h-5 w-5 text-sky-500"/> Mis Próximas Consultas</h2>
            {misCitas.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-slate-500 text-sm font-bold">No tienes citas pendientes.</div>
            ) : (
              misCitas.map(c => (
                <div key={c.id} className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{c.paciente_nombre}</h3>
                      <p className="text-xs text-slate-500 font-mono">{new Date(c.fecha_inicio).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/expediente?pacienteId=${c.paciente_id}`)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                    Iniciar Atención
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2"><Activity className="h-5 w-5 text-teal-500"/> Acciones Rápidas</h2>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 space-y-3">
              <button onClick={() => navigate('/expediente')} className="w-full py-3 bg-teal-50 text-teal-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                <FileText className="h-4 w-4"/> Ir a Expedientes
              </button>
              <button onClick={() => navigate('/citas')} className="w-full py-3 bg-sky-50 text-sky-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4"/> Mi Agenda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardRecepcionista = () => (
    <div className="space-y-6">
      <WelcomeHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => navigate('/citas?nueva=true')} className="p-8 bg-sky-500 hover:bg-sky-600 text-white rounded-[2rem] shadow-lg transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between min-h-[160px]">
          <Calendar className="h-8 w-8 mb-4 opacity-80" />
          <div>
            <h3 className="text-2xl font-black">Agendar Cita</h3>
            <p className="text-sky-100 text-sm mt-1">Programar nueva atención médica</p>
          </div>
        </button>
        <button onClick={() => navigate('/pacientes?nuevo=true')} className="p-8 bg-teal-500 hover:bg-teal-600 text-white rounded-[2rem] shadow-lg transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between min-h-[160px]">
          <UserPlus className="h-8 w-8 mb-4 opacity-80" />
          <div>
            <h3 className="text-2xl font-black">Registrar Paciente</h3>
            <p className="text-teal-100 text-sm mt-1">Ingresar nuevo paciente al sistema</p>
          </div>
        </button>
      </div>
    </div>
  );

  const DashboardPaciente = () => (
    <div className="space-y-6">
      <WelcomeHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-xl font-black mb-4 text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="h-5 w-5 text-sky-500"/> Mis Citas Programadas</h2>
          <button onClick={() => navigate('/citas')} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm">Ver mi agenda</button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-xl font-black mb-4 text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-5 w-5 text-teal-500"/> Mi Historial Clínico</h2>
          <button onClick={() => navigate('/expediente')} className="w-full py-3 bg-teal-50 text-teal-700 font-bold rounded-xl text-sm">Consultar mi ECE</button>
        </div>
      </div>
    </div>
  );

  // Render condicional
  switch (user?.rol) {
    case 'ADMIN': return <DashboardAdmin />;
    case 'MEDICO': return <DashboardMedico />;
    case 'RECEPCIONISTA': return <DashboardRecepcionista />;
    case 'PACIENTE': return <DashboardPaciente />;
    default: return <DashboardAdmin />;
  }
};
