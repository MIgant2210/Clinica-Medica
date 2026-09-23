import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente, ExpedienteClinico } from '../types';
import { 
  Stethoscope, Clock, User, FileText, Plus, Heart, 
  X, AlertTriangle, 
  ChevronDown, Baby, PhoneCall, Video, Phone
} from 'lucide-react';
import Select from 'react-select';
import { MedicalAICopilot } from '../components/MedicalAICopilot';
import { useContextoClinico } from '../hooks/useContextoClinico';

const CIE10_OPTIONS = [
  { value: 'J00|Rinofaringitis aguda (resfriado común)', label: 'J00 - Rinofaringitis aguda (resfriado común)' },
  { value: 'J02.9|Faringitis aguda, no especificada', label: 'J02.9 - Faringitis aguda, no especificada' },
  { value: 'J03.9|Amigdalitis aguda, no especificada', label: 'J03.9 - Amigdalitis aguda, no especificada' },
  { value: 'J20.9|Bronquitis aguda, no especificada', label: 'J20.9 - Bronquitis aguda, no especificada' },
  { value: 'I10|Hipertensión esencial (primaria)', label: 'I10 - Hipertensión esencial (primaria)' },
  { value: 'E11.9|Diabetes mellitus tipo 2 sin complicaciones', label: 'E11.9 - Diabetes mellitus tipo 2' },
  { value: 'A09.9|Gastroenteritis y colitis de origen no especificado', label: 'A09.9 - Gastroenteritis' }
];

