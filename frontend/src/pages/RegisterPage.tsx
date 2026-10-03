import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Activity, Lock, Mail, ShieldCheck, ArrowRight, 
  HeartPulse, Stethoscope, Dna, Sun, Moon, 
  User, Phone, CreditCard, CheckCircle2, 
  AlertCircle, Check, X, Droplet
} from 'lucide-react';
import { DatosRegistroUsuario } from '../types';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect, SelectOption } from '../components/CustomSelect';

const opcionesSexo: SelectOption[] = [
  { value: 'MASCULINO', label: 'Masculino', badge: 'M' },
  { value: 'FEMENINO', label: 'Femenino', badge: 'F' },
  { value: 'OTRO', label: 'Otro / No especificado', badge: 'X' },
];

const opcionesTipoSangre: SelectOption[] = [
  { value: 'O+', label: 'O Positivo (O+)', badge: 'Universal' },
  { value: 'O-', label: 'O Negativo (O-)', badge: 'Donante' },
  { value: 'A+', label: 'A Positivo (A+)' },
  { value: 'A-', label: 'A Negativo (A-)' },
  { value: 'B+', label: 'B Positivo (B+)' },
  { value: 'B-', label: 'B Negativo (B-)' },
  { value: 'AB+', label: 'AB Positivo (AB+)', badge: 'Receptor' },
  { value: 'AB-', label: 'AB Negativo (AB-)' },
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<DatosRegistroUsuario>({
    nombre_completo: '',
    correo: '',
    contrasena: '',
    confirmar_contrasena: '',
    fecha_nacimiento: '',
    numero_documento: '',
    telefono: '',
    sexo: 'MASCULINO',
    tipo_sangre: 'O+',
    terminos_aceptados: false,
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [exitoMensaje, setExitoMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Cálculos en tiempo real de Calidad (SQA)
  const passwordStats = useMemo(() => {
    const p = formData.contrasena || '';
    const hasMin8 = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);

    let score = 0;
    if (hasMin8) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    return {
      hasMin8,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      score,
      porcentaje: Math.min(100, Math.round((score / 4) * 100)),
      coinciden: p.length > 0 && p === formData.confirmar_contrasena,
    };
  }, [formData.contrasena, formData.confirmar_contrasena]);

  // Cálculo en tiempo real de edad biográfica
  const edadCalculada = useMemo(() => {
    if (!formData.fecha_nacimiento) return null;
    const fecha = new Date(formData.fecha_nacimiento + 'T00:00:00');
    const hoy = new Date();
    if (isNaN(fecha.getTime())) return null;

    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }, [formData.fecha_nacimiento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpiar error del campo específico si el usuario lo modifica
    if (errores[name]) {
      setErrores(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral(null);
    setErrores({});

    // Validaciones preventivas de cliente (Client-Side SQA Quality Gate)
    const errs: Record<string, string> = {};

    if (!formData.nombre_completo.trim()) {
      errs.nombre_completo = 'El nombre completo es obligatorio (QA-REQ-01).';
    } else if (formData.nombre_completo.trim().length < 3) {
      errs.nombre_completo = 'El nombre debe tener al menos 3 caracteres (QA-BVA-MIN).';
    }

    if (!formData.correo.trim()) {
      errs.correo = 'El correo electrónico es obligatorio (QA-REQ-02).';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
      errs.correo = 'Formato de correo no válido según norma RFC 5322 (QA-SYN-01).';
    }

    if (!formData.contrasena) {
      errs.contrasena = 'La contraseña es obligatoria (QA-REQ-03).';
    } else if (formData.contrasena.length < 8) {
      errs.contrasena = 'La contraseña debe tener mínimo 8 caracteres (QA-BVA-MIN8).';
    } else if (!/[A-Z]/.test(formData.contrasena) || !/[a-z]/.test(formData.contrasena) || !/[0-9]/.test(formData.contrasena)) {
      errs.contrasena = 'Debe contener mayúscula, minúscula y número (QA-SEC-01).';
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      errs.confirmar_contrasena = 'Las contraseñas no coinciden (QA-INT-01).';
    }

    if (!formData.fecha_nacimiento) {
      errs.fecha_nacimiento = 'La fecha de nacimiento es obligatoria (QA-REQ-05).';
    } else if (edadCalculada !== null && (edadCalculada < 0 || edadCalculada > 120)) {
      errs.fecha_nacimiento = 'Fecha biográficamente inconsistente (QA-BVA-AGE).';
    }

    if (formData.numero_documento && formData.numero_documento.replace(/\D/g, '').length !== 13 && formData.numero_documento.trim().length < 6) {
      errs.numero_documento = 'El DPI guatemalteco debe tener 13 dígitos numéricos (QA-DOM-DPI).';
    }

    if (!formData.terminos_aceptados) {
      errs.terminos_aceptados = 'Debes aceptar los términos y consentimiento de datos de salud (QA-LEG-01).';
    }

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      setErrorGeneral('Por favor revisa los campos señalados con inconsistencias de calidad.');
      return;
    }

    setCargando(true);
    const res = await register(formData);
    setCargando(false);

    if (res.ok) {
      setExitoMensaje(res.mensaje || '¡Cuenta de paciente creada exitosamente!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setErrorGeneral(res.error || 'Ocurrió un error al procesar el registro.');
      if (res.errors) {
        setErrores(res.errors);
      }
    }
  };

  return (
    <div className={`relative min-h-screen overflow-x-hidden flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-gradient-to-br from-white via-sky-50 to-white text-slate-800'
    }`}>
      
      {/* Selector de Modo Claro / Oscuro */}
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

      {/* Orbes Luminosos Dinámicos de Fondo */}
      <div className={`absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-400/40'
      }`} />
      <div className={`absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-sky-500/25' : 'bg-sky-400/45'
      }`} style={{ animationDelay: '2s' }} />
      <div className={`absolute top-[40%] right-[10%] w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none animate-pulse-glow ${
        theme === 'dark' ? 'bg-teal-400/20' : 'bg-teal-300/40'
      }`} style={{ animationDelay: '1s' }} />

      {/* Íconos Flotantes Decorativos */}
      <div className={`absolute top-[8%] left-[6%] animate-float pointer-events-none hidden xl:block ${
        theme === 'dark' ? 'text-rose-500/30' : 'text-rose-500/60'
      }`}>
        <HeartPulse className="h-16 w-16" />
      </div>
      <div className={`absolute bottom-[10%] left-[5%] animate-float-reverse pointer-events-none hidden xl:block ${
        theme === 'dark' ? 'text-teal-400/30' : 'text-teal-600/60'
      }`}>
        <Stethoscope className="h-18 w-18" />
      </div>
      <div className={`absolute top-[12%] right-[6%] animate-float pointer-events-none hidden xl:block ${
        theme === 'dark' ? 'text-sky-400/30' : 'text-sky-600/60'
      }`} style={{ animationDelay: '1.5s' }}>
        <Dna className="h-18 w-18" />
      </div>

      {/* Contenedor Principal de la Tarjeta */}
      <div className="relative z-10 w-full max-w-3xl my-6">
        <div className={`rounded-3xl p-6 sm:p-10 border backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-900/85 border-white/10 shadow-black/60' 
            : 'bg-white/95 border-emerald-100/80 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)]'
        }`}>

          {/* Cabecera del Módulo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white shadow-lg shadow-teal-500/25 mb-4">
              <Activity className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Registro de Nuevo Paciente
              </h1>
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                ECE
              </span>
            </div>

            <p className={`text-sm max-w-lg mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Crea tu cuenta oficial en ClinicMed para agendar consultas, acceder a tus fichas médicas y gestionar tu expediente electrónico.
            </p>

            {/* Badge de Verificación SQA ISO/IEC 25010 */}
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-[11px] font-bold text-sky-700 dark:text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
              <span>Validaciones de Calidad ISO/IEC 25010 &bull; UMG Villa Nueva</span>
            </div>
          </div>

          {/* Alertas Globales */}
          {errorGeneral && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-shake font-medium">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error en el proceso de registro</p>
                <p className="text-xs mt-0.5">{errorGeneral}</p>
              </div>
            </div>
          )}

          {exitoMensaje && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3 animate-bounce font-medium">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold">¡Registro Exitoso!</p>
                <p className="text-xs">{exitoMensaje} Redirigiendo al panel clínico...</p>
              </div>
            </div>
          )}

          {/* Formulario Estructurado */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Información Personal y Clínica
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nombre Completo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="nombre_completo"
                      required
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      placeholder="Ej. Carmen Lucía Morales Estrada"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                      } ${errores.nombre_completo ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                    />
                  </div>
                  {errores.nombre_completo && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.nombre_completo}</p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                {/* Fecha de Nacimiento con Calendario Personalizado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Fecha de Nacimiento <span className="text-rose-500">*</span>
                    </label>
                    {edadCalculada !== null && edadCalculada >= 0 && (
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                        {edadCalculada} {edadCalculada === 1 ? 'año' : 'años'}
                      </span>
                    )}
                  </div>
                  <CustomDatePicker
                    value={formData.fecha_nacimiento}
                    onChange={(date) => {
                      setFormData((prev) => ({ ...prev, fecha_nacimiento: date }));
                      if (errores.fecha_nacimiento) {
                        setErrores((prev) => {
                          const copy = { ...prev };
                          delete copy.fecha_nacimiento;
                          return copy;
                        });
                      }
                    }}
                    maxDate={new Date().toISOString().split('T')[0]}
                    placeholder="Selecciona tu fecha de nacimiento"
                  />
                  {errores.fecha_nacimiento && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.fecha_nacimiento}</p>
                  )}
                </div>

                {/* DPI / Documento */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    DPI / Documento de Identificación
                  </label>
                  <div className="relative">
                    <CreditCard className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="numero_documento"
                      maxLength={15}
                      value={formData.numero_documento}
                      onChange={handleChange}
                      placeholder="13 dígitos (ej. 2837192830101)"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                      } ${errores.numero_documento ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                    />
                  </div>
                  {errores.numero_documento && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.numero_documento}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Teléfono de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej. 5544-3322"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                      } ${errores.telefono ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                    />
                  </div>
                  {errores.telefono && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.telefono}</p>
                  )}
                </div>

                {/* Sexo y Tipo de Sangre con Listas Personalizadas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      Sexo Biológico
                    </label>
                    <CustomSelect
                      value={formData.sexo || 'MASCULINO'}
                      onChange={(val) => setFormData((prev) => ({ ...prev, sexo: val as any }))}
                      options={opcionesSexo}
                      placeholder="Seleccionar sexo"
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                      Tipo de Sangre
                    </label>
                    <CustomSelect
                      value={formData.tipo_sangre || 'O+'}
                      onChange={(val) => setFormData((prev) => ({ ...prev, tipo_sangre: val }))}
                      options={opcionesTipoSangre}
                      placeholder="Tipo de sangre"
                      icon={<Droplet className="h-4 w-4 text-rose-500" />}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SECCIÓN 2: SEGURIDAD Y ACCESO */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Credenciales y Seguridad de la Cuenta
                </h2>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="correo"
                    required
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="tucorreo@dominio.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500' 
                        : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                    } ${errores.correo ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                  />
                </div>
                {errores.correo && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.correo}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contraseña */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="contrasena"
                      required
                      value={formData.contrasena}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                      } ${errores.contrasena ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                    />
                  </div>
                  {errores.contrasena && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.contrasena}</p>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirmar Contraseña <span className="text-rose-500">*</span>
                    </label>
                    {formData.confirmar_contrasena && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        passwordStats.coinciden ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {passwordStats.coinciden ? (
                          <>
                            <Check className="h-3 w-3 stroke-[3]" /> Coinciden
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 stroke-[3]" /> No coinciden
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmar_contrasena"
                      required
                      value={formData.confirmar_contrasena}
                      onChange={handleChange}
                      placeholder="Repite la contraseña"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-teal-500' 
                          : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                      } ${errores.confirmar_contrasena ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
                    />
                  </div>
                  {errores.confirmar_contrasena && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errores.confirmar_contrasena}</p>
                  )}
                </div>

              </div>

              {/* Medidor Visual de Seguridad de Contraseña (QA) */}
              {formData.contrasena && (
                <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Robustez de Contraseña:</span>
                    <span className={`font-bold ${
                      passwordStats.score <= 1 ? 'text-rose-500' :
                      passwordStats.score === 2 ? 'text-amber-500' :
                      passwordStats.score === 3 ? 'text-sky-500' : 'text-emerald-500'
                    }`}>
                      {passwordStats.score <= 1 ? 'Débil' :
                       passwordStats.score === 2 ? 'Media' :
                       passwordStats.score === 3 ? 'Buena' : 'Excelente'}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        passwordStats.score <= 1 ? 'bg-rose-500' :
                        passwordStats.score === 2 ? 'bg-amber-500' :
                        passwordStats.score === 3 ? 'bg-sky-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${passwordStats.porcentaje}%` }}
                    />
                  </div>

                  {/* Lista de chequeo SQA */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <span className={`flex items-center gap-1 ${passwordStats.hasMin8 ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                      {passwordStats.hasMin8 ? <Check className="h-3 w-3 stroke-[3]" /> : '•'} 8+ Caracteres
                    </span>
                    <span className={`flex items-center gap-1 ${passwordStats.hasUpper ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                      {passwordStats.hasUpper ? <Check className="h-3 w-3 stroke-[3]" /> : '•'} 1 Mayúscula
                    </span>
                    <span className={`flex items-center gap-1 ${passwordStats.hasLower ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                      {passwordStats.hasLower ? <Check className="h-3 w-3 stroke-[3]" /> : '•'} 1 Minúscula
                    </span>
                    <span className={`flex items-center gap-1 ${passwordStats.hasNumber ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                      {passwordStats.hasNumber ? <Check className="h-3 w-3 stroke-[3]" /> : '•'} 1 Número
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* SECCIÓN 3: CONSENTIMIENTO Y TÉRMINOS */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="terminos_aceptados"
                  checked={formData.terminos_aceptados}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
                />
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Declaro que la información proporcionada es verídica y consiento la creación de mi <strong className="text-slate-800 dark:text-slate-200">Expediente Clínico Electrónico (ECE)</strong> bajo los estándares de privacidad y confidencialidad médica de la norma <strong className="text-teal-600 dark:text-teal-400">ISO/IEC 25010</strong>.
                </div>
              </label>
              {errores.terminos_aceptados && (
                <p className="text-[11px] text-rose-500 font-medium pl-1">{errores.terminos_aceptados}</p>
              )}
            </div>

            {/* BOTÓN DE ENVÍO */}
            <button
              type="submit"
              disabled={cargando || Boolean(exitoMensaje)}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:via-teal-400 hover:to-sky-500 shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {cargando ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validando y creando cuenta clínica...</span>
                </div>
              ) : (
                <>
                  <span>Registrar Cuenta y Generar Expediente ECE</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* ENLACE AL LOGIN */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ¿Ya cuentas con un usuario registrado?{' '}
                <Link 
                  to="/login" 
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>

          </form>

          {/* Pie institucional */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Garantía de Calidad SQA &bull; Hash Seguro Bcrypt &bull; Token JWT</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Universidad Mariano Gálvez de Guatemala &bull; Villa Nueva &bull; Ingeniería en Sistemas
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
