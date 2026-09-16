import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Cita, Paciente, Profesional, Sede, Servicio } from '../types';
import { Plus, Check, X, Calendar as CalIcon, ShieldAlert } from 'lucide-react';

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

  const estadoBadgeClass: Record<string, string> = {
    PROGRAMADA: 'bg-sky-50 text-sky-700 border-sky-200',
    CONFIRMADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ATENDIDA: 'bg-slate-100 text-slate-700 border-slate-200',
    CANCELADA: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const puedeAgendar = user?.rol === 'ADMIN' || user?.rol === 'RECEPCIONISTA';

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agenda y Citas Médicas</h1>
          <p className="text-sm text-slate-500">
            Control de turnos, verificación de traslapes y reglas de borde (15 a 120 min)
          </p>
        </div>

        {puedeAgendar && (
          <button
            onClick={() => setModalAbierto(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Cita Médica
          </button>
        )}
      </div>

      {/* Tabla de Citas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-sm text-slate-500">Cargando citas...</div>
        ) : citas.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No se registran citas médicas actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Médico</th>
                  <th className="px-6 py-3.5">Sede y Servicio</th>
                  <th className="px-6 py-3.5">Horario</th>
                  <th className="px-6 py-3.5">Duración</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.paciente_nombre}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{c.motivo}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{c.profesional_nombre}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{c.servicio_nombre}</div>
                      <div className="text-xs text-slate-400">{c.sede_nombre}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {new Date(c.fecha_inicio).toLocaleString('es-GT', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{c.duracion_minutos} min</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          estadoBadgeClass[c.estado] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {c.estado === 'PROGRAMADA' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCambiarEstado(c.id, 'CONFIRMADA')}
                            title="Confirmar Cita"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(c.id, 'CANCELADA')}
                            title="Cancelar Cita"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {c.estado === 'CONFIRMADA' && user?.rol === 'MEDICO' && (
                        <button
                          onClick={() => handleCambiarEstado(c.id, 'ATENDIDA')}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
                        >
                          Marcar Atendida
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Agendar Nueva Cita */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <CalIcon className="h-5 w-5 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Agendar Cita Médica</h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCrearCita} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paciente</label>
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                >
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo} ({p.codigo_paciente})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Médico</label>
                  <select
                    value={profesionalId}
                    onChange={(e) => setProfesionalId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    {profesionales.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nombre} ({prof.especialidad})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sede</label>
                  <select
                    value={sedeId}
                    onChange={(e) => setSedeId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Servicio</label>
                  <select
                    value={servicioId}
                    onChange={(e) => setServicioId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    {servicios.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={duracionMinutos}
                    onChange={(e) => setDuracionMinutos(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400">Regla SQA: 15 a 120 min</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha y Hora de Inicio
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de Consulta
                </label>
                <textarea
                  required
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Síntomas, chequeo de rutina, dolor, etc."
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-md shadow-sky-600/20"
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
