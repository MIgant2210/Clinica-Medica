import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLayout } from '../context/LayoutContext';
import { RolUsuario } from '../types';
import { 
  LogOut, UserCircle, Sun, Moon, Menu, Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toggleMobileOpen } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const titlesByPath: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Panel General', subtitle: 'Centro de Control Clínico' },
    '/citas': { title: 'Agenda y Citas', subtitle: 'Programación de Consultas' },
    '/pacientes': { title: 'Directorio de Pacientes', subtitle: 'Gestión de Fichas Médicas' },
    '/expediente': { title: 'Expediente Clínico Electrónico', subtitle: 'Historia y Atenciones ECE' },
    '/auditoria': { title: 'Bitácora de Auditoría', subtitle: 'Trazabilidad ISO/IEC 25010' },
  };

  const currentSection = titlesByPath[location.pathname] || {
    title: 'ClinicMed',
    subtitle: 'Plataforma Clínica',
  };

  const badgeColorByRol: Record<RolUsuario, { bg: string; text: string; border: string; dot: string }> = {
    ADMIN: { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
    MEDICO: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    RECEPCIONISTA: { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
    PACIENTE: { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-500' },
  };

  const roleStyle = user ? badgeColorByRol[user.rol] : badgeColorByRol.ADMIN;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminoBusqueda.trim()) return;
    navigate(`/pacientes?q=${encodeURIComponent(terminoBusqueda.trim())}`);
  };

  return (
    <header className="h-[60px] flex-shrink-0 bg-gradient-to-r from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all duration-300 mx-1 mt-1">
      
      {/* 1. Menú Móvil + Título de Sección */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            {currentSection.title}
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            {currentSection.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Buscador Rápido Global (Centro en desktop) */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-4"
      >
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar paciente o DPI..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
        </div>
      </form>

      {/* 3. Acciones Derecha: Selector de Rol, Modo Claro/Oscuro, Usuario */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Selector de Simulación de Rol */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <span className="text-[10px] font-bold text-slate-400 px-1.5 uppercase">Rol:</span>
          {(['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'] as RolUsuario[]).map((rol) => (
            <button
              key={rol}
              onClick={() => quickLogin(rol)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                user?.rol === rol
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {rol === 'RECEPCIONISTA' ? 'Recep' : rol.charAt(0) + rol.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Selector Visual de Tema: Claro / Oscuro */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Activar Modo Claro"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Claro</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Activar Modo Oscuro"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-750 dark:bg-slate-700 text-amber-300 shadow-sm border border-slate-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-sky-300' : ''}`} />
            <span className="hidden sm:inline">Oscuro</span>
          </button>
        </div>

        {/* Usuario Autenticado */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {user.nombreCompleto}
              </div>
              <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                <span className={`h-1 w-1 rounded-full ${roleStyle.dot}`} />
                {user.rol}
              </span>
            </div>

            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-100 to-teal-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold shadow-sm">
              <UserCircle className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          title="Cerrar Sesión"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
        >
          <LogOut className="h-4 w-4" />
        </button>

      </div>

    </header>
  );
};
