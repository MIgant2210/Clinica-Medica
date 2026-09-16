import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RolUsuario } from '../types';
import { LogOut, Activity, UserCircle, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();

  const handleSwitchRole = (rol: RolUsuario) => {
    quickLogin(rol);
  };

  const badgeColorByRol: Record<RolUsuario, { bg: string; text: string; border: string; dot: string }> = {
    ADMIN: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    MEDICO: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    RECEPCIONISTA: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    PACIENTE: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  };

  const roleStyle = user ? badgeColorByRol[user.rol] : badgeColorByRol.ADMIN;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      
      {/* Brand & Título con Cruz Médica Gradiente */}
      <div className="flex items-center gap-3.5">
        <div className="relative group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 bg-clip-text text-transparent tracking-tight leading-none">
              ClinicaMed
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-800 border border-teal-200/60">
              <Sparkles className="h-2.5 w-2.5 text-teal-600" />
              ECE Online
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Sistema Integrado & Expediente Clínico • UMG SQA
          </p>
        </div>
      </div>

      {/* Selector Rápido de Rol (Para Demostración Universitaria) */}
      <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 text-xs shadow-inner">
        <span className="text-slate-400 px-2 font-bold uppercase tracking-wider text-[10px]">
          Simular:
        </span>
        {(['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'] as RolUsuario[]).map((rol) => (
          <button
            key={rol}
            onClick={() => handleSwitchRole(rol)}
            className={`px-3 py-1 rounded-xl font-semibold transition-all duration-200 ${
              user?.rol === rol
                ? 'bg-white text-teal-700 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
            }`}
          >
            {rol}
          </button>
        ))}
      </div>

      {/* Perfil del Usuario & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200/80">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800 leading-tight">
                {user.nombreCompleto}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot}`} />
                  {user.rol}
                </span>
              </div>
            </div>
            
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center text-teal-700 shadow-sm">
              <UserCircle className="h-6 w-6" />
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-2xl transition-all duration-200 border border-transparent hover:border-rose-200"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
