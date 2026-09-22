import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Activity, Lock, Mail, ShieldCheck, ArrowRight, 
  HeartPulse, Stethoscope, Dna, Pill, Microscope, 
  Syringe, Sun, Moon, Zap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
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



  return (
    <div className={`relative min-h-screen overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-gradient-to-br from-white via-sky-50 to-white text-slate-800'
    }`}>
      
      {/* Selector de Modo Claro / Modo Oscuro en Login */}
      <div className="absolute top-6 right-6 z-30">
        <div className={`p-1 rounded-2xl border backdrop-blur-md flex items-center shadow-lg transition-all ${
          theme === 'dark' ? 'bg-slate-900/90 border-white/20' : 'bg-white/95 border-emerald-200/80 shadow-sky-500/10'
        }`}>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-sky-50 text-sky-700 shadow-sm font-extrabold border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-amber-500' : ''}`} />
            <span>Claro</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800 text-amber-300 shadow-sm font-extrabold border border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-sky-300' : ''}`} />
            <span>Oscuro</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FONDO MULTICOLOR: ORBES LUMINOSOS & ECG CARDÍACO DINÁMICO             */}
      {/* ===================================================================== */}
      <div className={`absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-400/40'
      }`} />
      <div className={`absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-sky-500/25' : 'bg-sky-400/45'
      }`} style={{ animationDelay: '2s' }} />
      <div className={`absolute top-[35%] right-[25%] w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-teal-400/20' : 'bg-teal-300/40'
      }`} style={{ animationDelay: '1s' }} />
      <div className={`absolute bottom-[20%] left-[20%] w-[400px] h-[400px] rounded-full blur-[130px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-400/40'
      }`} style={{ animationDelay: '3s' }} />

      {/* Malla médica de fondo interactiva */}
      <div className={`absolute inset-0 bg-[size:36px_36px] pointer-events-none ${
        theme === 'dark'
          ? 'bg-[linear-gradient(to_right,#0284c70d_1px,transparent_1px),linear-gradient(to_bottom,#10b9810d_1px,transparent_1px)]'
          : 'bg-[linear-gradient(to_right,#0284c720_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)]'
      }`} />

      {/* Onda ECG Continua en el Fondo */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden ${
        theme === 'dark' ? 'opacity-35' : 'opacity-60'
      }`}>
        <svg className={`w-full h-48 ${theme === 'dark' ? 'stroke-emerald-500/70' : 'stroke-emerald-600'}`} fill="none" viewBox="0 0 1200 150">
          <path
            className="ecg-line"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0,75 L250,75 L270,75 L280,40 L290,115 L305,15 L320,140 L335,65 L345,85 L360,75 L600,75 L620,75 L630,40 L640,115 L655,15 L670,140 L685,65 L695,85 L710,75 L950,75 L970,75 L980,40 L990,115 L1005,15 L1020,140 L1035,65 L1045,85 L1060,75 L1200,75"
          />
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* FIGURAS E ÍCONOS MÉDICOS FLOTANTES CON MOVIMIENTO EN TODA LA PANTALLA */}
      {/* ===================================================================== */}
      
      {/* Corazón con pulso */}
      <div className={`absolute top-[8%] left-[8%] animate-float pointer-events-none ${
        theme === 'dark' ? 'text-rose-500/35' : 'text-rose-500/75'
      }`}>
        <HeartPulse className="h-16 w-16 drop-shadow-[0_0_25px_rgba(244,63,94,0.5)]" />
      </div>

      {/* Estetoscopio */}
      <div className={`absolute bottom-[10%] left-[5%] animate-float-reverse pointer-events-none ${
        theme === 'dark' ? 'text-teal-400/35' : 'text-teal-600/70'
      }`}>
        <Stethoscope className="h-20 w-20 drop-shadow-[0_0_25px_rgba(20,184,166,0.4)]" />
      </div>

      {/* Cadena de ADN */}
      <div className={`absolute top-[12%] right-[8%] animate-float pointer-events-none ${
        theme === 'dark' ? 'text-sky-400/40' : 'text-sky-600/70'
      }`} style={{ animationDelay: '1.5s' }}>
        <Dna className="h-20 w-20 drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]" />
      </div>

      {/* Píldora / Cápsula */}
      <div className={`absolute bottom-[10%] right-[8%] animate-float-reverse pointer-events-none ${
        theme === 'dark' ? 'text-cyan-400/35' : 'text-cyan-600/70'
      }`} style={{ animationDelay: '2.5s' }}>
        <Pill className="h-16 w-16 rotate-45 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
      </div>

      {/* Microscopio (Nueva Figura) */}
      <div className={`absolute top-[48%] left-[3%] animate-float pointer-events-none ${
        theme === 'dark' ? 'text-emerald-400/30' : 'text-emerald-600/65'
      }`} style={{ animationDelay: '3s' }}>
        <Microscope className="h-16 w-16 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
      </div>

      {/* Jeringa Médica (Nueva Figura) */}
      <div className={`absolute top-[52%] right-[3%] animate-float-reverse pointer-events-none ${
        theme === 'dark' ? 'text-purple-400/30' : 'text-purple-600/65'
      }`} style={{ animationDelay: '4s' }}>
        <Syringe className="h-14 w-14 -rotate-45 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
      </div>

      {/* ===================================================================== */}
      {/* TARJETAS FLOTANTES DE TELEMETRÍA EN VIVO (EFECTO IMPACTO INNOVADOR)    */}
      {/* ===================================================================== */}
      
      {/* Widget Flotante 1: Monitor de Signos Vitales (Arriba Izquierda) */}
      <div className={`hidden xl:flex items-center gap-3 absolute top-16 left-16 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl animate-float pointer-events-none ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10' 
          : 'bg-white/95 border-emerald-300 text-emerald-950 shadow-md shadow-sky-500/10'
      }`}>
        <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Activity className="h-5 w-5 animate-pulse" />
        </div>
        <div className="text-left">
          <div className="text-xs font-black flex items-center gap-1.5">
            <span>Ritmo Cardíaco</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-[11px] font-mono opacity-80">76 BPM &bull; Rítmico Normal</div>
        </div>
      </div>

      {/* Widget Flotante 2: Seguridad y Cifrado (Abajo Izquierda) */}
      <div className={`hidden xl:flex items-center gap-3 absolute bottom-16 left-20 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl animate-float-reverse pointer-events-none ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-teal-500/30 text-teal-300 shadow-teal-500/10' 
          : 'bg-white/95 border-teal-300 text-teal-950 shadow-md shadow-teal-500/10'
      }`}>
        <div className="h-9 w-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-500 dark:text-teal-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-black">Cifrado de Expedientes</div>
          <div className="text-[11px] font-mono opacity-80">AES 256-Bit &bull; ISO 25010</div>
        </div>
      </div>

      {/* Widget Flotante 3: Alta Disponibilidad (Arriba Derecha) */}
      <div className={`hidden xl:flex items-center gap-3 absolute top-20 right-28 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl animate-float pointer-events-none ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-sky-500/30 text-sky-300 shadow-sky-500/10' 
          : 'bg-white/95 border-sky-300 text-sky-950 shadow-md shadow-sky-500/10'
      }`} style={{ animationDelay: '2s' }}>
        <div className="h-9 w-9 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400">
          <Zap className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-black">Disponibilidad en Red</div>
          <div className="text-[11px] font-mono opacity-80">Sedes Conectadas: 99.9%</div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TARJETA CENTRAL DE LOGIN                                              */}
      {/* ===================================================================== */}
      <div className={`relative z-10 w-full max-w-md mx-auto rounded-[36px] overflow-hidden border backdrop-blur-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900/85 border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 border-white shadow-[0_25px_70px_rgba(2,132,199,0.16),0_10px_30px_rgba(16,185,129,0.1)]'
      }`}>
        
        {/* FORMULARIO INTERACTIVO */}
        <div className="p-8 sm:p-12 flex flex-col justify-between relative">
          
          <div>
            {/* Logo de la Clínica */}
            <div className="flex items-center gap-3.5 mb-8 justify-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <Activity className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div className="text-left">
                <span className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  ClinicMed
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    ECE v1.0
                  </span>
                </span>
                <span className="block text-xs font-semibold text-teal-600 dark:text-teal-400 tracking-wide uppercase">
                  Gestión Clínica
                </span>
              </div>
            </div>

            {/* Título */}
            <div className="mb-6 text-center">
              <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Iniciar Sesión
              </h2>
              <p className={`text-sm mt-1.5 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Ingresa con tu cuenta para gestionar pacientes, citas y expedientes electrónicos.
              </p>
            </div>

            {/* Alerta de Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm rounded-2xl flex items-start gap-3 backdrop-blur-md animate-shake font-medium">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ejemplo@redsalud.gt"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium ${
                      theme === 'dark'
                        ? 'bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 focus:bg-white/[0.1]'
                        : 'bg-white border-2 border-slate-200/90 text-slate-900 placeholder-slate-400 focus:border-teal-500 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium ${
                      theme === 'dark'
                        ? 'bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 focus:bg-white/[0.1]'
                        : 'bg-white border-2 border-slate-200/90 text-slate-900 placeholder-slate-400 focus:border-teal-500 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full py-4 px-6 mt-2 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:via-teal-400 hover:to-sky-500 shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center justify-center gap-2.5 group disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                {cargando ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando...</span>
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
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 text-center">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Autenticación JWT & Cifrado AES</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Universidad Mariano Gálvez de Guatemala <br/>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                Ingeniería en Sistemas &bull; Villa Nueva &bull; SQA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
