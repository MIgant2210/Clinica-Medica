import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RolUsuario } from '../types';
import { 
  Activity, Lock, Mail, ShieldCheck, ArrowRight, UserCheck, 
  HeartPulse, Stethoscope, Dna, Pill, Sparkles
} from 'lucide-react';

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
    <div className="relative min-h-screen bg-slate-950 overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* ===================================================================== */}
      {/* FONDO ANIMADO MÉDICO: ORBES DE LUZ, LÍNEAS ECG Y ELEMENTOS FLOTANTES  */}
      {/* ===================================================================== */}
      
      {/* Orbes de luz ambiental (Verde Esmeralda, Celeste, Azul Marino) */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-500/20 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-500/25 blur-[150px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[35%] right-[25%] w-[450px] h-[450px] rounded-full bg-teal-400/15 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-600/20 blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />

      {/* Malla médica de fondo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Onda de Electrocardiograma (ECG) Animada en el Fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
        <svg className="w-full h-48 stroke-emerald-400/60" fill="none" viewBox="0 0 1200 150">
          <path
            className="ecg-line"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0,75 L250,75 L270,75 L280,45 L290,110 L305,20 L320,135 L335,70 L345,85 L360,75 L600,75 L620,75 L630,45 L640,110 L655,20 L670,135 L685,70 L695,85 L710,75 L950,75 L970,75 L980,45 L990,110 L1005,20 L1020,135 L1035,70 L1045,85 L1060,75 L1200,75"
          />
        </svg>
      </div>

      {/* Íconos Médicos Flotantes 3D en el Fondo */}
      <div className="absolute top-[12%] left-[12%] text-emerald-400/30 animate-float pointer-events-none">
        <HeartPulse className="h-16 w-16 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
      </div>
      <div className="absolute bottom-[15%] left-[8%] text-teal-400/25 animate-float-reverse pointer-events-none">
        <Stethoscope className="h-20 w-20 drop-shadow-[0_0_25px_rgba(20,184,166,0.4)]" />
      </div>
      <div className="absolute top-[18%] right-[10%] text-sky-400/30 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
        <Dna className="h-20 w-20 drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]" />
      </div>
      <div className="absolute bottom-[12%] right-[14%] text-cyan-400/25 animate-float-reverse pointer-events-none" style={{ animationDelay: '2.5s' }}>
        <Pill className="h-14 w-14 rotate-45 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
      </div>

      {/* ===================================================================== */}
      {/* TARJETA PRINCIPAL DEL LOGIN (GLASSMORPHISM DE ALTO IMPACTO)           */}
      {/* ===================================================================== */}
      <div className="relative z-10 w-full max-w-5xl rounded-[32px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.6)] border border-white/20 backdrop-blur-2xl bg-slate-900/80 grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO INTERACTIVO (7 Cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between relative bg-gradient-to-b from-white/[0.04] to-transparent">
          
          <div>
            {/* Logo de la Clínica */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <Activity className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                  ClinicaMed
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    ECE v1.0
                  </span>
                </span>
                <span className="block text-xs font-semibold text-teal-300/80 tracking-wide uppercase">
                  Gestión Clínica Integrada • UMG SQA
                </span>
              </div>
            </div>

            {/* Título */}
            <div className="mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                Ingresa a la plataforma con tu cuenta autorizada para gestionar pacientes, citas y expedientes electrónicos.
              </p>
            </div>

            {/* Alerta de Error con Estilo Neón */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-2xl flex items-start gap-3 backdrop-blur-md animate-shake">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400 mt-1.5 shrink-0 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-teal-400 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ejemplo@redsalud.gt"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white/[0.1] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-teal-400 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white/[0.1] transition-all"
                  />
                </div>
              </div>

              {/* Botón Principal con Gradiente Médico */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-4 px-6 mt-2 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:via-teal-400 hover:to-sky-500 shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center justify-center gap-2.5 group disabled:opacity-50 active:scale-[0.99]"
              >
                {cargando ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando en el sistema...</span>
                  </div>
                ) : (
                  <>
                    <span>Acceder a la Plataforma</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer de Seguridad */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-teal-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Autenticación JWT & Cifrado pgcrypto</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Norma ISO/IEC 25010</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ACCESOS RÁPIDOS PARA EVALUADORES (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-sky-950/40 p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between backdrop-blur-xl relative">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-4 border border-teal-500/30">
              <UserCheck className="h-3.5 w-3.5" />
              Demostración 1-Clic
            </div>
            
            <h3 className="text-xl font-black text-white tracking-tight mb-2">
              Perfiles Preconfigurados
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Selecciona cualquier rol para ingresar automáticamente y verificar los permisos según la arquitectura RBAC:
            </p>

            {/* Tarjetas de Selección de Rol */}
            <div className="space-y-3">
              
              {/* Administrador */}
              <button
                type="button"
                onClick={() => handleQuick('ADMIN')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.04] hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40 transition-all duration-300 group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-purple-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                    Administrador General
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">admin@clinica.com</div>
                  <div className="text-[10px] text-purple-300/80 font-medium">Control total, configuraciones y bitácora SQA</div>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-400/60 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Médico */}
              <button
                type="button"
                onClick={() => handleQuick('MEDICO')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-emerald-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Dr. Carlos Mendoza (Médico)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">dr.mendoza@redsalud.gt</div>
                  <div className="text-[10px] text-emerald-300/80 font-medium">Atención médica, ECE, diagnósticos CIE-10 y recetas</div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-400/60 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Recepcionista */}
              <button
                type="button"
                onClick={() => handleQuick('RECEPCIONISTA')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.04] hover:bg-sky-500/15 border border-white/10 hover:border-sky-500/40 transition-all duration-300 group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-sky-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                    Ana Gómez (Recepción)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">recepcion@redsalud.gt</div>
                  <div className="text-[10px] text-sky-300/80 font-medium">Agendamiento, validación de turnos y alta de pacientes</div>
                </div>
                <ArrowRight className="h-4 w-4 text-sky-400/60 group-hover:text-sky-300 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Paciente */}
              <button
                type="button"
                onClick={() => handleQuick('PACIENTE')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.04] hover:bg-teal-500/15 border border-white/10 hover:border-teal-500/40 transition-all duration-300 group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-teal-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                    Juan Pérez (Paciente)
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">juan.perez@gmail.com</div>
                  <div className="text-[10px] text-teal-300/80 font-medium">Portal de citas y consulta de expediente personal</div>
                </div>
                <ArrowRight className="h-4 w-4 text-teal-400/60 group-hover:text-teal-300 group-hover:translate-x-1 transition-all" />
              </button>

            </div>
          </div>

          {/* Información Institucional */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] font-semibold text-slate-400">
              Universidad Mariano Gálvez de Guatemala
            </p>
            <p className="text-[10px] text-teal-400/80 font-mono mt-0.5">
              Ingeniería en Sistemas • Villa Nueva • SQA
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
