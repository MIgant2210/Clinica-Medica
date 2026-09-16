import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita, Paciente, Profesional, Sede, Servicio } from '../types';
import { Plus, Check, X, Calendar as CalIcon, ShieldAlert, Clock, User, Stethoscope, Building2, AlertCircle } from 'lucide-react';

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

  // Formulario nueva cita
  const [pacienteId, setPacienteId] = useState('');
  const [profesionalId, setProfesionalId] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [motivo, setMotivo] = useState('');

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

    if (!fechaInicio) {
      setErrorModal('Por favor selecciona la fecha y hora de inicio.');
      return;
    }

    const inicio = new Date(fechaInicio);
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
    PROGRAMADA: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    CONFIRMADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    ATENDIDA: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-600' },
    CANCELADA: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  };

  const duracionesSugeridas = [15, 30, 45, 60, 90, 120];
  const puedeAgendar = user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA';

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-1 border border-teal-100">
            <Clock className="h-3.5 w-3.5 text-teal-600" />
            Control Horario y Agendamiento
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Agenda y Citas Médicas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
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
      <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-sm text-slate-400">Cargando citas...</div>
        ) : citas.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            No se registran citas médicas actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100">
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
              <tbody className="divide-y divide-slate-100">
                {citas.map((c) => {
                  const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {c.paciente_nombre}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{c.motivo}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {c.profesional_nombre}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{c.servicio_nombre}</div>
                        <div className="text-xs text-slate-400">{c.sede_nombre}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {new Date(c.fecha_inicio).toLocaleString('es-GT', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
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
                              className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-all hover:scale-105"
                            >
                              <Check className="h-4 w-4 stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => handleCambiarEstado(c.id, 'CANCELADA')}
                              title="Cancelar Cita"
                              className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all hover:scale-105"
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
      {/* MODAL CREATIVO DE AGENDAMIENTO (CON SELECTORES DE DURACIÓN RÁPIDOS) */}
      {/* =================================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/60 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <CalIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Programar Cita Médica</h3>
                  <p className="text-xs text-slate-400">Verificación de disponibilidad e integridad</p>
                </div>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCrearCita} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Paciente *
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={pacienteId}
                    onChange={(e) => setPacienteId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre_completo} ({p.codigo_paciente})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Médico *
                  </label>
                  <div className="relative">
                    <Stethoscope className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={profesionalId}
                      onChange={(e) => setProfesionalId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      {profesionales.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nombre} ({prof.especialidad})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Sede de Atención *
                  </label>
                  <div className="relative">
                    <Building2 className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={sedeId}
                      onChange={(e) => setSedeId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    >
                      {sedes.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Servicio Requerido *
                </label>
                <select
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/80 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {servicios.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.nombre} (Q.{srv.precio_base})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector Visual de Duración (Regla SQA) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Duración Estimada ({duracionMinutos} min)
                  </label>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Borde: 15 a 120 min
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {duracionesSugeridas.map((min) => (
                    <button
                      type="button"
                      key={min}
                      onClick={() => setDuracionMinutos(min)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        duracionMinutos === min
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/80 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Motivo de la Cita *
                </label>
                <textarea
                  required
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describa el motivo o síntoma principal reportado por el paciente..."
                  className="w-full px-4 py-2.5 bg-slate-50/80 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-2xl font-semibold hover:bg-slate-50"
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
