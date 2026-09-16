import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente, ExpedienteClinico } from '../types';
import { FileText, Plus, Heart, Thermometer, Weight, Activity, Pill, User, X } from 'lucide-react';

export const ExpedientePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>('');
  const [pacienteActual, setPacienteActual] = useState<Paciente | null>(null);
  const [expediente, setExpediente] = useState<ExpedienteClinico | null>(null);
  const [cargando, setCargando] = useState(true);

  // Modal nueva consulta
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [examenFisico, setExamenFisico] = useState('');
  const [presion, setPresion] = useState('120/80');
  const [frecuencia, setFrecuencia] = useState(72);
  const [temperatura, setTemperatura] = useState(36.5);
  const [peso, setPeso] = useState(70);
  const [talla, setTalla] = useState(170);
  const [cie10, setCie10] = useState('J00');
  const [diagnosticoDesc, setDiagnosticoDesc] = useState('');
  const [diagnosticoTipo, setDiagnosticoTipo] = useState<'PRESUNTIVO' | 'DEFINITIVO'>('DEFINITIVO');
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [frecuenciaMedicamento, setFrecuenciaMedicamento] = useState('');
  const [duracionDias, setDuracionDias] = useState(5);
  const [notasEvolucion, setNotasEvolucion] = useState('');

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await apiClient.get('/pacientes');
        if (res.data.ok && res.data.pacientes.length > 0) {
          setPacientes(res.data.pacientes);
          const idQuery = searchParams.get('pacienteId');
          const defaultId = idQuery || (user?.pacienteId ? user.pacienteId : res.data.pacientes[0].id);
          setPacienteSeleccionadoId(defaultId);
        }
      } catch (e) {
        console.error('Error al obtener lista de pacientes:', e);
      } finally {
        setCargando(false);
      }
    };
    fetchPacientes();
  }, [searchParams, user]);

  useEffect(() => {
    if (!pacienteSeleccionadoId) return;

    const fetchExpediente = async () => {
      setCargando(true);
      try {
        const res = await apiClient.get(`/clinico/expediente/${pacienteSeleccionadoId}`);
        if (res.data.ok) {
          setExpediente(res.data.expediente);
          setPacienteActual(res.data.paciente);
        }
      } catch (e) {
        console.error('Error al cargar expediente:', e);
        setExpediente(null);
      } finally {
        setCargando(false);
      }
    };

    fetchExpediente();
  }, [pacienteSeleccionadoId]);

  const handleCrearConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente) return;

    try {
      const res = await apiClient.post('/clinico/consultas', {
        expediente_id: expediente.id,
        motivo_consulta: motivoConsulta,
        examen_fisico: examenFisico,
        signos_vitales: {
          presion,
          frecuencia_cardiaca: Number(frecuencia),
          temperatura: Number(temperatura),
          peso_kg: Number(peso),
          talla_cm: Number(talla),
        },
        diagnosticos: [
          {
            codigo_cie10: cie10,
            descripcion: diagnosticoDesc || 'Atención médica',
            tipo: diagnosticoTipo,
          },
        ],
        tratamiento: medicamento
          ? [
              {
                medicamento,
                dosis,
                frecuencia: frecuenciaMedicamento,
                duracion_dias: Number(duracionDias),
              },
            ]
          : [],
        notas_evolucion: notasEvolucion,
      });

      if (res.data.ok) {
        setModalAbierto(false);
        // Recargar expediente
        const rec = await apiClient.get(`/clinico/expediente/${pacienteSeleccionadoId}`);
        if (rec.data.ok) {
          setExpediente(rec.data.expediente);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar la consulta.');
    }
  };

  const puedeAtender = user?.rol === 'ADMIN' || user?.rol === 'MEDICO';

  return (
    <div className="space-y-6">
      {/* Selector de Paciente y Encabezado */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <FileText className="h-4 w-4" />
            Expediente Clínico Electrónico (ECE)
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Historia Médica del Paciente
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.rol !== 'PACIENTE' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Paciente:
              </label>
              <select
                value={pacienteSeleccionadoId}
                onChange={(e) => setPacienteSeleccionadoId(e.target.value)}
                className="px-3 py-2 border rounded-xl text-sm border-slate-200 bg-slate-50 focus:ring-2 focus:ring-sky-500"
              >
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_completo} ({p.codigo_paciente})
                  </option>
                ))}
              </select>
            </div>
          )}

          {puedeAtender && expediente && (
            <button
              onClick={() => setModalAbierto(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </button>
          )}
        </div>
      </div>

      {cargando ? (
        <div className="p-12 text-center text-sm text-slate-500">Cargando historial clínico...</div>
      ) : !expediente || !pacienteActual ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          No se encontró el expediente clínico.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ficha Resumen del Paciente & Antecedentes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{pacienteActual.nombre_completo}</h3>
                  <p className="text-xs font-mono text-sky-600 font-semibold">{expediente.numero_expediente}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <p><strong className="text-slate-700">Documento:</strong> {pacienteActual.documento}</p>
                <p><strong className="text-slate-700">Tipo de Sangre:</strong> {pacienteActual.tipo_sangre}</p>
                <p><strong className="text-slate-700">Teléfono:</strong> {pacienteActual.telefono}</p>
                <p><strong className="text-slate-700">Emergencia:</strong> {pacienteActual.contacto_emergencia}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Antecedentes Clínicos Registrados
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                  <span className="font-bold text-amber-800 block mb-1">Alergias</span>
                  <p className="text-amber-900">{expediente.antecedentes_alergias || 'Ninguna registrada'}</p>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
                  <span className="font-bold text-rose-800 block mb-1">Patológicos</span>
                  <p className="text-rose-900">{expediente.antecedentes_patologicos || 'Sin antecedentes'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="font-bold text-slate-700 block mb-1">Heredo-Familiares</span>
                  <p className="text-slate-600">{expediente.antecedentes_familiares || 'No referidos'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cronología de Atenciones Médicas */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Historial de Consultas Realizadas</h2>

            {expediente.consultas.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-sm text-slate-400">
                Aún no hay atenciones médicas registradas en este expediente.
              </div>
            ) : (
              expediente.consultas.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{c.motivo_consulta}</div>
                      <div className="text-xs text-slate-500">
                        Atendido por: <strong className="text-slate-700">{c.profesional_nombre}</strong>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(c.fecha_atencion).toLocaleString('es-GT', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {/* Signos Vitales */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                      <div className="flex items-center justify-center text-rose-500 gap-1 text-[11px] font-semibold">
                        <Heart className="h-3.5 w-3.5" /> P.A.
                      </div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{c.signos_vitales.presion}</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                      <div className="flex items-center justify-center text-sky-500 gap-1 text-[11px] font-semibold">
                        <Activity className="h-3.5 w-3.5" /> Pulso
                      </div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{c.signos_vitales.frecuencia_cardiaca} lpm</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                      <div className="flex items-center justify-center text-amber-500 gap-1 text-[11px] font-semibold">
                        <Thermometer className="h-3.5 w-3.5" /> Temp
                      </div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{c.signos_vitales.temperatura} °C</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                      <div className="flex items-center justify-center text-emerald-500 gap-1 text-[11px] font-semibold">
                        <Weight className="h-3.5 w-3.5" /> Peso
                      </div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{c.signos_vitales.peso_kg} kg</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
                      <div className="flex items-center justify-center text-purple-500 gap-1 text-[11px] font-semibold">
                        Talla
                      </div>
                      <div className="font-bold text-slate-800 text-xs mt-0.5">{c.signos_vitales.talla_cm} cm</div>
                    </div>
                  </div>

                  {/* Diagnósticos CIE-10 */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Diagnósticos Emitidos
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {c.diagnosticos.map((d, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs font-medium flex items-center gap-2"
                        >
                          <span className="font-mono font-bold bg-purple-200/80 px-1.5 py-0.5 rounded text-[10px]">
                            {d.codigo_cie10}
                          </span>
                          <span>{d.descripcion}</span>
                          <span className="text-[10px] text-purple-600 font-semibold">({d.tipo})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Receta Digitalizada */}
                  {c.tratamiento.length > 0 && (
                    <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100">
                      <div className="flex items-center gap-1.5 text-sky-800 font-bold text-xs mb-2">
                        <Pill className="h-4 w-4" /> Receta Médica Digitalizada
                      </div>
                      <div className="space-y-1 text-xs text-sky-950">
                        {c.tratamiento.map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-sky-100/60 pb-1">
                            <div>
                              <strong>{t.medicamento}</strong> - {t.dosis} ({t.frecuencia})
                            </div>
                            <span className="font-semibold text-sky-700">{t.duracion_dias} días</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas de Evolución */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <strong className="text-slate-800 block mb-0.5">Notas de Evolución:</strong>
                    {c.notas_evolucion}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Nueva Consulta Médica */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">Registrar Consulta Médica</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearConsulta} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo de Consulta *</label>
                <input
                  type="text"
                  required
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  placeholder="Ej. Control de hipertensión y dolor lumbar"
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Examen Físico</label>
                <input
                  type="text"
                  value={examenFisico}
                  onChange={(e) => setExamenFisico(e.target.value)}
                  placeholder="Ej. Murmullo vesicular conservado, abdomen blando no doloroso"
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Signos Vitales */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Signos Vitales</span>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">P.A.</label>
                    <input
                      type="text"
                      value={presion}
                      onChange={(e) => setPresion(e.target.value)}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Pulso</label>
                    <input
                      type="number"
                      value={frecuencia}
                      onChange={(e) => setFrecuencia(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperatura}
                      onChange={(e) => setTemperatura(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={peso}
                      onChange={(e) => setPeso(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Talla (cm)</label>
                    <input
                      type="number"
                      value={talla}
                      onChange={(e) => setTalla(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnóstico CIE-10 */}
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                <span className="text-xs font-bold text-purple-900 block">Diagnóstico (CIE-10)</span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Código CIE-10</label>
                    <input
                      type="text"
                      value={cie10}
                      onChange={(e) => setCie10(e.target.value)}
                      placeholder="J00, I10, etc."
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-500 mb-1">Descripción Diagnóstica</label>
                    <input
                      type="text"
                      required
                      value={diagnosticoDesc}
                      onChange={(e) => setDiagnosticoDesc(e.target.value)}
                      placeholder="Ej. Hipertensión esencial primaria"
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Tipo</label>
                    <select
                      value={diagnosticoTipo}
                      onChange={(e) => setDiagnosticoTipo(e.target.value as 'PRESUNTIVO' | 'DEFINITIVO')}
                      className="w-full px-2 py-1.5 border rounded-lg bg-white"
                    >
                      <option value="DEFINITIVO">Definitivo</option>
                      <option value="PRESUNTIVO">Presuntivo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Prescripción Médica */}
              <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-2">
                <span className="text-xs font-bold text-sky-900 block">Receta Médica Digital</span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Medicamento</label>
                    <input
                      type="text"
                      value={medicamento}
                      onChange={(e) => setMedicamento(e.target.value)}
                      placeholder="Ej. Losartán 50mg"
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Dosis</label>
                    <input
                      type="text"
                      value={dosis}
                      onChange={(e) => setDosis(e.target.value)}
                      placeholder="1 tableta"
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Frecuencia</label>
                    <input
                      type="text"
                      value={frecuenciaMedicamento}
                      onChange={(e) => setFrecuenciaMedicamento(e.target.value)}
                      placeholder="Cada 12 horas"
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Duración (Días)</label>
                    <input
                      type="number"
                      value={duracionDias}
                      onChange={(e) => setDuracionDias(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas de Evolución</label>
                <textarea
                  rows={2}
                  value={notasEvolucion}
                  onChange={(e) => setNotasEvolucion(e.target.value)}
                  placeholder="Observaciones y plan de seguimiento clínico..."
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20"
                >
                  Guardar Consulta en ECE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
