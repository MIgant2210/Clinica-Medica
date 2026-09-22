import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente, ExpedienteClinico } from '../types';
import { 
  FileText, Plus, Heart, Thermometer, Weight, Activity, Pill, User, X, 
  Stethoscope, Clock, AlertTriangle, ShieldCheck, ChevronDown
} from 'lucide-react';
import { MedicalAICopilot } from '../components/MedicalAICopilot';

export const ExpedientePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'HISTORIAL' | 'MATERNIDAD'>('HISTORIAL');
  const [pacienteActual, setPacienteActual] = useState<Paciente | null>(null);
  const [expediente, setExpediente] = useState<ExpedienteClinico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

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
                dosis: dosis || '1 dosis',
                frecuencia: frecuenciaMedicamento || 'Cada 8 horas',
                duracion_dias: Number(duracionDias),
              },
            ]
          : [],
        notas_evolucion: notasEvolucion,
      });

      if (res.data.ok) {
        setModalAbierto(false);
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
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-bold mb-1 border border-teal-100 dark:border-teal-800">
            <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            Expediente Clínico Electrónico (ECE)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Historia Médica del Paciente
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.rol !== 'PACIENTE' && (
            <div className="flex items-center gap-3 relative z-20">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Paciente
              </label>
              
              <div className="relative min-w-[280px]">
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 hover:bg-slate-100/50 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-200/60 dark:border-slate-700/60 rounded-[1.25rem] text-sm shadow-sm transition-all text-slate-800 dark:text-slate-100 flex items-center justify-between gap-3 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10"
                >
                  <span className="font-bold truncate">
                    {pacientes.find(p => p.id === pacienteSeleccionadoId)?.nombre_completo || 'Seleccionar paciente...'} 
                    <span className="ml-2 font-mono text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md">
                      {pacientes.find(p => p.id === pacienteSeleccionadoId)?.codigo_paciente}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isSelectOpen ? 'rotate-180 text-teal-500' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isSelectOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsSelectOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white/90 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-[1.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {pacientes.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setPacienteSeleccionadoId(p.id);
                              setIsSelectOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${
                              pacienteSeleccionadoId === p.id 
                                ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <span>{p.nombre_completo}</span>
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                              pacienteSeleccionadoId === p.id 
                                ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                            }`}>
                              {p.codigo_paciente}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {puedeAtender && expediente && (
            <button
              onClick={() => setModalAbierto(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-500/25 transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Nueva Consulta
            </button>
          )}
        </div>
      </div>

      {cargando ? (
        <div className="p-12 text-center text-sm text-slate-400">Cargando historial clínico...</div>
      ) : !expediente || !pacienteActual ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800">
          No se encontró el expediente clínico.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TABS DE NAVEGACIÓN */}
          <div className="flex gap-2 p-1.5 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[1.25rem] w-fit shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('HISTORIAL')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'HISTORIAL'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" /> Historial General
            </button>
            {pacienteActual.sexo === 'FEMENINO' && (
              <button
                onClick={() => setActiveTab('MATERNIDAD')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'MATERNIDAD'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20 ring-1 ring-pink-500/50'
                    : 'text-pink-600/70 dark:text-pink-400/70 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:text-pink-600 dark:hover:text-pink-400'
                }`}
              >
                <span className="text-base">🤰</span> Maternidad
              </button>
            )}
          </div>

          {activeTab === 'HISTORIAL' ? (
            <>
              {/* Tarjetas de Ficha Técnica y Antecedentes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Ficha Resumen Paciente */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-100 dark:from-emerald-950/60 to-teal-50 dark:to-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold border border-teal-200/60 dark:border-teal-800/60 shadow-inner">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                      {pacienteActual.nombre_completo}
                    </h3>
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md mt-1 inline-block border border-teal-100 dark:border-teal-900">
                      {expediente.numero_expediente}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Documento:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{pacienteActual.documento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Tipo de Sangre:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/60">
                      {pacienteActual.tipo_sangre}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Teléfono:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{pacienteActual.telefono}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Emergencia:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {pacienteActual.contacto_emergencia}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Expediente Activo</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

            {/* Antecedentes Clínicos */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Antecedentes Médicos Registrados</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/40 hover:shadow-sm transition-shadow">
                    <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1 mb-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Alergias Conocidas
                    </span>
                    <p className="text-rose-950 dark:text-rose-200 font-medium leading-relaxed">
                      {expediente.antecedentes_alergias || 'Ninguna alergia registrada'}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/40 hover:shadow-sm transition-shadow">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Antecedentes Patológicos
                    </span>
                    <p className="text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                      {expediente.antecedentes_patologicos || 'Sin antecedentes crónicos'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 hover:shadow-sm transition-shadow">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Heredo-Familiares
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {expediente.antecedentes_familiares || 'No referidos por el paciente'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Norma Técnica de Registro Clínico</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold font-mono text-[10px]">CIE-10 / HIPAA Ready</span>
              </div>
            </div>

          </div>

          {/* Cronología de Consultas Realizadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Cronología de Atenciones Médicas</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold text-slate-600 dark:text-slate-400">
                  {expediente.consultas.length}
                </span>
              </h2>
            </div>

            {expediente.consultas.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[32px] border border-slate-200/80 dark:border-slate-800 text-center text-sm text-slate-400">
                Aún no hay consultas médicas registradas en este expediente.
              </div>
            ) : (
              expediente.consultas.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{c.motivo_consulta}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Facultativo: <strong className="text-slate-800 dark:text-slate-200">{c.profesional_nombre}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span>
                        {new Date(c.fecha_atencion).toLocaleString('es-GT', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Medidores de Signos Vitales (Vibrantes) */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-rose-50/60 dark:bg-rose-950/25 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center">
                      <div className="flex items-center justify-center text-rose-600 dark:text-rose-400 gap-1 text-xs font-bold">
                        <Heart className="h-3.5 w-3.5 fill-current" /> P.A.
                      </div>
                      <div className="font-black text-rose-950 dark:text-rose-200 text-sm mt-0.5">{c.signos_vitales.presion}</div>
                      <span className="text-[10px] text-rose-500 dark:text-rose-400">mmHg</span>
                    </div>

                    <div className="bg-sky-50/60 dark:bg-sky-950/25 p-3 rounded-2xl border border-sky-100 dark:border-sky-900/40 text-center">
                      <div className="flex items-center justify-center text-sky-600 dark:text-sky-400 gap-1 text-xs font-bold">
                        <Activity className="h-3.5 w-3.5" /> Pulso
                      </div>
                      <div className="font-black text-sky-950 dark:text-sky-200 text-sm mt-0.5">{c.signos_vitales.frecuencia_cardiaca}</div>
                      <span className="text-[10px] text-sky-500 dark:text-sky-400">lpm</span>
                    </div>

                    <div className="bg-amber-50/60 dark:bg-amber-950/25 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-center">
                      <div className="flex items-center justify-center text-amber-600 dark:text-amber-400 gap-1 text-xs font-bold">
                        <Thermometer className="h-3.5 w-3.5" /> Temp
                      </div>
                      <div className="font-black text-amber-950 dark:text-amber-200 text-sm mt-0.5">{c.signos_vitales.temperatura} °C</div>
                      <span className="text-[10px] text-amber-500 dark:text-amber-400">Axilar</span>
                    </div>

                    <div className="bg-emerald-50/60 dark:bg-emerald-950/25 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                      <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 gap-1 text-xs font-bold">
                        <Weight className="h-3.5 w-3.5" /> Peso
                      </div>
                      <div className="font-black text-emerald-950 dark:text-emerald-200 text-sm mt-0.5">{c.signos_vitales.peso_kg} kg</div>
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400">Masa</span>
                    </div>

                    <div className="bg-purple-50/60 dark:bg-purple-950/25 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center">
                      <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 gap-1 text-xs font-bold">
                        Talla
                      </div>
                      <div className="font-black text-purple-950 dark:text-purple-200 text-sm mt-0.5">{c.signos_vitales.talla_cm} cm</div>
                      <span className="text-[10px] text-purple-500 dark:text-purple-400">Estatura</span>
                    </div>
                  </div>

                  {/* Diagnósticos con Codificación CIE-10 */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                      Diagnósticos Dictaminados
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {c.diagnosticos.map((d, i) => (
                        <div
                          key={i}
                          className="px-3.5 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 text-purple-950 dark:text-purple-200 text-xs font-semibold flex items-center gap-2.5 shadow-sm"
                        >
                          <span className="font-mono font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2 py-0.5 rounded-lg text-[11px]">
                            {d.codigo_cie10}
                          </span>
                          <span>{d.descripcion}</span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-black tracking-wider">
                            ({d.tipo})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Receta Médica Digitalizada */}
                  {c.tratamiento.length > 0 && (
                    <div className="bg-gradient-to-br from-teal-50/60 to-emerald-50/40 dark:from-teal-950/30 dark:to-emerald-950/20 p-5 rounded-3xl border border-teal-200/70 dark:border-teal-800/70 relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
                          <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Receta Médica Digitalizada</span>
                        </div>
                        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 px-2.5 py-0.5 rounded-full">
                          Válida en Farmacia
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {c.tratamiento.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/90 dark:bg-slate-800/90 p-3 rounded-2xl border border-teal-100 dark:border-teal-900/50 gap-1.5"
                          >
                            <div>
                              <strong className="text-slate-900 dark:text-white text-sm">{t.medicamento}</strong>
                              <span className="text-slate-500 dark:text-slate-400 ml-2 font-medium">
                                {t.dosis} &bull; {t.frecuencia}
                              </span>
                            </div>
                            <span className="font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800 shrink-0 text-right">
                              {t.duracion_dias} días de tratamiento
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas de Evolución */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1 font-bold">
                      Notas Clínicas de Evolución:
                    </strong>
                    <p className="leading-relaxed">{c.notas_evolucion}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          </>
          ) : (
            /* ======================================================== */
            /* VISTA DE MATERNIDAD (CONTROL PRENATAL)                    */
            /* ======================================================== */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 p-6 sm:p-8 rounded-[32px] border border-pink-200/60 dark:border-pink-900/40 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/10 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-pink-900 dark:text-pink-300 tracking-tight flex items-center gap-2">
                        <span className="text-3xl">🤰</span> Control Prenatal y Maternidad
                      </h2>
                      <p className="text-sm font-medium text-pink-700/80 dark:text-pink-400/80 mt-1">
                        Programa integral de seguimiento obstétrico para paciente femenina
                      </p>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-pink-100 dark:border-pink-900/30 flex items-center gap-4">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado Actual</span>
                        <span className="font-bold text-slate-900 dark:text-white">Embarazo Activo</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Semanas de Gestación</span>
                        <span className="font-black text-pink-600 dark:text-pink-400 text-lg">24.5 SDG</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                      <span className="block text-xs font-bold text-pink-700/70 dark:text-pink-400/70 uppercase mb-1">Fecha de Última Menstruación (FUM)</span>
                      <span className="font-bold text-slate-900 dark:text-white text-base">14 Abril, 2026</span>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                      <span className="block text-xs font-bold text-pink-700/70 dark:text-pink-400/70 uppercase mb-1">Fecha Probable de Parto (FPP)</span>
                      <span className="font-bold text-slate-900 dark:text-white text-base">20 Enero, 2027</span>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                      <span className="block text-xs font-bold text-pink-700/70 dark:text-pink-400/70 uppercase mb-1">Trimestre Actual</span>
                      <span className="font-bold text-slate-900 dark:text-white text-base">Segundo Trimestre</span>
                    </div>
                  </div>

                  {/* Línea de Tiempo del Control Prenatal */}
                  <h3 className="text-sm font-black text-pink-900 dark:text-pink-300 uppercase tracking-wider mb-4 border-b border-pink-200/50 dark:border-pink-900/50 pb-2">
                    Cronograma de Chequeos Prenatales
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { num: 1, semana: 'Semana 8-12', estado: 'COMPLETADO', fecha: '28 Mayo, 2026', notas: 'Ultrasonido transvaginal normal. Actividad cardíaca fetal (+).' },
                      { num: 2, semana: 'Semana 16-20', estado: 'COMPLETADO', fecha: '15 Julio, 2026', notas: 'Ultrasonido estructural anatómico. Desarrollo morfológico adecuado.' },
                      { num: 3, semana: 'Semana 24-28', estado: 'PROGRAMADO', fecha: '25 Septiembre, 2026', notas: 'Prueba de tolerancia oral a la glucosa y control de peso.' },
                      { num: 4, semana: 'Semana 32-34', estado: 'PENDIENTE', fecha: '---', notas: 'Evaluación de crecimiento fetal y presentación.' },
                      { num: 5, semana: 'Semana 36-38', estado: 'PENDIENTE', fecha: '---', notas: 'Cultivo estreptococo grupo B y planeación de vía de resolución.' },
                    ].map((c) => (
                      <div key={c.num} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        c.estado === 'COMPLETADO' ? 'bg-white/60 dark:bg-slate-900/40 border-emerald-200/60 dark:border-emerald-900/40' :
                        c.estado === 'PROGRAMADO' ? 'bg-pink-50 dark:bg-pink-950/30 border-pink-300 dark:border-pink-800 ring-1 ring-pink-500/20' :
                        'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 opacity-70'
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            c.estado === 'COMPLETADO' ? 'bg-emerald-500 text-white' :
                            c.estado === 'PROGRAMADO' ? 'bg-pink-500 text-white' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {c.estado === 'COMPLETADO' ? '✓' : c.num}
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">{c.semana}</strong>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{c.notas}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-1 block w-fit ml-auto ${
                            c.estado === 'COMPLETADO' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' :
                            c.estado === 'PROGRAMADO' ? 'bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-300' :
                            'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {c.estado}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{c.fecha}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Nueva Consulta Médica */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Registrar Consulta Médica</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Emisión de diagnóstico y prescripción</p>
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearConsulta} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Motivo de Consulta *
                </label>
                <input
                  type="text"
                  required
                  value={motivoConsulta}
                  onChange={(e) => setMotivoConsulta(e.target.value)}
                  placeholder="Ej. Chequeo preventivo, cefalea moderada y malestar general"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Examen Físico
                </label>
                <input
                  type="text"
                  value={examenFisico}
                  onChange={(e) => setExamenFisico(e.target.value)}
                  placeholder="Ej. Murmullo vesicular conservado, campos pulmonares limpios"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Signos Vitales */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  Signos Vitales
                </span>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">P.A.</label>
                    <input
                      type="text"
                      value={presion}
                      onChange={(e) => setPresion(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Pulso</label>
                    <input
                      type="number"
                      value={frecuencia}
                      onChange={(e) => setFrecuencia(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperatura}
                      onChange={(e) => setTemperatura(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={peso}
                      onChange={(e) => setPeso(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Talla (cm)</label>
                    <input
                      type="number"
                      value={talla}
                      onChange={(e) => setTalla(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnóstico CIE-10 */}
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/25 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block uppercase tracking-wider">
                  Diagnóstico (Estándar CIE-10)
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Código</label>
                    <input
                      type="text"
                      value={cie10}
                      onChange={(e) => setCie10(e.target.value)}
                      placeholder="J00, I10"
                      className="w-full px-3 py-2 border border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
                    <input
                      type="text"
                      required
                      value={diagnosticoDesc}
                      onChange={(e) => setDiagnosticoDesc(e.target.value)}
                      placeholder="Ej. Faringitis aguda"
                      className="w-full px-3 py-2 border border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div className="col-span-4 mt-1">
                    <label className="block text-slate-500 dark:text-slate-400 mb-2">Tipo de Diagnóstico</label>
                    <div className="flex bg-purple-100/50 dark:bg-purple-900/30 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setDiagnosticoTipo('DEFINITIVO')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          diagnosticoTipo === 'DEFINITIVO'
                            ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                            : 'text-purple-600/70 dark:text-purple-400/70 hover:text-purple-700 dark:hover:text-purple-300'
                        }`}
                      >
                        Definitivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagnosticoTipo('PRESUNTIVO')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          diagnosticoTipo === 'PRESUNTIVO'
                            ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                            : 'text-purple-600/70 dark:text-purple-400/70 hover:text-purple-700 dark:hover:text-purple-300'
                        }`}
                      >
                        Presuntivo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescripción Médica */}
              <div className="p-4 bg-teal-50/60 dark:bg-teal-950/25 rounded-2xl border border-teal-100 dark:border-teal-900/40 space-y-2">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300 block uppercase tracking-wider">
                  Receta Médica Digitalizada
                </span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Medicamento</label>
                    <input
                      type="text"
                      value={medicamento}
                      onChange={(e) => setMedicamento(e.target.value)}
                      placeholder="Ej. Amoxicilina 500mg"
                      className="w-full px-3 py-2 border border-teal-200 dark:border-teal-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Dosis</label>
                    <input
                      type="text"
                      value={dosis}
                      onChange={(e) => setDosis(e.target.value)}
                      placeholder="1 cápsula"
                      className="w-full px-3 py-2 border border-teal-200 dark:border-teal-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Frecuencia</label>
                    <input
                      type="text"
                      value={frecuenciaMedicamento}
                      onChange={(e) => setFrecuenciaMedicamento(e.target.value)}
                      placeholder="Cada 8 horas"
                      className="w-full px-3 py-2 border border-teal-200 dark:border-teal-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Duración (Días)</label>
                    <input
                      type="number"
                      value={duracionDias}
                      onChange={(e) => setDuracionDias(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-teal-200 dark:border-teal-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Notas de Evolución y Recomendaciones
                </label>
                <textarea
                  rows={2}
                  value={notasEvolucion}
                  onChange={(e) => setNotasEvolucion(e.target.value)}
                  placeholder="Plan terapéutico, observaciones y recomendaciones al paciente..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-2xl border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25 active:scale-95 transition-all"
                >
                  Guardar Consulta en ECE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IA Copilot Integration */}
      {expediente && pacienteActual && (
        <MedicalAICopilot expediente={expediente} paciente={pacienteActual} />
      )}
    </div>
  );
};
