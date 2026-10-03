import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente, ExpedienteClinico } from '../types';
import { 
  Stethoscope, Clock, User, FileText, Plus, Heart, 
  X, 
  ChevronDown, Baby, PhoneCall, Video, Phone,
  Printer, ShieldCheck, Share2, Pill, ExternalLink, Copy, Check, MessageCircle, Sparkles, Link2
} from 'lucide-react';
import Select from 'react-select';
import { CustomSelect } from '../components/CustomSelect';
import { getMedicamentosFarmacia, Medicamento } from '../services/farmaciaService';
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
  
  const pacienteActual = pacientes.find(p => p.id === pacienteSeleccionadoId);
  const { edadFormateada, esPediatrico, esMujer } = useContextoClinico(pacienteActual?.fecha_nacimiento, pacienteActual?.sexo);
  
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
  const [recetaModalOpen, setRecetaModalOpen] = useState<any | null>(null);

  // Integración con Farmacia Hospitalaria
  const [medicamentosFarmacia, setMedicamentosFarmacia] = useState<Medicamento[]>([]);
  const [farmaciaSeleccionadaId, setFarmaciaSeleccionadaId] = useState<string>('');

  // Telemedicina en vivo
  const [enlaceTelemedicinaConsulta, setEnlaceTelemedicinaConsulta] = useState('');
  const [segundosLlamada, setSegundosLlamada] = useState(0);
  const [llamadaActiva, setLlamadaActiva] = useState(true);
  const [copiadoEnlaceConsulta, setCopiadoEnlaceConsulta] = useState(false);

  // Cargar catálogo de farmacia
  useEffect(() => {
    setMedicamentosFarmacia(getMedicamentosFarmacia());
  }, [modalAbierto]);

  // Cronómetro de videollamada en vivo
  useEffect(() => {
    let interval: any = null;
    if (modalAbierto && modalidad === 'TELEMEDICINA' && llamadaActiva) {
      interval = setInterval(() => {
        setSegundosLlamada((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modalAbierto, modalidad, llamadaActiva]);

  // Generar o inicializar enlace de llamada para la consulta
  useEffect(() => {
    if (modalAbierto && modalidad === 'TELEMEDICINA' && !enlaceTelemedicinaConsulta) {
      const roomName = (pacienteActual?.nombre_completo || 'Paciente')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '');
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      setEnlaceTelemedicinaConsulta(`https://meet.jit.si/ClinicaMedica-Consulta-${roomName || 'Paciente'}-${code}`);
    }
  }, [modalAbierto, modalidad, pacienteActual, enlaceTelemedicinaConsulta]);

  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const copiarEnlaceConsulta = () => {
    if (!enlaceTelemedicinaConsulta) return;
    navigator.clipboard.writeText(enlaceTelemedicinaConsulta);
    setCopiadoEnlaceConsulta(true);
    setTimeout(() => setCopiadoEnlaceConsulta(false), 2000);
  };

  const compartirEnlaceWhatsApp = () => {
    if (!pacienteActual || !enlaceTelemedicinaConsulta) return;
    const texto = `Hola ${pacienteActual.nombre_completo}, el médico le está esperando en su consulta virtual en ClinicMed.\n\nPuede ingresar a la videollamada ahora mediante el siguiente enlace seguro:\n🔗 ${enlaceTelemedicinaConsulta}\n\nPor favor active su cámara y micrófono al entrar.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const handleSeleccionarMedicamentoFarmacia = (id: string) => {
    setFarmaciaSeleccionadaId(id);
    if (!id || id === 'MANUAL') {
      return;
    }
    const med = medicamentosFarmacia.find((m) => m.id === id);
    if (med) {
      setMedicamento(med.nombre);
      if (med.principio_activo.includes('500mg')) {
        setDosis('500mg');
        setFrecuenciaMed('1 tableta cada 8 horas');
      } else if (med.principio_activo.includes('400mg')) {
        setDosis('400mg');
        setFrecuenciaMed('1 cápsula cada 8 horas');
      } else if (med.principio_activo.includes('50mg')) {
        setDosis('50mg');
        setFrecuenciaMed('1 tableta cada 24 horas');
      } else if (med.principio_activo.includes('20mg')) {
        setDosis('20mg');
        setFrecuenciaMed('1 cápsula en ayunas por la mañana');
      } else if (med.principio_activo.includes('850mg')) {
        setDosis('850mg');
        setFrecuenciaMed('1 tableta con el almuerzo');
      } else {
        setDosis(med.presentacion);
        setFrecuenciaMed('Según prescripción clínica');
      }
    }
  };

  const compartirRecetaWhatsApp = (consulta: any, paciente: Paciente) => {
    if (!consulta.tratamiento || consulta.tratamiento.length === 0) return;
    const medsTexto = consulta.tratamiento
      .map((t: any, i: number) => `${i + 1}. *${t.medicamento}* - ${t.dosis} (${t.frecuencia}) por ${t.duracion_dias || 7} días`)
      .join('\n');
    const texto = `Hola ${paciente.nombre_completo}, le compartimos su *Receta Médica Oficial* emitida por el ${consulta.profesional_nombre} en ClinicMed:\n\n*Fecha:* ${new Date(consulta.fecha_atencion).toLocaleDateString('es-GT')}\n*Diagnóstico:* ${consulta.diagnosticos?.[0]?.descripcion || 'Consulta Médica'}\n\n*Medicamentos Prescritos:*\n${medsTexto}\n\nRecuerde no suspender el tratamiento antes de tiempo y consultar a su médico ante cualquier síntoma adverso.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
  };

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
        duracion_minutos: modalidad === 'TELEMEDICINA' ? Math.max(1, Math.ceil(segundosLlamada / 60)) : duracionLlamada,
        enlace_telemedicina: modalidad === 'TELEMEDICINA' ? enlaceTelemedicinaConsulta : null
      } : {}
    };

    if (!puedeAtender) {
      alert('Acción restringida: Únicamente el personal médico está autorizado para registrar consultas clínicas.');
      return;
    }

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

  const puedeAtender = user?.rol === 'MEDICO';

  return (
    <div className="space-y-6">
      {/* Selector de Paciente y Encabezado */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl sm:rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold mb-1 border border-teal-100 dark:border-teal-800">
            <FileText className="h-3.5 w-3.5" /> ECE
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Historia Médica del Paciente
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.rol !== 'PACIENTE' && (
            <div className="relative z-20 w-full sm:w-auto">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block sm:inline">Paciente</label>
              <button 
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)} 
                className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold flex justify-between sm:justify-start gap-3 items-center text-slate-900 dark:text-white cursor-pointer"
              >
                <span className="truncate">{pacienteActual?.nombre_completo || 'Seleccionar...'}</span>
                <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
              </button>
              {isSelectOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl p-2 z-50 max-h-64 overflow-y-auto">
                  {pacientes.map(p => (
                    <button 
                      key={p.id} 
                      type="button"
                      onClick={() => { setPacienteSeleccionadoId(p.id); setIsSelectOpen(false); }} 
                      className={`w-full text-left p-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        pacienteSeleccionadoId === p.id 
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p.nombre_completo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {puedeAtender && expediente && (
            <button 
              onClick={() => setModalAbierto(true)} 
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
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
                  {puedeAtender && (
                    <button onClick={() => { setTipoConsulta('MATERNIDAD'); setModalAbierto(true); }} className="mt-3 w-full py-2 bg-pink-100 text-pink-700 font-bold text-xs rounded-xl hover:bg-pink-200 transition-colors">
                      Iniciar Control Prenatal
                    </button>
                  )}
                </div>
              )}

              {/* Historial de Consultas Rápido */}
              <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 ${!esPediatrico && !esMujer ? 'col-span-2' : ''}`}>
                <h3 className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-teal-500" /> Últimas Consultas
                </h3>
                <div className="space-y-3">
                  {expediente.consultas?.slice(0, 5).map(c => (
                    <div key={c.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-sky-600">{new Date(c.fecha_atencion).toLocaleDateString()}</span>
                        <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md">{c.tipo_consulta || 'GENERAL'}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-1 truncate">{c.motivo_consulta}</p>
                      
                      {c.tratamiento && c.tratamiento.length > 0 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Pill className="w-3 h-3" /> {c.tratamiento.length} medicamento{c.tratamiento.length > 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRecetaModalOpen(c)}
                            className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receta Oficial (QR)</span>
                          </button>
                        </div>
                      )}
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

      {/* Modal Nueva Consulta Dinámico (Exclusivo para Médicos) */}
      {modalAbierto && puedeAtender && (
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

              {/* UIs CONTEXTUALES DE MODALIDAD: TELEMEDICINA EN VIVO */}
              {modalidad === 'TELEMEDICINA' && (
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 sm:p-6 rounded-2xl border border-indigo-700/60 shadow-xl space-y-4">
                  {/* Barra de estado en vivo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                      </span>
                      <span className="font-black tracking-wider uppercase text-xs text-rose-300">
                        Sesión de Telemedicina en Vivo
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                        Paciente: {pacienteActual?.nombre_completo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-indigo-800 text-emerald-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatearTiempo(segundosLlamada)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLlamadaActiva(!llamadaActiva)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          llamadaActiva
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                      >
                        {llamadaActiva ? 'Pausar Tiempo' : 'Reanudar'}
                      </button>
                    </div>
                  </div>

                  {/* Campo y Acciones del Enlace de Videollamada */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-indigo-200 flex items-center gap-1.5">
                        <Link2 className="w-4 h-4 text-indigo-400" />
                        <span>Enlace de Videollamada (Meet / Teams / Jitsi / Zoom)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const roomName = (pacienteActual?.nombre_completo || 'Paciente').replace(/[^a-zA-Z0-9]/g, '');
                          const code = Math.random().toString(36).substring(2, 7).toUpperCase();
                          setEnlaceTelemedicinaConsulta(`https://meet.jit.si/ClinicaMedica-Consulta-${roomName || 'Paciente'}-${code}`);
                        }}
                        className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 font-bold underline cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Generar nueva sala Jitsi
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={enlaceTelemedicinaConsulta}
                        onChange={(e) => setEnlaceTelemedicinaConsulta(e.target.value)}
                        placeholder="https://meet.google.com/... o https://meet.jit.si/..."
                        className="flex-1 px-3 py-2 bg-slate-950/70 border border-indigo-700/80 rounded-xl font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />

                      <div className="flex items-center gap-2">
                        {enlaceTelemedicinaConsulta && (
                          <a
                            href={enlaceTelemedicinaConsulta}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Abrir Videollamada</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={copiarEnlaceConsulta}
                          className="px-3 py-2 bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          title="Copiar enlace"
                        >
                          {copiadoEnlaceConsulta ? (
                            <span className="text-emerald-300 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copiado</span>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={compartirEnlaceWhatsApp}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          title="Enviar enlace por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-indigo-300/80 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Conexión de telemedicina cifrada. Puede mantener esta ventana abierta en una pantalla mientras atiende la videollamada en otra.</span>
                  </p>
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
                    <CustomSelect
                      value={movimientosFetales}
                      onChange={val => setMovimientosFetales(val)}
                      options={[
                        { value: 'POSITIVO', label: 'Positivos (+)' },
                        { value: 'DISMINUIDO', label: 'Disminuidos' },
                        { value: 'AUSENTE', label: 'Ausentes (-)' }
                      ]}
                    />
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

                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span>Tratamiento Farmacológico / Receta Médica</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                      Inventario Farmacia Activo
                    </span>
                  </div>

                  {/* Selector de Medicamentos Registrados en Farmacia */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                      1. Seleccionar de Medicamentos Registrados en Farmacia
                    </label>
                    <CustomSelect
                      value={farmaciaSeleccionadaId}
                      onChange={handleSeleccionarMedicamentoFarmacia}
                      placeholder="Seleccionar fármaco de farmacia (con stock disponible)..."
                      options={[
                        { value: 'MANUAL', label: '✏️ Escribir medicamento personalizado / externo' },
                        ...medicamentosFarmacia.map(m => ({
                          value: m.id,
                          label: `${m.nombre} (${m.presentacion})`,
                          badge: m.stock_actual > 0 ? `Stock: ${m.stock_actual}` : 'Agotado (0)',
                          description: `${m.principio_activo} • Lote: ${m.lote}`
                        }))
                      ]}
                    />
                  </div>

                  {/* Inputs de Medicamento y Dosis */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Nombre del Medicamento *</label>
                      <input 
                        type="text" 
                        value={medicamento} 
                        onChange={e => setMedicamento(e.target.value)} 
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                        placeholder="Ej. Paracetamol 500mg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosis / Frecuencia *</label>
                      <input 
                        type="text" 
                        value={frecuenciaMed} 
                        onChange={e => setFrecuenciaMed(e.target.value)} 
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                        placeholder="Ej. 1 tableta cada 8 horas por 5 días"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button 
                        type="button" 
                        onClick={agregarTratamiento} 
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de tratamientos en la receta */}
                  {tratamientos.length > 0 && (
                    <div className="mt-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-xl divide-y divide-emerald-100 dark:divide-slate-700">
                      {tratamientos.map((t, idx) => (
                        <div key={idx} className="p-2.5 text-xs flex justify-between items-center font-medium">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">• {t.medicamento}</span>
                            <span className="text-slate-500 dark:text-slate-400 block text-[11px] pl-3">{t.frecuencia}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTratamientos(tratamientos.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar de la receta"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL RECETA MÉDICA OFICIAL CON CÓDIGO QR (ISO/IEC 25010) */}
      {recetaModalOpen && pacienteActual && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-[28px] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
            
            {/* Barra de Acciones Superior (No se imprime) */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Receta Médica Electrónica Oficial
                  </h4>
                  <p className="text-[10px] text-slate-500">Documento clínico certificado con código QR</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => compartirRecetaWhatsApp(recetaModalOpen, pacienteActual)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  title="Enviar por WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecetaModalOpen(null)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* HOJA DE LA RECETA (DISEÑO PROFESIONAL IMPRIMIBLE) */}
            <div className="p-6 sm:p-8 space-y-6 bg-white font-sans text-slate-800">
              
              {/* Encabezado Hospitalario */}
              <div className="flex items-start justify-between border-b-2 border-teal-600 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 bg-teal-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                      +
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                        ClinicMed - Red Hospitalaria
                      </h2>
                      <p className="text-[11px] text-teal-700 font-bold tracking-wide">
                        Centro Clínico y Quirúrgico de Especialidades
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    PBX: (+502) 2200-1100 &bull; 10ma Calle 3-40 Zona 10 &bull; NIT: 8493021-4
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Receta No. REC-{(recetaModalOpen.id || '2026').substring(0, 8).toUpperCase()}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Fecha: {new Date(recetaModalOpen.fecha_atencion).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Datos del Médico y del Paciente */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Médico Tratante</span>
                  <strong className="text-sm font-black text-slate-900 block">{recetaModalOpen.profesional_nombre}</strong>
                  <p className="text-[11px] text-teal-700 font-bold">Colegiado Activo No. 12480</p>
                  <p className="text-[10px] text-slate-500">Medicina General & Especialidades</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Datos del Paciente</span>
                  <strong className="text-sm font-black text-slate-900 block">{pacienteActual.nombre_completo}</strong>
                  <p className="text-[11px] text-slate-600 font-mono">
                    DPI: {pacienteActual.documento} &bull; Exp: {pacienteActual.codigo_paciente}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tipo de Sangre: <span className="font-bold text-slate-800">{pacienteActual.tipo_sangre || 'O+'}</span> &bull; Modalidad: {recetaModalOpen.modalidad || 'PRESENCIAL'}
                  </p>
                </div>
              </div>

              {/* Diagnóstico CIE-10 */}
              {recetaModalOpen.diagnosticos && recetaModalOpen.diagnosticos.length > 0 && (
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                    Diagnóstico Clínico (CIE-10)
                  </span>
                  <div className="bg-sky-50/70 border border-sky-200/80 p-2.5 rounded-xl font-medium text-sky-950 flex items-center justify-between">
                    <span>
                      <strong className="font-mono text-sky-700">[{recetaModalOpen.diagnosticos[0].codigo_cie10}]</strong> {recetaModalOpen.diagnosticos[0].descripcion}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded">
                      {recetaModalOpen.diagnosticos[0].tipo || 'DEFINITIVO'}
                    </span>
                  </div>
                </div>
              )}

              {/* RP / Prescripción Médica Farmacológica */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                  <span className="text-xl font-black text-teal-700 italic">Rp.</span>
                  <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
                    Prescripción e Indicaciones Farmacológicas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {recetaModalOpen.tratamiento && recetaModalOpen.tratamiento.length > 0 ? (
                    recetaModalOpen.tratamiento.map((med: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <strong className="text-sm font-black text-slate-900">{med.medicamento}</strong>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">
                              {med.dosis}
                            </span>
                          </div>
                          <p className="text-slate-600 pl-7 font-medium">
                            {med.frecuencia} &bull; Duración: <span className="font-bold text-slate-900">{med.duracion_dias || 7} días</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0">
                          Vía Oral
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sin prescripciones farmacológicas registradas en esta atención.</p>
                  )}
                </div>
              </div>

              {/* Cuidados e Indicaciones Generales */}
              {recetaModalOpen.notas_evolucion && (
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                    Indicaciones Generales y Cuidados
                  </span>
                  <p className="text-slate-700 font-medium">{recetaModalOpen.notas_evolucion}</p>
                </div>
              )}

              {/* Pie de Receta: Sello, Firma y Código QR de Validación */}
              <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* Código QR de Verificación */}
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=0&data=${encodeURIComponent(`VERIFICACION-RECETA-CLINICMED | Folio: REC-${(recetaModalOpen.id || '2026').substring(0,8).toUpperCase()} | Paciente: ${pacienteActual.nombre_completo} | Medico: ${recetaModalOpen.profesional_nombre} | SQA-ISO-25010-VALIDADA`)}`}
                    alt="Código QR de Verificación"
                    className="h-20 w-20 rounded-xl border border-slate-300 p-1 bg-white shadow-sm shrink-0"
                  />
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <span className="font-black text-slate-800 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      Autenticidad Verificada
                    </span>
                    <p>Escanee para validar la prescripción médica en el portal del hospital.</p>
                    <p className="font-mono text-[9px] text-slate-400">Norma ISO/IEC 25010 &bull; ECE Seguro</p>
                  </div>
                </div>

                {/* Sello y Firma Digital del Médico */}
                <div className="text-center sm:text-right space-y-1">
                  <div className="h-10 flex items-center justify-center sm:justify-end">
                    <span className="font-serif italic text-base text-slate-700 font-bold border-b border-slate-400 px-6 pb-0.5">
                      {recetaModalOpen.profesional_nombre}
                    </span>
                  </div>
                  <strong className="text-xs block text-slate-800 font-black">
                    Firma & Sello Médico Digital
                  </strong>
                  <span className="text-[10px] text-teal-700 font-bold block">
                    Colegiado Activo No. 12480
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* IA Copilot (Exclusivo para Médicos) */}
      {puedeAtender && expediente && pacienteActual && (
        <MedicalAICopilot expediente={expediente} paciente={pacienteActual} />
      )}
    </div>
  );
};
