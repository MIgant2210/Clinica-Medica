import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita, Paciente, Profesional, Sede, Servicio } from '../types';
import { 
  Plus, Check, X, Calendar as CalIcon, ShieldAlert, Clock, 
  Stethoscope, Building2, AlertCircle, CheckCircle2
} from 'lucide-react';

export const CitasPage: React.FC = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Formulario interactivo e innovador
  const [pacienteId, setPacienteId] = useState('');
  const [profesionalId, setProfesionalId] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [motivo, setMotivo] = useState('');

  // Selector innovador de Fecha y Horarios (Chips)
  const hoyStr = new Date().toISOString().split('T')[0];
  const mananaStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const pasadoStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [fechaSeleccionada, setFechaSeleccionada] = useState(mananaStr);
  const [horaSeleccionada, setHoraSeleccionada] = useState('09:00');

  const horariosDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'
  ];

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
      if (resPac.data.ok) {
        setPacientes(resPac.data.pacientes);
        if (resPac.data.pacientes.length > 0) setPacienteId(resPac.data.pacientes[0].id);
      }
      if (resProf.data.ok) {
        setProfesionales(resProf.data.profesionales);
        if (resProf.data.profesionales.length > 0) setProfesionalId(resProf.data.profesionales[0].id);
      }
      if (resSed.data.ok) {
        setSedes(resSed.data.sedes);
        if (resSed.data.sedes.length > 0) setSedeId(resSed.data.sedes[0].id);
      }
      if (resServ.data.ok) {
        setServicios(resServ.data.servicios);
        if (resServ.data.servicios.length > 0) setServicioId(resServ.data.servicios[0].id);
      }
    } catch (err) {
      console.error('Error al cargar datos de citas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);

    // Construir fecha ISO con la fecha y hora seleccionadas
    const fechaHoraCompleta = `${fechaSeleccionada}T${horaSeleccionada}:00`;
    const inicio = new Date(fechaHoraCompleta);
    const fin = new Date(inicio.getTime() + duracionMinutos * 60000);

    try {
      const res = await apiClient.post('/citas', {
        paciente_id: pacienteId,
        profesional_id: profesionalId,
        sede_id: sedeId,
        servicio_id: servicioId,
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        duracion_minutos: duracionMinutos,
        motivo,
      });

      if (res.data.ok) {
        setModalAbierto(false);
        setMotivo('');
        cargarDatos();
      }
    } catch (err: any) {
      setErrorModal(err.response?.data?.error || 'Error al agendar la cita.');
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

  const estadoBadgeClass: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PROGRAMADA: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800', dot: 'bg-sky-500' },
    CONFIRMADA: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
    ATENDIDA: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-600' },
    CANCELADA: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  };

  const duracionesSugeridas = [15, 30, 45, 60, 90, 120];
  const puedeAgendar = user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA';

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold mb-1 border border-teal-100 dark:border-teal-800">
            <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            Control Horario y Agendamiento
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Agenda y Citas Médicas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control de citas, prevención de traslapes (RN-02) y límites de borde (15 a 120 min)
          </p>
        </div>

        {puedeAgendar && (
          <button
            onClick={() => setModalAbierto(true)}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Nueva Cita Médica
          </button>
        )}
      </div>

      {/* Tabla de Citas */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-sm text-slate-400">Cargando citas...</div>
        ) : citas.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            No se registran citas médicas actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Médico</th>
                  <th className="px-6 py-4">Sede y Servicio</th>
                  <th className="px-6 py-4">Horario</th>
                  <th className="px-6 py-4">Duración</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {citas.map((c) => {
                  const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {c.paciente_nombre}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{c.motivo}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
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
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {c.duracion_minutos} min
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {c.estado === 'PROGRAMADA' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCambiarEstado(c.id, 'CONFIRMADA')}
                              title="Confirmar Cita"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-xl transition-all hover:scale-105"
                            >
                              <Check className="h-4 w-4 stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => handleCambiarEstado(c.id, 'CANCELADA')}
                              title="Cancelar Cita"
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-rose-800 rounded-xl transition-all hover:scale-105"
                            >
                              <X className="h-4 w-4 stroke-[2.5]" />
                            </button>
                          </div>
                        )}
                        {c.estado === 'CONFIRMADA' && user?.rol === 'MEDICO' && (
                          <button
                            onClick={() => handleCambiarEstado(c.id, 'ATENDIDA')}
                            className="px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                          >
                            Atender
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL INNOVADOR: TARJETAS VISUALES + SELECTOR DE HORARIOS EN CHIPS  */}
      {/* =================================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[36px] p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-800 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <CalIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Programar Cita Médica</h3>
                  <p className="text-xs text-slate-400">Verificación interactiva de turnos y disponibilidad</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCrearCita} className="space-y-5 text-sm">
              
              {/* 1. SELECCIÓN DE PACIENTE (LISTA VISUAL MEJORADA) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  1. Paciente Registrado *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {pacientes.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPacienteId(p.id)}
                      className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                        pacienteId === p.id
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 dark:border-teal-400 text-teal-900 dark:text-teal-200 font-bold shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold">
                          {p.tipo_sangre}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold leading-tight">{p.nombre_completo}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.codigo_paciente}</div>
                        </div>
                      </div>
                      {pacienteId === p.id && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. SELECCIÓN DE MÉDICO (TARJETAS PROFESIONALES) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  2. Médico Especialista *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {profesionales.map((prof) => (
                    <div
                      key={prof.id}
                      onClick={() => setProfesionalId(prof.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${
                        profesionalId === prof.id
                          ? 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/60 border-teal-500 shadow-md shadow-teal-500/10'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-teal-300'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white flex items-center justify-center font-bold">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {prof.nombre}
                        </div>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          {prof.especialidad}
                        </div>
                      </div>
                      {profesionalId === prof.id && (
                        <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. SEDE Y SERVICIO (CHIPS VISUALES) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Sede *
                  </label>
                  <div className="space-y-1.5">
                    {sedes.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSedeId(s.id)}
                        className={`p-2.5 rounded-xl cursor-pointer border text-xs flex items-center justify-between transition-all ${
                          sedeId === s.id
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-sky-500" />
                          <span>{s.nombre}</span>
                        </div>
                        {sedeId === s.id && <Check className="h-3.5 w-3.5 text-sky-600" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Servicio Médico *
                  </label>
                  <div className="space-y-1.5">
                    {servicios.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setServicioId(srv.id)}
                        className={`p-2.5 rounded-xl cursor-pointer border text-xs flex items-center justify-between transition-all ${
                          servicioId === srv.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <span>{srv.nombre}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Q.{srv.precio_base}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. SELECTOR INNOVADOR DE FECHA Y HORARIO (TIME CHIPS) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CalIcon className="h-4 w-4 text-teal-600" />
                    <span>Fecha y Turno Médico</span>
                  </label>
                  <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {fechaSeleccionada} &bull; {horaSeleccionada}
                  </span>
                </div>

                {/* Días Rápidos */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFechaSeleccionada(hoyStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      fechaSeleccionada === hoyStr
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setFechaSeleccionada(mananaStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      fechaSeleccionada === mananaStr
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Mañana
                  </button>
                  <button
                    type="button"
                    onClick={() => setFechaSeleccionada(pasadoStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      fechaSeleccionada === pasadoStr
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    En 2 Días
                  </button>
                </div>

                {/* Input Manual de Fecha Alternativa */}
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                />

                {/* Franjas Horarias (Time Chips) */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Selecciona el Horario Disponible:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {horariosDisponibles.map((h) => (
                      <button
                        type="button"
                        key={h}
                        onClick={() => setHoraSeleccionada(h)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          horaSeleccionada === h
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. SELECTOR DE DURACIÓN (REGLA SQA) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Duración Estimada ({duracionMinutos} min)
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Regla Borde: 15 a 120 min
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {duracionesSugeridas.map((min) => (
                    <button
                      type="button"
                      key={min}
                      onClick={() => setDuracionMinutos(min)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        duracionMinutos === min
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. MOTIVO DE CONSULTA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Motivo de la Cita *
                </label>
                <textarea
                  required
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Síntomas reportados, control preventivo, malestar..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
                >
                  Confirmar Agendamiento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
