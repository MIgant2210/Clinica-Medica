import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, Clock, Activity, CheckCircle2, 
  Search, Plus, X, HeartPulse, User, Tv, 
  Volume2, ShieldAlert, Check, Building, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente } from '../types';
import { DEFAULT_PACIENTES } from '../services/pacientesSeed';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { 
  getPacientesUrgencias, 
  guardarPacienteUrgencia, 
  actualizarEstadoUrgencia, 
  alternarLlamadoPaciente,
  PacienteUrgencia, 
  NivelTriaje, 
  EstadoUrgencia,
  NIVELES_TRIAJE_MAP 
} from '../services/urgenciasService';

export const UrgenciasPage: React.FC = () => {
  const { user } = useAuth();

  // Estados de datos
  const [pacientesUrgencias, setPacientesUrgencias] = useState<PacienteUrgencia[]>(() => getPacientesUrgencias());
  const [pacientesRegistrados, setPacientesRegistrados] = useState<Paciente[]>([]);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  // Modales y Vistas
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modoMonitorTV, setModoMonitorTV] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario Nuevo Triaje
  const [tipoPacienteIngreso, setTipoPacienteIngreso] = useState<'REGISTRADO' | 'EMERGENCIA_DIRECTA'>('REGISTRADO');
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState('');
  const [nombreManual, setNombreManual] = useState('');
  const [edadManual, setEdadManual] = useState('');
  const [generoManual, setGeneroManual] = useState('MASCULINO');
  const [documentoManual, setDocumentoManual] = useState('');
  const [motivoIngreso, setMotivoIngreso] = useState('');
  const [nivelTriajeSeleccionado, setNivelTriajeSeleccionado] = useState<NivelTriaje>('NIVEL_3_AMARILLO');
  const [boxAsignado, setBoxAsignado] = useState('Box 4 - Consulta Rápida');
  const [medicoAsignado, setMedicoAsignado] = useState('Dr. Alejandro Morales (Emergentólogo)');
  const [observaciones, setObservaciones] = useState('');

  // Signos vitales
  const [presion, setPresion] = useState('120/80');
  const [fc, setFc] = useState(80);
  const [temp, setTemp] = useState(36.8);
  const [spo2, setSpo2] = useState(98);
  const [glasgow, setGlasgow] = useState(15);
  const [dolor, setDolor] = useState(4);

  // Cargar lista de pacientes del backend para selector rápido con fallback
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await apiClient.get('/pacientes');
        const lista = res.data?.pacientes || res.data?.data || [];
        if (Array.isArray(lista) && lista.length > 0) {
          setPacientesRegistrados(lista);
        } else {
          setPacientesRegistrados(DEFAULT_PACIENTES);
        }
      } catch (err) {
        console.warn('Usando pacientes de contingencia para urgencias:', err);
        setPacientesRegistrados(DEFAULT_PACIENTES);
      }
    };
    cargar();
  }, []);

  // Paciente registrado actualmente seleccionado
  const pacienteRegistradoSeleccionado = useMemo(() => {
    return pacientesRegistrados.find(p => p.id === pacienteSeleccionadoId) || null;
  }, [pacientesRegistrados, pacienteSeleccionadoId]);

  // Opciones de pacientes registrados para CustomSelect
  const opcionesPacientesRegistrados: SelectOption[] = useMemo(() => {
    return pacientesRegistrados.map(p => ({
      value: p.id,
      label: p.nombre_completo,
      badge: p.codigo_paciente || 'PAC',
      description: `DPI: ${p.documento || 'S/D'} • Sangre: ${p.tipo_sangre || 'S/D'} • Tel: ${p.telefono || 'Sin tel.'}`
    }));
  }, [pacientesRegistrados]);

  // Opciones de niveles de triaje para CustomSelect
  const opcionesNivelTriaje: SelectOption[] = useMemo(() => {
    return (Object.keys(NIVELES_TRIAJE_MAP) as NivelTriaje[]).map(k => {
      const meta = NIVELES_TRIAJE_MAP[k];
      return {
        value: k,
        label: meta.nombre,
        badge: meta.tiempoMaxMinutos === 0 ? 'Inmediato (0 min)' : `< ${meta.tiempoMaxMinutos} min`,
        description: meta.descripcion
      };
    });
  }, []);

  // Opciones de boxes de urgencia para CustomSelect
  const opcionesBoxes: SelectOption[] = [
    { value: 'Box 1 - Shock Room', label: 'Box 1 - Shock Room', badge: 'Críticos / Paro', description: 'Equipado con soporte vital avanzado y desfibrilador' },
    { value: 'Box 2 - Reanimación', label: 'Box 2 - Reanimación', badge: 'Muy Urgente', description: 'Monitoreo multiparámetro y hemodinámico' },
    { value: 'Box 3 - Traumatología', label: 'Box 3 - Traumatología', badge: 'Suturas y Yesos', description: 'Para heridas, fracturas y lesiones osteoarticulares' },
    { value: 'Box 4 - Consulta Rápida', label: 'Box 4 - Consulta Rápida', badge: 'Estándar', description: 'Evaluación rápida de medicina de urgencia' },
    { value: 'Box 5 - Pediatría Urgencias', label: 'Box 5 - Pediatría Urgencias', badge: 'Lactantes/Niños', description: 'Ambiente pediátrico especializado' },
    { value: 'Box 6 - Observación', label: 'Box 6 - Observación', badge: 'Corta Estancia', description: 'Seguimiento de respuesta terapéutica y fluidoterapia' },
  ];

  // Opciones de género
  const opcionesGenero: SelectOption[] = [
    { value: 'MASCULINO', label: 'Masculino' },
    { value: 'FEMENINO', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro / No especificado' }
  ];

  // KPIs
  const totalPacientes = pacientesUrgencias.length;
  const pacientesCriticos = pacientesUrgencias.filter(p => p.nivel_triaje === 'NIVEL_1_ROJO' || p.nivel_triaje === 'NIVEL_2_NARANJA').length;
  const pacientesEnEspera = pacientesUrgencias.filter(p => p.estado === 'EN_ESPERA').length;
  const pacientesEnBox = pacientesUrgencias.filter(p => p.estado === 'EN_BOX').length;

  // Filtrado de pacientes
  const pacientesFiltrados = useMemo(() => {
    return pacientesUrgencias.filter(p => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto = !q || 
        p.paciente_nombre.toLowerCase().includes(q) || 
        p.codigo_urgencia.toLowerCase().includes(q) || 
        (p.documento && p.documento.toLowerCase().includes(q)) || 
        p.motivo_ingreso.toLowerCase().includes(q);

      const coincideNivel = filtroNivel === 'TODOS' || p.nivel_triaje === filtroNivel;
      const coincideEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;

      return coincideTexto && coincideNivel && coincideEstado;
    });
  }, [pacientesUrgencias, busqueda, filtroNivel, filtroEstado]);

  // Pacientes en espera ordenados por severidad y tiempo para el Monitor TV
  const pacientesMonitorTV = useMemo(() => {
    const ordenTriaje: Record<NivelTriaje, number> = {
      'NIVEL_1_ROJO': 1,
      'NIVEL_2_NARANJA': 2,
      'NIVEL_3_AMARILLO': 3,
      'NIVEL_4_VERDE': 4,
      'NIVEL_5_AZUL': 5,
    };
    return [...pacientesUrgencias]
      .filter(p => p.estado === 'EN_ESPERA' || p.llamado_activo)
      .sort((a, b) => {
        if (a.llamado_activo && !b.llamado_activo) return -1;
        if (!a.llamado_activo && b.llamado_activo) return 1;
        return (ordenTriaje[a.nivel_triaje] || 9) - (ordenTriaje[b.nivel_triaje] || 9);
      });
  }, [pacientesUrgencias]);

  // Paciente con llamado activo
  const pacienteLlamado = useMemo(() => {
    return pacientesUrgencias.find(p => p.llamado_activo) || null;
  }, [pacientesUrgencias]);

  // Handlers
  const handleCambiarEstado = (id: string, nuevoEstado: EstadoUrgencia, box?: string) => {
    const actualizados = actualizarEstadoUrgencia(id, nuevoEstado, box);
    setPacientesUrgencias(actualizados);
    setMensajeExito('Estado del paciente actualizado en el sistema de Urgencias.');
    setTimeout(() => setMensajeExito(null), 3500);
  };

  const handleLlamarPaciente = (id: string) => {
    const p = pacientesUrgencias.find(item => item.id === id);
    const activar = !p?.llamado_activo;
    const actualizados = alternarLlamadoPaciente(id, activar);
    setPacientesUrgencias(actualizados);
    if (activar) {
      setMensajeExito(`📢 Llamando a ${p?.paciente_nombre} al ${p?.box_asignado || 'Box de Atención'} en el monitor público.`);
    }
    setTimeout(() => setMensajeExito(null), 4000);
  };

  const handleCrearIngresoTriaje = (e: React.FormEvent) => {
    e.preventDefault();

    let nombre = '';
    let edad = '';
    let doc = '';
    let pacId: string | undefined = undefined;

    if (tipoPacienteIngreso === 'REGISTRADO') {
      const reg = pacientesRegistrados.find(p => p.id === pacienteSeleccionadoId);
      if (!reg) return;
      nombre = reg.nombre_completo;
      doc = reg.documento;
      pacId = reg.id;
      edad = reg.fecha_nacimiento ? `${new Date().getFullYear() - new Date(reg.fecha_nacimiento).getFullYear()} años` : 'Adulto';
    } else {
      if (!nombreManual.trim()) return;
      nombre = nombreManual.trim();
      edad = edadManual.trim() || 'No especificada';
      doc = documentoManual.trim() || 'Sin documento / Emergencia';
    }

    const nuevo: PacienteUrgencia = {
      id: `urg-${Date.now()}`,
      codigo_urgencia: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      paciente_id: pacId,
      paciente_nombre: nombre,
      edad: edad,
      genero: generoManual,
      documento: doc,
      motivo_ingreso: motivoIngreso.trim() || 'Urgencia no especificada',
      nivel_triaje: nivelTriajeSeleccionado,
      estado: nivelTriajeSeleccionado === 'NIVEL_1_ROJO' ? 'EN_BOX' : 'EN_ESPERA',
      box_asignado: boxAsignado,
      medico_asignado: medicoAsignado,
      fecha_ingreso: new Date().toISOString(),
      signos_vitales: {
        presion,
        frecuencia_cardiaca: Number(fc) || 80,
        temperatura: Number(temp) || 36.5,
        spo2: Number(spo2) || 98,
        glasgow: Number(glasgow) || 15,
        escala_dolor: Number(dolor) || 0
      },
      observaciones: observaciones.trim() || 'Evaluación de triaje completada.',
      tiempo_espera_max_min: NIVELES_TRIAJE_MAP[nivelTriajeSeleccionado].tiempoMaxMinutos,
      llamado_activo: false
    };

    const actualizados = guardarPacienteUrgencia(nuevo);
    setPacientesUrgencias(actualizados);
    setModalNuevoAbierto(false);
    setMensajeExito(`¡Paciente ${nuevo.paciente_nombre} ingresado y clasificado en Triaje con código ${nuevo.codigo_urgencia}!`);
    setTimeout(() => setMensajeExito(null), 4000);

    // Reset
    setNombreManual('');
    setMotivoIngreso('');
    setObservaciones('');
  };

  // Calcular tiempo transcurrido en minutos
  const calcularMinutosTranscurridos = (fechaIso: string) => {
    const diffMs = Date.now() - new Date(fechaIso).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // =========================================================================
  // VISTA ESPECIAL: MONITOR DE SALA DE ESPERA (MODO PANTALLA GIGANTE / TV)
  // =========================================================================
  if (modoMonitorTV) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col p-6 sm:p-10 select-none animate-in fade-in duration-300 overflow-hidden">
        
        {/* Cabecera del Monitor */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-lg shadow-rose-600/30">
              <HeartPulse className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>HOSPITAL GENERAL &bull; SALA DE URGENCIAS</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  MONITOR PÚBLICO
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Clasificación de Triaje Manchester &bull; Turnos y Llamado a Boxes en Vivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xl font-mono font-bold text-teal-400">
                {new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <p className="text-xs text-slate-500">Hora Hospitalaria</p>
            </div>
            <button
              onClick={() => setModoMonitorTV(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Salir del Monitor
            </button>
          </div>
        </div>

        {/* Zona Central: Llamado Activo Destacado */}
        {pacienteLlamado ? (
          <div className="my-6 p-8 bg-gradient-to-r from-teal-950/80 via-emerald-950/80 to-slate-900 border-2 border-teal-500/60 rounded-3xl shadow-2xl shadow-teal-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-teal-400 flex items-center justify-center md:justify-start gap-2">
                <Volume2 className="h-5 w-5 text-teal-400" />
                <span>LLAMANDO A BOX DE ATENCIÓN AHORA</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {pacienteLlamado.paciente_nombre}
              </h2>
              <p className="text-slate-300 text-sm">
                Turno: <span className="font-mono font-bold text-teal-300">{pacienteLlamado.codigo_urgencia}</span> &bull; Triaje: <span className="font-bold">{NIVELES_TRIAJE_MAP[pacienteLlamado.nivel_triaje].nombre}</span>
              </p>
            </div>

            <div className="p-6 bg-teal-500 text-slate-950 rounded-2xl text-center shrink-0 shadow-lg">
              <span className="text-xs uppercase font-black tracking-wider block">Diríjase Inmediatamente a:</span>
              <strong className="text-2xl sm:text-4xl font-black block mt-1">
                {pacienteLlamado.box_asignado || 'BOX DE ATENCIÓN'}
              </strong>
            </div>
          </div>
        ) : (
          <div className="my-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
            <span>Sala de espera operativa. Por favor permanezca atento a su llamado y monitor de box.</span>
          </div>
        )}

        {/* Cuadrícula de Turnos en Espera */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider px-2">
            <span>Turnos en Espera por Orden de Gravedad</span>
            <span>{pacientesMonitorTV.length} pacientes en cola</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pacientesMonitorTV.map(p => {
              const meta = NIVELES_TRIAJE_MAP[p.nivel_triaje];
              const minTranscurridos = calcularMinutosTranscurridos(p.fecha_ingreso);
              const excedido = meta.tiempoMaxMinutos > 0 && minTranscurridos > meta.tiempoMaxMinutos;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    p.llamado_activo
                      ? 'bg-teal-950/80 border-teal-400 ring-2 ring-teal-500/40'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-black text-slate-300">
                      {p.codigo_urgencia}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${meta.colorPill}`}>
                      {meta.codigo}
                    </span>
                  </div>

                  <strong className="text-base font-bold text-white block truncate">
                    {p.paciente_nombre}
                  </strong>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Destino: <span className="text-slate-200 font-semibold">{p.box_asignado}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Espera: {minTranscurridos} min</span>
                    {excedido && (
                      <span className="text-rose-400 font-bold text-[10px]">
                        Atención Prioritaria
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VISTA NORMAL: GESTIÓN DE URGENCIAS & TRIAJE
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            <HeartPulse className="h-7 w-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Centro de Urgencias & Triaje
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Sistema Manchester SQA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clasificación por gravedad clínica, control de tiempos de espera y asignación de Boxes.
            </p>
          </div>
        </div>

        {user?.rol !== 'PACIENTE' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setModoMonitorTV(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Tv className="h-4 w-4 text-teal-400" />
              <span>Monitor Sala de Espera</span>
            </button>
            <button
              onClick={() => setModalNuevoAbierto(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Nuevo Ingreso Triaje</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. MENSAJE FLOTANTE DE ÉXITO */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* 3. KPIS DE URGENCIAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total en Urgencias</span>
            <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{totalPacientes}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Pacientes activos</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">Críticos (Nivel 1 & 2)</span>
            <strong className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{pacientesCriticos}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Reanimación inmediata</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">En Espera de Box</span>
            <strong className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{pacientesEnEspera}</strong>
            <span className="text-[10px] text-slate-500 font-medium">En sala de espera</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider block">En Atención Médica</span>
            <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{pacientesEnBox}</strong>
            <span className="text-[10px] text-slate-500 font-medium">En boxes y shock room</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 4. GUÍA VISUAL ESCALA DE TRIAJE MANCHESTER */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <strong className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Escala Internacional de Triaje Manchester (Prioridad Clínica)</span>
          </strong>
          <span className="text-[10px] text-slate-400">Normativa Hospitalaria SQA</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(NIVELES_TRIAJE_MAP) as NivelTriaje[]).map(k => {
            const meta = NIVELES_TRIAJE_MAP[k];
            return (
              <button
                key={k}
                onClick={() => setFiltroNivel(filtroNivel === k ? 'TODOS' : k)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filtroNivel === k 
                    ? 'ring-2 ring-slate-900 dark:ring-white scale-[1.02]' 
                    : 'opacity-90 hover:opacity-100'
                } ${meta.colorBg} ${meta.colorBorder}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${meta.colorPill}`}>
                    {meta.codigo}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                    {meta.tiempoMaxMinutos === 0 ? 'Inmediato' : `< ${meta.tiempoMaxMinutos}m`}
                  </span>
                </div>
                <strong className={`block text-xs font-bold mt-1 truncate ${meta.colorText}`}>
                  {meta.nombre.split('(')[0]}
                </strong>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente, código TR, documento o síntoma..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'EN_ESPERA', label: 'En Espera' },
              { id: 'EN_BOX', label: 'En Box' },
              { id: 'OBSERVACION', label: 'Observación' },
              { id: 'ALTA', label: 'Altas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroEstado(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filtroEstado === f.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 6. LISTA DE PACIENTES EN URGENCIAS */}
      {pacientesFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
          <HeartPulse className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-bold">No hay pacientes de urgencia registrados con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pacientesFiltrados.map((p) => {
            const meta = NIVELES_TRIAJE_MAP[p.nivel_triaje];
            const minTranscurridos = calcularMinutosTranscurridos(p.fecha_ingreso);
            const tiempoExcedido = p.estado === 'EN_ESPERA' && meta.tiempoMaxMinutos > 0 && minTranscurridos > meta.tiempoMaxMinutos;

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                  p.llamado_activo
                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {p.codigo_urgencia}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Hace {minTranscurridos} min
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${meta.colorPill}`}>
                      {meta.codigo} &bull; {meta.tiempoMaxMinutos === 0 ? 'Inmediato' : `< ${meta.tiempoMaxMinutos}m`}
                    </span>
                  </div>

                  {/* Nombre y Edad */}
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                      {p.paciente_nombre}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.edad} &bull; {p.genero} &bull; <span className="font-mono text-slate-500">DPI: {p.documento}</span>
                    </p>
                  </div>

                  {/* Motivo de Urgencia */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Motivo / Síntoma Cardinal</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                      {p.motivo_ingreso}
                    </p>
                  </div>

                  {/* Signos Vitales de Triaje */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] text-center font-mono">
                    <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px]">PA</span>
                      <strong className="text-slate-700 dark:text-slate-200">{p.signos_vitales.presion}</strong>
                    </div>
                    <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px]">FC</span>
                      <strong className="text-slate-700 dark:text-slate-200">{p.signos_vitales.frecuencia_cardiaca}</strong>
                    </div>
                    <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Temp</span>
                      <strong className="text-slate-700 dark:text-slate-200">{p.signos_vitales.temperatura}°C</strong>
                    </div>
                    <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px]">SpO2</span>
                      <strong className={p.signos_vitales.spo2 < 92 ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                        {p.signos_vitales.spo2}%
                      </strong>
                    </div>
                    <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px]">GCS</span>
                      <strong className="text-slate-700 dark:text-slate-200">{p.signos_vitales.glasgow}/15</strong>
                    </div>
                    <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Dolor</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-bold">{p.signos_vitales.escala_dolor}/10</strong>
                    </div>
                  </div>

                  {/* Box y Médico */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Building className="w-3.5 h-3.5 text-rose-500" />
                      <span>{p.box_asignado}</span>
                    </span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[140px]">
                      {p.medico_asignado}
                    </span>
                  </div>

                  {/* Alerta si el tiempo está excedido */}
                  {tiempoExcedido && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-[10px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>Tiempo de espera superado ({minTranscurridos} min &gt; máx {meta.tiempoMaxMinutos} min). Atención prioritaria.</span>
                    </div>
                  )}

                </div>

                {/* Acciones del Paciente */}
                {user?.rol !== 'PACIENTE' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleLlamarPaciente(p.id)}
                      className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        p.llamado_activo
                          ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400/30'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Llamar a Box en pantalla de sala de espera"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{p.llamado_activo ? 'Llamando...' : 'Llamar'}</span>
                    </button>

                    {p.estado === 'EN_ESPERA' && (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(p.id, 'EN_BOX')}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>A Box</span>
                      </button>
                    )}

                    {p.estado === 'EN_BOX' && (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(p.id, 'OBSERVACION')}
                        className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span>Observación</span>
                      </button>
                    )}

                    {(p.estado === 'EN_BOX' || p.estado === 'OBSERVACION') && (
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(p.id, 'ALTA')}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl transition-all cursor-pointer"
                      >
                        <span>Alta</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL NUEVO INGRESO A TRIAJE (CON CUSTOMSELECT) */}
      {/* ========================================================================= */}
      {modalNuevoAbierto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <HeartPulse className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Ingreso & Clasificación de Triaje Manchester
                  </h3>
                  <p className="text-xs text-slate-400">Evaluación rápida y asignación de prioridad de urgencia</p>
                </div>
              </div>
              <button
                onClick={() => setModalNuevoAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearIngresoTriaje} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Selector de Tipo de Paciente */}
              <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setTipoPacienteIngreso('REGISTRADO')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tipoPacienteIngreso === 'REGISTRADO'
                      ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Paciente Registrado en ECE
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPacienteIngreso('EMERGENCIA_DIRECTA')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tipoPacienteIngreso === 'EMERGENCIA_DIRECTA'
                      ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Ingreso Inmediato / Paciente NN
                </button>
              </div>

              {/* Paciente Registrado o Manual */}
              {tipoPacienteIngreso === 'REGISTRADO' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Seleccionar Paciente *
                    </label>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                      {pacientesRegistrados.length} pacientes registrados
                    </span>
                  </div>
                  <CustomSelect
                    value={pacienteSeleccionadoId}
                    onChange={(val) => setPacienteSeleccionadoId(val)}
                    options={opcionesPacientesRegistrados}
                    placeholder="Buscar paciente registrado..."
                    icon={<User className="w-4 h-4" />}
                  />

                  {pacienteRegistradoSeleccionado && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">
                          {pacienteRegistradoSeleccionado.nombre_completo}
                        </strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {pacienteRegistradoSeleccionado.codigo_paciente || 'PACIENTE REGISTRADO'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <p>DPI: <span className="font-semibold text-slate-700 dark:text-slate-200">{pacienteRegistradoSeleccionado.documento || 'No indicado'}</span></p>
                        <p>Grupo Sanguíneo: <span className="font-bold text-rose-600 dark:text-rose-400">{pacienteRegistradoSeleccionado.tipo_sangre || 'S/D'}</span></p>
                        <p>Teléfono: <span className="font-semibold text-slate-700 dark:text-slate-200">{pacienteRegistradoSeleccionado.telefono || 'Sin tel.'}</span></p>
                        <p>Fecha Nacimiento: <span className="font-semibold text-slate-700 dark:text-slate-200">{pacienteRegistradoSeleccionado.fecha_nacimiento || 'N/A'}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre Completo del Paciente *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombreManual}
                      onChange={(e) => setNombreManual(e.target.value)}
                      placeholder="Ej. Paciente Masculino NN o Nombre"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Edad Aproximada</label>
                    <input
                      type="text"
                      value={edadManual}
                      onChange={(e) => setEdadManual(e.target.value)}
                      placeholder="Ej. 35 años"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Género</label>
                    <CustomSelect
                      value={generoManual}
                      onChange={(val) => setGeneroManual(val)}
                      options={opcionesGenero}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">DPI / Documento</label>
                    <input
                      type="text"
                      value={documentoManual}
                      onChange={(e) => setDocumentoManual(e.target.value)}
                      placeholder="Ej. 2930 19283 0101 o Desconocido"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Motivo de Urgencia */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo de Ingreso / Síntoma Cardinal *
                </label>
                <input
                  type="text"
                  required
                  value={motivoIngreso}
                  onChange={(e) => setMotivoIngreso(e.target.value)}
                  placeholder="Ej. Disnea súbita con dolor torácico opresivo de 1 hora"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Signos Vitales */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 block">
                  Signos Vitales de Triaje Inicial
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">PA (mmHg)</label>
                    <input
                      type="text"
                      value={presion}
                      onChange={(e) => setPresion(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">FC (lpm)</label>
                    <input
                      type="number"
                      value={fc}
                      onChange={(e) => setFc(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Glasgow</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      value={glasgow}
                      onChange={(e) => setGlasgow(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Dolor (1-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={dolor}
                      onChange={(e) => setDolor(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Clasificación de Triaje Manchester con CustomSelect */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nivel de Triaje Manchester (Gravedad) *
                </label>
                <CustomSelect
                  value={nivelTriajeSeleccionado}
                  onChange={(val) => setNivelTriajeSeleccionado(val as NivelTriaje)}
                  options={opcionesNivelTriaje}
                  placeholder="Seleccionar nivel de triaje..."
                />
              </div>

              {/* Box de Atención Asignado con CustomSelect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Box de Atención Inicial *
                  </label>
                  <CustomSelect
                    value={boxAsignado}
                    onChange={(val) => setBoxAsignado(val)}
                    options={opcionesBoxes}
                    placeholder="Elegir box..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Médico / Emergentólogo a Cargo
                  </label>
                  <input
                    type="text"
                    value={medicoAsignado}
                    onChange={(e) => setMedicoAsignado(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observaciones Clínicas / Protocolos Aplicados
                </label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej. ECG realizado, canalización de vía periférica con solución salina al 0.9%"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Footer del Modal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalNuevoAbierto(false)}
                  className="px-4 py-2.5 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Guardar en Triaje
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
