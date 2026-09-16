import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RolUsuario } from '../types';
import { Activity, Lock, Mail, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const resultado = await login(correo, contrasena);
    setCargando(false);

    if (resultado.ok) {
      navigate('/');
    } else {
      setError(resultado.error || 'Error al iniciar sesión.');
    }
  };

  const handleQuick = async (rol: RolUsuario) => {
    await quickLogin(rol);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Columna Izquierda: Formulario de Login */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="h-10 w-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30">
                <Activity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight">ClinicaMed</span>
                <span className="block text-[10px] text-sky-600 font-bold uppercase tracking-wider">Gestión & ECE</span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Ingresa tus credenciales para acceder al sistema clínico.
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@redsalud.gt"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {cargando ? 'Autenticando...' : 'Acceder al Sistema'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Autenticación JWT • Cifrado de datos • RBAC</span>
          </div>
        </div>

        {/* Columna Derecha: Accesos Rápidos de Prueba (Ideal para Demostración Académica) */}
        <div className="bg-slate-50 p-8 sm:p-10 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-4">
              <UserCheck className="h-3.5 w-3.5" />
              Acceso Rápido para Evaluadores
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Pruebas de Roles (1-Clic)
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Haz clic en cualquiera de los perfiles preconfigurados para ingresar directamente y verificar el comportamiento de la plataforma:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleQuick('ADMIN')}
                className="w-full text-left p-3.5 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-purple-950">Administrador General</div>
                  <div className="text-xs text-slate-500 font-mono">admin@clinica.com • admin123</div>
                  <div className="text-[11px] text-purple-700 font-medium mt-0.5">Acceso total y módulo de auditoría SQA</div>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuick('MEDICO')}
                className="w-full text-left p-3.5 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-blue-950">Dr. Carlos Mendoza (Médico)</div>
                  <div className="text-xs text-slate-500 font-mono">dr.mendoza@redsalud.gt • medico123</div>
                  <div className="text-[11px] text-blue-700 font-medium mt-0.5">Atención de consultas, recetas y ECE</div>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuick('RECEPCIONISTA')}
                className="w-full text-left p-3.5 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-emerald-950">Ana Gómez (Recepción)</div>
                  <div className="text-xs text-slate-500 font-mono">recepcion@redsalud.gt • recep123</div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Agendamiento de citas y alta de pacientes</div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuick('PACIENTE')}
                className="w-full text-left p-3.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-amber-950">Juan Pérez (Paciente)</div>
                  <div className="text-xs text-slate-500 font-mono">juan.perez@gmail.com • paciente123</div>
                  <div className="text-[11px] text-amber-700 font-medium mt-0.5">Consulta de citas y su historial clínico</div>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-[11px] text-slate-400 text-center">
            Universidad Mariano Gálvez de Guatemala • Aseguramiento de Calidad
          </div>
        </div>

      </div>
    </div>
  );
};
