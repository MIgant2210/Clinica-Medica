import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Calendar, Users, FileText, ShieldAlert, 
  Activity, ChevronLeft, ChevronRight, X, Sparkles, Sun, Moon
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useLayout();

  const navItems = [
    {
      to: '/',
      label: 'Panel General',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'],
      badge: 'Principal',
    },
    {
      to: '/citas',
      label: 'Agenda y Citas',
      icon: Calendar,
      roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'],
      badge: 'Turnos',
    },
    {
      to: '/pacientes',
      label: 'Pacientes',
      icon: Users,
      roles: ['ADMIN', 'RECEPCIONISTA', 'MEDICO'],
      badge: 'Directorio',
    },
    {
      to: '/expediente',
      label: 'Expediente (ECE)',
      icon: FileText,
      roles: ['ADMIN', 'MEDICO', 'PACIENTE'],
      badge: 'Historial',
    },
    {
      to: '/auditoria',
      label: 'Auditoría SQA',
      icon: ShieldAlert,
      roles: ['ADMIN'],
      badge: 'ISO 25010',
    },
  ];

  const allowedNavItems = navItems.filter((item) => user && item.roles.includes(user.rol));

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 select-none transition-all duration-300 shadow-sm">
      
      {/* 1. Cabecera y Logotipo */}
      <div>
        <div className={`p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                    ClinicMed
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    ECE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                  Gestión Clínica Integral
                </p>
              </div>
            )}
          </div>

          {/* Botón de cerrar solo en mobile */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Menú de Navegación */}
        <nav className="p-3 space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navegación Clínica
            </div>
          )}
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                  } rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && isActive && (
                      <span className="h-2 w-2 rounded-full bg-sky-500 shadow-sm" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 3. Pie de Barra Lateral y Botón de Colapso */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        {!isCollapsed ? (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
            <div className="flex items-center justify-center gap-1.5 font-bold text-teal-600 dark:text-teal-400 mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>UMG Villa Nueva</span>
            </div>
            <p className="text-[10px] text-slate-400">Norma ISO/IEC 25010</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Sistema Online" />
          </div>
        )}

        {/* Toggle de Modo Claro / Oscuro en Sidebar */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
          } rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-amber-300'
              : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700 hover:text-sky-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-sky-600" />
            )}
            {!isCollapsed && (
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </span>
          )}
        </button>

        {/* Botón de contraer/expandir para Desktop */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Contraer menú</span>
            </>
          )}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* 1. Sidebar para Pantallas Grandes (Desktop) */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Drawer para Móviles / Tablets con Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop con desenfoque */}
          <div
            onClick={closeMobile}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer deslizable */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
