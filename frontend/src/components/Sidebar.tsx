import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Calendar, Users, FileText, ShieldAlert, HeartPulse } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Panel General',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'],
    },
    {
      to: '/citas',
      label: 'Agenda y Citas',
      icon: Calendar,
      roles: ['ADMIN', 'MEDICO', 'RECEPCIONISTA', 'PACIENTE'],
    },
    {
      to: '/pacientes',
      label: 'Pacientes',
      icon: Users,
      roles: ['ADMIN', 'RECEPCIONISTA', 'MEDICO'],
    },
    {
      to: '/expediente',
      label: 'Expediente Clínico (ECE)',
      icon: FileText,
      roles: ['ADMIN', 'MEDICO', 'PACIENTE'],
    },
    {
      to: '/auditoria',
      label: 'Auditoría SQA',
      icon: ShieldAlert,
      roles: ['ADMIN'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Información del módulo */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
          <HeartPulse className="h-4 w-4 animate-pulse" />
          <span>Gestión Clínica Integrada</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Arquitectura en 4 Capas • ISO/IEC 25010
        </p>
      </div>

      {/* Enlaces de Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Pie de menú */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        UMG Villa Nueva • Decimo Semestre<br />
        <span className="text-slate-400 font-mono text-[10px]">Aseguramiento de Calidad</span>
      </div>
    </aside>
  );
};