export const ExpedientePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const pacienteQueryId = searchParams.get('pacienteId');

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string | null>(pacienteQueryId);
  const [expediente, setExpediente] = useState<ExpedienteClinico | null>(null);
  const [cargando, setCargando] = useState(false);
  
  // UI States
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Nueva Consulta States
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [notasEvolucion, setNotasEvolucion] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState<'GENERAL' | 'PEDIATRICA' | 'MATERNIDAD'>('GENERAL');
  const [modalidad, setModalidad] = useState<'PRESENCIAL' | 'LLAMADA' | 'TELEMEDICINA'>('PRESENCIAL');
  const [diagnosticoDesc, setDiagnosticoDesc] = useState('');
  const [diagnosticoTipo, setDiagnosticoTipo] = useState<'PRESUNTIVO' | 'DEFINITIVO'>('PRESUNTIVO');
  const [diagnosticoCie10, setDiagnosticoCie10] = useState('');
  
  // Signos Vitales
  const [presion, setPresion] = useState('120/80');
  const [frecuencia, setFrecuencia] = useState(70);
  const [temperatura, setTemperatura] = useState(36.5);
  const [peso, setPeso] = useState(70);
  const [talla, setTalla] = useState(170);
  
  // Pediatría
  const [perimetroCefalico, setPerimetroCefalico] = useState('');
  
  // Maternidad
  const [semanasGestacion, setSemanasGestacion] = useState('');
  const [alturaUterina, setAlturaUterina] = useState('');
  const [movimientosFetales, setMovimientosFetales] = useState('POSITIVO');
  const [fcf, setFcf] = useState('');

  // Remoto
  const [duracionLlamada, setDuracionLlamada] = useState(0);

  // Tratamiento
  const [medicamento, setMedicamento] = useState('');
  const [dosis, setDosis] = useState('');
  const [frecuenciaMed, setFrecuenciaMed] = useState('');
  const [tratamientos, setTratamientos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const res = await apiClient.get('/pacientes');
        if (res.data.ok) {
          setPacientes(res.data.pacientes);
          if (!pacienteSeleccionadoId && res.data.pacientes.length > 0 && user?.rol !== 'PACIENTE') {
            setPacienteSeleccionadoId(res.data.pacientes[0].id);
          }
        }
      } catch (err) {
        console.error('Error cargando pacientes:', err);
      }
    };
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (user?.rol === 'PACIENTE' && user?.pacienteId) {
      setPacienteSeleccionadoId(user.pacienteId);
    }
  }, [user]);

  useEffect(() => {
    if (!pacienteSeleccionadoId) return;
    const fetchExpediente = async () => {
      setCargando(true);
      try {
        const res = await apiClient.get(`/clinico/expediente/${pacienteSeleccionadoId}`);
        if (res.data.ok) {
          setExpediente(res.data.expediente);
        }
      } catch (err) {
        console.error('Error cargando expediente:', err);
        setExpediente(null);
      } finally {
        setCargando(false);
      }
    };
    fetchExpediente();
  }, [pacienteSeleccionadoId]);

  const pacienteActual = pacientes.find(p => p.id === pacienteSeleccionadoId);
  const { edadFormateada, esPediatrico, esMujer } = useContextoClinico(pacienteActual?.fecha_nacimiento, pacienteActual?.sexo);

  const agregarTratamiento = () => {
    if (!medicamento) return;
    setTratamientos([...tratamientos, { medicamento, dosis, frecuencia: frecuenciaMed, duracion_dias: 7 }]);
    setMedicamento('');
    setDosis('');
    setFrecuenciaMed('');
  };

  const guardarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente) return;

    const nuevaConsulta = {
      expediente_id: expediente.id,
      motivo_consulta: motivoConsulta,
      notas_evolucion: notasEvolucion,
      tipo_consulta: tipoConsulta,
      modalidad,
      signos_vitales: {
        presion, frecuencia_cardiaca: frecuencia, temperatura, peso_kg: peso, talla_cm: talla
      },
      diagnosticos: [
        {
          codigo_cie10: diagnosticoCie10 || 'Z00.0',
          descripcion: diagnosticoDesc || 'Examen médico general',
          tipo: diagnosticoTipo
        }
      ],
      tratamiento: tratamientos,
      datos_obstetricos: tipoConsulta === 'MATERNIDAD' ? {
        semanas_gestacion: semanasGestacion,
        altura_uterina: alturaUterina,
        movimientos_fetales: movimientosFetales,
        fcf
      } : {},
      datos_pediatricos: tipoConsulta === 'PEDIATRICA' ? {
        perimetro_cefalico: perimetroCefalico
      } : {},
      datos_remotos: modalidad !== 'PRESENCIAL' ? {
        duracion_minutos: duracionLlamada
      } : {}
    };

    try {
      const res = await apiClient.post('/clinico/consultas', nuevaConsulta);
      if (res.data.ok) {
        setModalAbierto(false);
        // Refresh
        const rec = await apiClient.get(`/clinico/expediente/${pacienteSeleccionadoId}`);
        if (rec.data.ok) setExpediente(rec.data.expediente);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar la consulta.');
    }
  };

  const puedeAtender = user?.rol === 'ADMIN' || user?.rol === 'MEDICO';

  return (
    <div className="space-y-6">
      {/* Selector de Paciente y Encabezado */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-1 border border-teal-100">
            <FileText className="h-3.5 w-3.5" /> ECE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Historia Médica del Paciente
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.rol !== 'PACIENTE' && (
            <div className="relative z-20">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-2">Paciente</label>
              <button onClick={() => setIsSelectOpen(!isSelectOpen)} className="px-5 py-3.5 bg-slate-50 border rounded-2xl text-sm font-bold flex gap-3 items-center">
                {pacienteActual?.nombre_completo || 'Seleccionar...'}
                <ChevronDown className="w-4 h-4" />
              </button>
              {isSelectOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border shadow-xl rounded-xl p-2 z-50 max-h-64 overflow-y-auto">
                  {pacientes.map(p => (
                    <button key={p.id} onClick={() => { setPacienteSeleccionadoId(p.id); setIsSelectOpen(false); }} className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-sm font-bold">
                      {p.nombre_completo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {puedeAtender && expediente && (
            <button onClick={() => setModalAbierto(true)} className="px-5 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nueva Consulta
            </button>
          )}
        </div>
      </div>

      {cargando ? (
        <div className="p-12 text-center text-sm text-slate-400">Cargando...</div>
      ) : expediente && pacienteActual ? (
        <div className="space-y-6">
          
          {/* PANEL INTELIGENTE - RESUMEN CLINICO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-black text-lg">{pacienteActual.nombre_completo}</h3>
                  <p className="text-slate-500 text-sm font-bold">{edadFormateada} &bull; {pacienteActual.sexo}</p>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <span className="text-xs font-black text-red-600 block uppercase">Alergias</span>
                  <span className="text-sm font-bold text-red-800 dark:text-red-300">{expediente.antecedentes_alergias || 'Ninguna registrada'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs font-black text-slate-500 block uppercase">Patológicos</span>
                  <span className="text-sm font-bold">{expediente.antecedentes_patologicos || 'Sin antecedentes'}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Bloque Pediátrico Condicional */}
              {esPediatrico && (
                <div className="bg-sky-50 dark:bg-sky-900/20 rounded-[2rem] p-6 border border-sky-100 dark:border-sky-800">
                  <h3 className="font-black text-sky-800 dark:text-sky-300 flex items-center gap-2 mb-3">
                    <Baby className="w-5 h-5" /> Desarrollo Pediátrico
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-sky-700">Estado de Vacunación</span>
                      <span className="bg-sky-200 text-sky-800 px-2 rounded-md font-bold text-xs">Al día</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-sky-700">Último Crecimiento</span>
                      <span className="text-sky-900 font-bold text-xs">Percentil 50</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloque Obstétrico Condicional */}
              {esMujer && (
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-[2rem] p-6 border border-pink-100 dark:border-pink-800">
                  <h3 className="font-black text-pink-800 dark:text-pink-300 flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5" /> Salud Femenina / Maternidad
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs text-pink-700 font-bold">Gestaciones previas: 0</p>
                    <p className="text-xs text-pink-700 font-bold">FUM: No registrada</p>
                  </div>
                  <button onClick={() => setModalAbierto(true)} className="mt-3 w-full py-2 bg-pink-100 text-pink-700 font-bold text-xs rounded-xl hover:bg-pink-200 transition-colors">
                    Iniciar Control Prenatal
                  </button>
                </div>
              )}

              {/* Historial de Consultas Rápido */}
              <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 ${!esPediatrico && !esMujer ? 'col-span-2' : ''}`}>
                <h3 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-teal-500" /> Últimas Consultas
                </h3>
                <div className="space-y-3">
                  {expediente.consultas?.slice(0, 3).map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-sky-600">{new Date(c.fecha_atencion).toLocaleDateString()}</span>
                        <span className="text-[10px] font-black uppercase bg-slate-100 px-2 rounded-md">{c.tipo_consulta || 'GENERAL'}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-1 truncate">{c.motivo_consulta}</p>
                    </div>
                  ))}
                  {(!expediente.consultas || expediente.consultas.length === 0) && (
                    <p className="text-xs text-slate-500 font-bold text-center py-4">No hay consultas registradas</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-sm text-slate-400">Selecciona un paciente para ver su expediente.</div>
      )}

      {/* Modal Nueva Consulta Dinámico */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Stethoscope className="text-sky-500 w-6 h-6" /> Registro de Consulta
              </h2>
              <button onClick={() => setModalAbierto(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={guardarConsulta} className="p-6 space-y-8">
              
              {/* TIPO DE CONSULTA Y MODALIDAD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">Tipo de Consulta</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTipoConsulta('GENERAL')} className={`flex-1 py-2 text-xs font-bold rounded-xl border ${tipoConsulta === 'GENERAL' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'border-slate-200'}`}>General</button>
                    {esPediatrico && <button type="button" onClick={() => setTipoConsulta('PEDIATRICA')} className={`flex-1 py-2 text-xs font-bold rounded-xl border ${tipoConsulta === 'PEDIATRICA' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'border-slate-200'}`}>Pediátrica</button>}
                    {esMujer && <button type="button" onClick={() => setTipoConsulta('MATERNIDAD')} className={`flex-1 py-2 text-xs font-bold rounded-xl border ${tipoConsulta === 'MATERNIDAD' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'border-slate-200'}`}>Maternidad</button>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">Modalidad</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setModalidad('PRESENCIAL')} className={`flex-1 flex flex-col items-center py-2 text-xs font-bold rounded-xl border ${modalidad === 'PRESENCIAL' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200'}`}><User className="w-4 h-4 mb-1"/>Presencial</button>
                    <button type="button" onClick={() => setModalidad('LLAMADA')} className={`flex-1 flex flex-col items-center py-2 text-xs font-bold rounded-xl border ${modalidad === 'LLAMADA' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200'}`}><Phone className="w-4 h-4 mb-1"/>Llamada</button>
                    <button type="button" onClick={() => setModalidad('TELEMEDICINA')} className={`flex-1 flex flex-col items-center py-2 text-xs font-bold rounded-xl border ${modalidad === 'TELEMEDICINA' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200'}`}><Video className="w-4 h-4 mb-1"/>Telemedicina</button>
                  </div>
                </div>
              </div>

              {/* UIs CONTEXTUALES DE MODALIDAD */}
              {modalidad === 'TELEMEDICINA' && (
                <div className="bg-indigo-900 text-white p-6 rounded-2xl flex flex-col items-center justify-center border border-indigo-700 shadow-inner space-y-4">
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="font-bold tracking-widest uppercase text-sm">Sala Virtual Activa</span>
                  </div>
                  <div className="text-center max-w-md">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-indigo-200">Aviso: La evaluación remota tiene limitaciones clínicas. Recuerde solicitar consentimiento informado y registrar si la calidad del video es aceptable para emitir diagnóstico.</p>
                  </div>
                </div>
              )}

              {modalidad === 'LLAMADA' && (
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-purple-900 flex items-center gap-2"><PhoneCall className="w-5 h-5"/> Centro de Llamadas</h4>
                    <p className="text-xs text-purple-700 font-bold mt-1">Registrando atención telefónica para {pacienteActual?.nombre_completo}</p>
                  </div>
                  <div className="text-right">
                    <label className="text-[10px] font-black uppercase text-purple-600 block mb-1">Duración (minutos)</label>
                    <input type="number" value={duracionLlamada} onChange={e => setDuracionLlamada(Number(e.target.value))} className="w-20 px-3 py-2 rounded-xl text-center font-bold border border-purple-300 outline-none" />
                  </div>
                </div>
              )}

              {/* DATOS COMUNES */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Motivo de Consulta *</label>
                  <input type="text" required value={motivoConsulta} onChange={e => setMotivoConsulta(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500" placeholder="Ej. Dolor de cabeza persistente"/>
                </div>
                
                <div className="grid grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-center mb-1">Presión</label>
                    <input type="text" value={presion} onChange={e => setPresion(e.target.value)} className="w-full p-2 text-center font-bold text-sm border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-center mb-1">Pulso</label>
                    <input type="number" value={frecuencia} onChange={e => setFrecuencia(Number(e.target.value))} className="w-full p-2 text-center font-bold text-sm border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-center mb-1">Temp(°C)</label>
                    <input type="number" step="0.1" value={temperatura} onChange={e => setTemperatura(Number(e.target.value))} className="w-full p-2 text-center font-bold text-sm border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-center mb-1">Peso(kg)</label>
                    <input type="number" step="0.1" value={peso} onChange={e => setPeso(Number(e.target.value))} className="w-full p-2 text-center font-bold text-sm border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-center mb-1">Talla(cm)</label>
                    <input type="number" value={talla} onChange={e => setTalla(Number(e.target.value))} className="w-full p-2 text-center font-bold text-sm border rounded-lg" />
                  </div>
                </div>
              </div>

              {/* UIs CONTEXTUALES CLÍNICAS */}
              {tipoConsulta === 'PEDIATRICA' && (
                <div className="bg-sky-50 border border-sky-200 p-5 rounded-2xl">
                  <h4 className="font-black text-sky-900 mb-3 flex items-center gap-2"><Baby className="w-5 h-5"/> Parámetros Pediátricos</h4>
                  <div>
                    <label className="block text-xs font-bold text-sky-800 mb-1">Perímetro Cefálico (cm)</label>
                    <input type="number" step="0.1" value={perimetroCefalico} onChange={e => setPerimetroCefalico(e.target.value)} className="w-32 p-2 font-bold text-sm border border-sky-300 rounded-lg" />
                  </div>
                </div>
              )}

              {tipoConsulta === 'MATERNIDAD' && (
                <div className="bg-pink-50 border border-pink-200 p-5 rounded-2xl grid grid-cols-2 gap-4">
                  <div className="col-span-2"><h4 className="font-black text-pink-900 flex items-center gap-2"><Heart className="w-5 h-5"/> Control Prenatal Obstétrico</h4></div>
                  <div>
                    <label className="block text-xs font-bold text-pink-800 mb-1">Semanas de Gestación</label>
                    <input type="number" value={semanasGestacion} onChange={e => setSemanasGestacion(e.target.value)} className="w-full p-2 font-bold text-sm border border-pink-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-800 mb-1">Altura Uterina (cm)</label>
                    <input type="number" value={alturaUterina} onChange={e => setAlturaUterina(e.target.value)} className="w-full p-2 font-bold text-sm border border-pink-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-800 mb-1">Movimientos Fetales</label>
                    <select value={movimientosFetales} onChange={e => setMovimientosFetales(e.target.value)} className="w-full p-2 font-bold text-sm border border-pink-300 rounded-lg bg-white">
                      <option value="POSITIVO">Positivos (+)</option>
                      <option value="DISMINUIDO">Disminuidos</option>
                      <option value="AUSENTE">Ausentes (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-800 mb-1">Frecuencia Cardíaca Fetal (lpm)</label>
                    <input type="number" value={fcf} onChange={e => setFcf(e.target.value)} className="w-full p-2 font-bold text-sm border border-pink-300 rounded-lg" />
                  </div>
                </div>
              )}

              {/* NOTAS Y DIAGNOSTICO */}
              <div className="space-y-4">
                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                  <label className="block text-xs font-bold text-purple-900 mb-2 uppercase tracking-wide">Diagnóstico CIE-10 (Buscador)</label>
                  <Select
                    options={CIE10_OPTIONS}
                    placeholder="Buscar CIE-10..."
                    isClearable
                    onChange={(selected: any) => {
                      if (selected) {
                        const [code, desc] = selected.value.split('|');
                        setDiagnosticoCie10(code);
                        setDiagnosticoDesc(desc);
                      } else {
                        setDiagnosticoCie10('');
                        setDiagnosticoDesc('');
                      }
                    }}
                    className="text-sm"
                  />
                  <div className="flex gap-4 mt-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Código CIE-10</label>
                      <input type="text" value={diagnosticoCie10} onChange={e => setDiagnosticoCie10(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-white" />
                    </div>
                    <div className="flex-[3]">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Descripción Manual</label>
                      <input type="text" value={diagnosticoDesc} onChange={e => setDiagnosticoDesc(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-purple-800">
                      <input type="radio" checked={diagnosticoTipo === 'PRESUNTIVO'} onChange={() => setDiagnosticoTipo('PRESUNTIVO')} /> Presuntivo
                    </label>
                    <label className="flex items-center gap-1 text-xs font-bold text-purple-800">
                      <input type="radio" checked={diagnosticoTipo === 'DEFINITIVO'} onChange={() => setDiagnosticoTipo('DEFINITIVO')} /> Definitivo
                    </label>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide">Tratamiento / Receta</label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Medicamento</label>
                      <input type="text" value={medicamento} onChange={e => setMedicamento(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Ej. Paracetamol 500mg"/>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosis / Frecuencia</label>
                      <input type="text" value={frecuenciaMed} onChange={e => setFrecuenciaMed(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Ej. 1 tableta cada 8h"/>
                    </div>
                    <button type="button" onClick={agregarTratamiento} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 text-sm">Añadir</button>
                  </div>
                  {tratamientos.length > 0 && (
                    <div className="mt-3 bg-white border border-emerald-200 rounded-lg divide-y divide-emerald-100">
                      {tratamientos.map((t, idx) => (
                        <div key={idx} className="p-2 text-xs flex justify-between font-medium">
                          <span>• {t.medicamento}</span>
                          <span className="text-slate-500">{t.frecuencia}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Notas de Evolución *</label>
                  <textarea required value={notasEvolucion} onChange={e => setNotasEvolucion(e.target.value)} rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500" placeholder="Evolución clínica, examen físico y plan..."></textarea>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/30">Guardar Consulta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IA Copilot */}
      {expediente && pacienteActual && (
        <MedicalAICopilot expediente={expediente} paciente={pacienteActual} />
      )}
    </div>
  );
};
