import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Users, FileText, ShieldAlert, HeartPulse, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Panel General',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'],
      badge: 'Vista Principal',
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
      badge: 'Clínico',
    },
    {
      to: '/auditoria',
      label: 'Auditoría SQA',
      icon: ShieldAlert,
      roles: ['ADMIN'],
      badge: 'ISO 25010',
    },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-white/5 select-none relative shadow-2xl">
      
      {/* Luz ambiental sutil en el fondo del sidebar */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Banner de Módulo */}
      <div className="p-5 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
          <HeartPulse className="h-4 w-4 animate-pulse text-emerald-400" />
          <span>Gestión Clínica Integrada</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-tight">
          Arquitectura por Capas &bull; ISO/IEC 25010
        </p>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto relative z-10">
        {navItems
          .filter((item) => user && item.roles.includes(user.rol))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>

      {/* Pie Institucional */}
      <div className="p-4 mx-3 mb-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 text-center relative z-10">
        <div className="flex items-center justify-center gap-1 text-teal-400 font-bold mb-0.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>UMG Villa Nueva</span>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">Aseguramiento de Calidad</span>
      </div>
    </aside>
  );
};
