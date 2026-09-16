import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RolUsuario } from '../types';
import { LogOut, Activity, UserCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();

  const handleSwitchRole = (rol: RolUsuario) => {
    quickLogin(rol);
  };

  const badgeColorByRol: Record<RolUsuario, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    MEDICO: 'bg-blue-100 text-blue-800 border-blue-200',
    RECEPCIONISTA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PACIENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      {/* Brand & Título */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
          <Activity className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none">
            Clínica Médica
          </h1>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Sistema Integrado & Expediente Clínico (ECE) • UMG SQA
          </p>
        </div>
      </div>

      {/* Selector Rápido de Rol (Para Pruebas y Presentación Académica) */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg border border-slate-200 text-xs">
        <span className="text-slate-500 px-2 font-semibold uppercase tracking-wider text-[10px]">
          Simular Rol:
        </span>
        {(['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'] as RolUsuario[]).map((rol) => (
          <button
            key={rol}
            onClick={() => handleSwitchRole(rol)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              user?.rol === rol
                ? 'bg-white text-sky-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {rol}
          </button>
        ))}
      </div>

      {/* Perfil del Usuario & Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {user.nombreCompleto}
              </div>
              <span
                className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  badgeColorByRol[user.rol] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {user.rol}
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <UserCircle className="h-6 w-6" />
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
