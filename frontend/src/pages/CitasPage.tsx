import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita, Paciente, Profesional, Sede, Servicio } from '../types';
import { 
  Plus, Check, X, Calendar as CalIcon, Clock, 
  Stethoscope, Building2, AlertCircle, CheckCircle2, 
  Search, ChevronRight, ChevronLeft, User
} from 'lucide-react';
import { CustomDatePicker } from '../components/CustomDatePicker';

export const CitasPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [citaExitosa, setCitaExitosa] = useState(false);

  // Filtros de tabla principal
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');
  const [busquedaPrincipal, setBusquedaPrincipal] = useState<string>('');

  // --------------------------------------------------------------------------
  // ESTADO DEL WIZARD DE 4 PASOS
  // --------------------------------------------------------------------------
  const [pasoActual, setPasoActual] = useState(1);

  // Paso 1: Paciente y Médico
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<Profesional | null>(null);

  // Paso 2: Sede y Servicio
  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede | null>(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  // Paso 3: Fecha, Horario y Motivo
  const mananaStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(mananaStr);
  const [horaSeleccionada, setHoraSeleccionada] = useState('09:00');
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [motivo, setMotivo] = useState('');
  const [modalidad, setModalidad] = useState<'PRESENCIAL' | 'VIRTUAL'>('PRESENCIAL');
  const [simiCallActive, setSimiCallActive] = useState<string | null>(null);

  const bloquesHorarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Cargar datos del servidor
  const cargarDatos = async () => {
    try {
      const [resCitas, resPac, resProf, resSed, resServ] = await Promise.all([
        apiClient.get('/citas'),
        apiClient.get('/pacientes'),
        apiClient.get('/organizacion/profesionales'),
        apiClient.get('/organizacion/sedes'),
        apiClient.get('/organizacion/servicios'),
      ]);

      if (resCitas.data.ok) setCitas(resCitas.data.citas);
      if (resPac.data.ok) setPacientes(resPac.data.pacientes);
      if (resProf.data.ok) setProfesionales(resProf.data.profesionales);
      if (resSed.data.ok) setSedes(resSed.data.sedes);
      if (resServ.data.ok) setServicios(resServ.data.servicios);
    } catch (err) {
      console.error('Error al cargar datos de citas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir modal si la URL trae ?nueva=true
  useEffect(() => {
    if (searchParams.get('nueva') === 'true') {
      abrirModalNuevo();
      searchParams.delete('nueva');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  // Inicializar selecciones por defecto al abrir modal
  const abrirModalNuevo = () => {
    setPasoActual(1);
    setErrorModal(null);
    setCitaExitosa(false);

    // Si el usuario logueado es un paciente, autoseleccionarlo
    if (user?.rol === 'PACIENTE' && user.pacienteId) {
      const pac = pacientes.find((p) => p.id === user.pacienteId);
      if (pac) setPacienteSeleccionado(pac);
    } else if (pacientes.length > 0) {
      setPacienteSeleccionado(pacientes[0]);
    }

    if (profesionales.length > 0) setProfesionalSeleccionado(profesionales[0]);
    if (sedes.length > 0) setSedeSeleccionada(sedes[0]);
    if (servicios.length > 0) setServicioSeleccionado(servicios[0]);

    setModalAbierto(true);
  };

  // Pacientes filtrados para el paso 1
  const pacientesFiltrados = useMemo(() => {
    if (!busquedaPaciente.trim()) return pacientes.slice(0, 5);
    const q = busquedaPaciente.toLowerCase();
    return pacientes.filter(
      (p) =>
        p.nombre_completo.toLowerCase().includes(q) ||
        p.codigo_paciente.toLowerCase().includes(q) ||
        p.documento.toLowerCase().includes(q)
    );
  }, [pacientes, busquedaPaciente]);

  // Comprobación de disponibilidad de horarios en tiempo real (Paso 3)
  const disponibilidadHorarios = useMemo(() => {
    const mapaOcupados = new Set<string>();
    if (!profesionalSeleccionado || !fechaSeleccionada) return mapaOcupados;

    citas.forEach((c) => {
      if (
        c.profesional_id === profesionalSeleccionado.id &&
        c.estado !== 'CANCELADA' &&
        c.fecha_inicio.startsWith(fechaSeleccionada)
      ) {
        // Extraer HH:mm
        const horaInicioCita = new Date(c.fecha_inicio).toTimeString().substring(0, 5);
        mapaOcupados.add(horaInicioCita);
      }
    });

    return mapaOcupados;
  }, [citas, profesionalSeleccionado, fechaSeleccionada]);

  // Enviar el formulario tras el Paso 4
  const handleConfirmarCita = async () => {
    if (!pacienteSeleccionado || !profesionalSeleccionado || !sedeSeleccionada || !servicioSeleccionado) {
      setErrorModal('Por favor completa todos los pasos obligatorios.');
      return;
    }

    setErrorModal(null);
    setGuardando(true);

    const fechaHoraCompleta = `${fechaSeleccionada}T${horaSeleccionada}:00`;
    const inicio = new Date(fechaHoraCompleta);
    const fin = new Date(inicio.getTime() + duracionMinutos * 60000);

    const motivoFinal = modalidad === 'VIRTUAL' 
      ? `[Telemedicina] ${motivo.trim() || 'Consulta médica virtual'}`
      : motivo.trim() || 'Consulta médica de rutina';

    try {
      const res = await apiClient.post('/citas', {
        paciente_id: pacienteSeleccionado.id,
        profesional_id: profesionalSeleccionado.id,
        sede_id: sedeSeleccionada.id,
        servicio_id: servicioSeleccionado.id,
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        duracion_minutos: duracionMinutos,
        motivo: motivoFinal,
      });

      if (res.data.ok) {
        setCitaExitosa(true);
        cargarDatos();
      }
    } catch (err: any) {
      setErrorModal(err.response?.data?.error || 'Error al confirmar la cita en el sistema.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      await apiClient.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      cargarDatos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado de la cita.');
    }
  };

  // Citas filtradas para la lista principal
  const citasFiltradas = citas.filter((c) => {
    const coincideEstado = filtroEstado === 'TODAS' || c.estado === filtroEstado;
    const termino = busquedaPrincipal.toLowerCase().trim();
    const coincideBusqueda =
      !termino ||
      c.paciente_nombre.toLowerCase().includes(termino) ||
      c.profesional_nombre.toLowerCase().includes(termino) ||
      c.servicio_nombre.toLowerCase().includes(termino);
    return coincideEstado && coincideBusqueda;
  });

  const estadoBadgeClass: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PROGRAMADA: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
    CONFIRMADA: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    ATENDIDA: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-600' },
    CANCELADA: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up relative">
      
      {/* Fondos flotantes decorativos */}
      <div className="absolute top-0 right-20 w-72 h-72 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-60 left-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. ENCABEZADO Y BOTÓN DE APERTURA DE WIZARD */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-xs font-black uppercase tracking-widest mb-3">
            <CalIcon className="h-3.5 w-3.5" />
            Agenda y Turnos Clínicos
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Citas Médicas
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Programación guiada, disponibilidad en tiempo real y seguimiento de estados
          </p>
        </div>

        {user?.rol !== 'PACIENTE' && (
          <button
            onClick={abrirModalNuevo}
            className="group relative px-6 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] text-sm font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-teal-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <Plus className="h-5 w-5 stroke-[3] relative z-10" />
            <span className="relative z-10">Programar Nueva Cita</span>
          </button>
        )}
      </div>

      {/* 2. TABLA PRINCIPAL DE CITAS CON FILTROS Y BÚSQUEDA */}
      <div className="relative z-10 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-xl shadow-slate-200/30 dark:shadow-none overflow-hidden transition-colors">
        
        {/* Barra de Filtros */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['TODAS', 'PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filtroEstado === estado
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {estado === 'TODAS' ? 'Todas' : estado.charAt(0) + estado.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busquedaPrincipal}
              onChange={(e) => setBusquedaPrincipal(e.target.value)}
              placeholder="Buscar por paciente o médico..."
              className="pl-9 pr-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Tabla */}
        {cargando ? (
          <div className="p-12 text-center text-sm text-slate-400">Cargando agenda de citas...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <span>No se encontraron citas con los criterios seleccionados.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-xs uppercase text-slate-400 dark:text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Médico Asignado</th>
                  <th className="px-6 py-4">Sede / Servicio</th>
                  <th className="px-6 py-4">Fecha y Horario</th>
                  <th className="px-6 py-4">Duración</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Gestión de Turno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {citasFiltradas.map((c) => {
                  const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {c.paciente_nombre}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">
                          {c.motivo || 'Consulta médica'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {c.profesional_nombre}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.servicio_nombre}</div>
                        <div className="text-xs text-slate-400">{c.sede_nombre}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {new Date(c.fecha_inicio).toLocaleString('es-GT', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        {c.duracion_minutos} min
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {c.motivo?.includes('[Telemedicina]') && c.estado !== 'CANCELADA' && c.estado !== 'ATENDIDA' && (
                            <button
                              onClick={() => setSimiCallActive(c.id)}
                              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                            >
                              <span className="text-base">👨🏻‍⚕️</span> Unirse
                            </button>
                          )}
                          {user?.rol !== 'PACIENTE' && c.estado !== 'CANCELADA' && (
                            <>
                              {c.estado === 'PROGRAMADA' && (
                                <button
                                  onClick={() => handleCambiarEstado(c.id, 'CONFIRMADA')}
                                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                                >
                                  Confirmar
                                </button>
                              )}
                              {c.estado !== 'ATENDIDA' && (
                                <button
                                  onClick={() => handleCambiarEstado(c.id, 'ATENDIDA')}
                                  className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-semibold border border-teal-200 dark:border-teal-800"
                                >
                                  Atender
                                </button>
                              )}
                              <button
                                onClick={() => handleCambiarEstado(c.id, 'CANCELADA')}
                                className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs"
                                title="Cancelar cita"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. WIZARD GUIADO DE 4 PASOS: PROGRAMACIÓN DE CITAS                  */}
      {/* ------------------------------------------------------------------ */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[32px] shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Cabecera del Modal con Stepper de 4 Pasos */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                    <CalIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Programar Cita Médica
                    </h3>
                    <p className="text-xs text-slate-400">
                      Asistente clínico guiado en 4 pasos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Indicadores de Pasos (1: Paciente y Médico, 2: Sede y Servicio, 3: Fecha y Horario, 4: Confirmación) */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { num: 1, label: 'Paciente & Médico' },
                  { num: 2, label: 'Sede & Servicio' },
                  { num: 3, label: 'Fecha & Horario' },
                  { num: 4, label: 'Confirmación' },
                ].map((s) => (
                  <div key={s.num} className="flex flex-col gap-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        pasoActual >= s.num
                          ? 'bg-gradient-to-r from-sky-500 to-teal-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-bold truncate ${
                        pasoActual === s.num
                          ? 'text-sky-600 dark:text-sky-400'
                          : pasoActual > s.num
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {s.num}. {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mensaje de Error en el Modal */}
            {errorModal && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorModal}</span>
              </div>
            )}

            {/* CUERPO DEL WIZARD SEGÚN EL PASO ACTIVO */}
            <div className="p-6">
              
              {citaExitosa ? (
                /* PANTALLA DE ÉXITO */
                <div className="py-8 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">
                      ¡Cita Agendada Exitosamente!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Se ha generado el turno para {pacienteSeleccionado?.nombre_completo} con {profesionalSeleccionado?.nombre} para el {fechaSeleccionada} a las {horaSeleccionada} hrs.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setModalAbierto(false)}
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-sky-500/20"
                    >
                      Aceptar y Volver a la Agenda
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ======================================================= */}
                  {/* PASO 1: PACIENTE Y MÉDICO                               */}
                  {/* ======================================================= */}
                  {pasoActual === 1 && (
                    <div className="space-y-5">
                      {/* Búsqueda y Selección de Paciente */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          1. Seleccionar Paciente Registrado *
                        </label>
                        
                        {/* Buscador interactivo */}
                        <div className="relative mb-3">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={busquedaPaciente}
                            onChange={(e) => setBusquedaPaciente(e.target.value)}
                            placeholder="Buscar paciente por nombre o DPI..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        {/* Tarjetas de Pacientes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {pacientesFiltrados.map((p) => {
                            const seleccionado = pacienteSeleccionado?.id === p.id;
                            return (
                              <div
                                key={p.id}
                                onClick={() => setPacienteSeleccionado(p)}
                                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                  seleccionado
                                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-950 dark:text-sky-200 shadow-sm ring-1 ring-sky-500'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 font-bold text-[10px]">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <strong className="block font-bold text-slate-900 dark:text-white truncate">
                                      {p.nombre_completo}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      DPI: {p.documento} &bull; {p.tipo_sangre}
                                    </span>
                                  </div>
                                </div>
                                {seleccionado && (
                                  <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 stroke-[3]" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selección de Médico Responsable */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          2. Asignar Médico Responsable *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {profesionales.map((prof) => {
                            const seleccionado = profesionalSeleccionado?.id === prof.id;
                            return (
                              <div
                                key={prof.id}
                                onClick={() => setProfesionalSeleccionado(prof)}
                                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                  seleccionado
                                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-teal-200 shadow-sm ring-1 ring-teal-500'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                                    <Stethoscope className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <strong className="block font-bold text-slate-900 dark:text-white">
                                      {prof.nombre}
                                    </strong>
                                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                                      {prof.especialidad}
                                    </span>
                                  </div>
                                </div>
                                {seleccionado && (
                                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 stroke-[3]" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* PASO 2: SEDE Y SERVICIO CLÍNICO                         */}
                  {/* ======================================================= */}
                  {pasoActual === 2 && (
                    <div className="space-y-5">
                      {/* Sedes Clínicas */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          1. Seleccionar Sede de Atención *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sedes.map((s) => {
                            const seleccionado = sedeSeleccionada?.id === s.id;
                            return (
                              <div
                                key={s.id}
                                onClick={() => setSedeSeleccionada(s)}
                                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                  seleccionado
                                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-950 dark:text-sky-200 shadow-sm ring-1 ring-sky-500'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <strong className="block font-bold text-slate-900 dark:text-white">
                                      {s.nombre}
                                    </strong>
                                    <span className="text-[11px] text-slate-400">
                                      {s.direccion}
                                    </span>
                                  </div>
                                </div>
                                {seleccionado && (
                                  <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 stroke-[3]" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Servicios Médicos con Precio Oficial */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          2. Seleccionar Servicio Médico *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {servicios.map((srv) => {
                            const seleccionado = servicioSeleccionado?.id === srv.id;
                            return (
                              <div
                                key={srv.id}
                                onClick={() => setServicioSeleccionado(srv)}
                                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                  seleccionado
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500'
                                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                                }`}
                              >
                                <div>
                                  <strong className="block font-bold text-slate-900 dark:text-white">
                                    {srv.nombre}
                                  </strong>
                                  <span className="text-[11px] text-slate-400">
                                    Duración estimada: {srv.duracion_estimada_minutos} min
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                    Q.{srv.precio_base}
                                  </span>
                                  {seleccionado && (
                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[3] ml-auto mt-1" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* PASO 3: FECHA, HORARIO Y CONFLICTOS EN TIEMPO REAL      */}
                  {/* ======================================================= */}
                  {pasoActual === 3 && (
                    <div className="space-y-5">
                      {/* Selector de Fecha */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          1. Fecha de Atención Clínica *
                        </label>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {[
                            { label: 'Mañana', val: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                            { label: 'En 2 Días', val: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] },
                            { label: 'En 3 Días', val: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] },
                          ].map((d) => (
                            <button
                              key={d.val}
                              type="button"
                              onClick={() => setFechaSeleccionada(d.val)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                fechaSeleccionada === d.val
                                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                          <CustomDatePicker
                            value={fechaSeleccionada}
                            onChange={(date) => setFechaSeleccionada(date)}
                            minDate={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      {/* Bloques de Horarios con Diferenciación de Disponibilidad */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            2. Bloques de Horarios Disponibles *
                          </label>
                          <span className="text-[11px] text-slate-400">
                            Dr(a). {profesionalSeleccionado?.nombre.split(' ')[0]}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                          {bloquesHorarios.map((h) => {
                            const ocupado = disponibilidadHorarios.has(h);
                            const seleccionado = horaSeleccionada === h;
                            return (
                              <button
                                key={h}
                                type="button"
                                disabled={ocupado}
                                onClick={() => setHoraSeleccionada(h)}
                                className={`relative py-3 px-2 text-sm font-black rounded-2xl text-center transition-all duration-300 overflow-hidden ${
                                  ocupado
                                    ? 'bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800 cursor-not-allowed line-through opacity-60'
                                    : seleccionado
                                    ? 'bg-gradient-to-tr from-sky-500 to-teal-400 text-white shadow-xl shadow-sky-500/30 scale-105 border-0 ring-4 ring-sky-500/20 z-10'
                                    : 'bg-white/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-2 border-slate-200/80 dark:border-slate-700 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 backdrop-blur-sm'
                                }`}
                              >
                                {seleccionado && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                <span className="relative z-10">{h}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-sky-600" /> Seleccionado
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" /> Disponible
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-400" /> Ocupado
                          </span>
                        </div>
                      </div>

                      {/* Duración y Motivo */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Duración (Minutos)
                          </label>
                          <div className="flex gap-1.5">
                            {[15, 30, 45, 60].map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDuracionMinutos(d)}
                                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                  duracionMinutos === d
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {d}m
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Motivo Principal de Consulta
                          </label>
                          <input
                            type="text"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej. Chequeo preventivo, control de hipertensión, cefalea..."
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Modalidad de Atención
                          </label>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setModalidad('PRESENCIAL')}
                              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold ${
                                modalidad === 'PRESENCIAL'
                                  ? 'bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 shadow-sm ring-1 ring-sky-500/50'
                                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500'
                              }`}
                            >
                              <Building2 className="h-5 w-5" /> Presencial
                            </button>
                            <button
                              type="button"
                              onClick={() => setModalidad('VIRTUAL')}
                              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold ${
                                modalidad === 'VIRTUAL'
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/50'
                                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500'
                              }`}
                            >
                              <span className="text-xl">👨🏻‍⚕️</span> Telemedicina (Dr. Simi IA)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* PASO 4: CONFIRMACIÓN Y RESUMEN CLÍNICO                   */}
                  {/* ======================================================= */}
                  {pasoActual === 4 && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-teal-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-100 dark:border-slate-700 space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 dark:border-slate-700">
                          <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                            Ficha Resumen de la Cita
                          </span>
                          <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950 px-2.5 py-0.5 rounded-full">
                            Estado: PROGRAMADA
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block font-medium">Paciente:</span>
                            <strong className="text-slate-900 dark:text-white text-sm">
                              {pacienteSeleccionado?.nombre_completo}
                            </strong>
                            <p className="text-slate-500 font-mono text-[11px]">
                              Expediente: {pacienteSeleccionado?.codigo_paciente} &bull; DPI: {pacienteSeleccionado?.documento}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-medium">Médico Asignado:</span>
                            <strong className="text-slate-900 dark:text-white text-sm">
                              {profesionalSeleccionado?.nombre}
                            </strong>
                            <p className="text-teal-600 dark:text-teal-400 font-semibold text-[11px]">
                              {profesionalSeleccionado?.especialidad}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-medium">Sede y Servicio:</span>
                            <strong className="text-slate-800 dark:text-slate-200">
                              {servicioSeleccionado?.nombre}
                            </strong>
                            <p className="text-slate-500 text-[11px]">
                              Sede: {sedeSeleccionada?.nombre} &bull; Precio: Q.{servicioSeleccionado?.precio_base}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 block font-medium">Fecha y Horario:</span>
                            <strong className="text-slate-900 dark:text-white font-mono text-sm">
                              {fechaSeleccionada} a las {horaSeleccionada} hrs
                            </strong>
                            <p className="text-slate-500 text-[11px]">
                              Duración: {duracionMinutos} minutos
                            </p>
                          </div>
                        </div>

                        {motivo && (
                          <div className="pt-2 border-t border-sky-200/50 dark:border-slate-700 text-xs">
                            <span className="text-slate-400 block font-medium">Motivo:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{motivo}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Validación SQA superada: Horario libre y médico disponible sin conflictos.</span>
                      </div>
                    </div>
                  )}

                  {/* NAVEGACIÓN ENTRE PASOS */}
                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {pasoActual > 1 ? (
                      <button
                        type="button"
                        onClick={() => setPasoActual((p) => p - 1)}
                        className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Anterior</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setModalAbierto(false)}
                        className="px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                    )}

                    {pasoActual < 4 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (pasoActual === 1 && (!pacienteSeleccionado || !profesionalSeleccionado)) {
                            setErrorModal('Debes seleccionar un paciente y un médico.');
                            return;
                          }
                          if (pasoActual === 2 && (!sedeSeleccionada || !servicioSeleccionado)) {
                            setErrorModal('Debes seleccionar una sede y un servicio médico.');
                            return;
                          }
                          setErrorModal(null);
                          setPasoActual((p) => p + 1);
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={guardando}
                        onClick={handleConfirmarCita}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {guardando ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>Confirmando Turno...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>Confirmar Cita Médica</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
