import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Bed, CheckCircle2, Search, Plus, 
  X, User, Activity, ShieldCheck, 
  AlertTriangle, RotateCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente } from '../types';
import { DEFAULT_PACIENTES } from '../services/pacientesSeed';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { 
  getCamasHospital, 
  asignarCama, 
  liberarCama, 
  cambiarEstadoCama, 
  CamaHospital, 
  ALAS_INFO 
} from '../services/hospitalizacionService';

export const HospitalizacionPage: React.FC = () => {
  const { user } = useAuth();

  // Estados de datos
  const [camas, setCamas] = useState<CamaHospital[]>(() => getCamasHospital());
  const [pacientesRegistrados, setPacientesRegistrados] = useState<Paciente[]>([]);

  // Filtros
  const [alaSeleccionada, setAlaSeleccionada] = useState<string>('TODAS');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [camaParaAlta, setCamaParaAlta] = useState<CamaHospital | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario Asignación de Cama
  const [camaSeleccionadaId, setCamaSeleccionadaId] = useState('');
  const [tipoPaciente, setTipoPaciente] = useState<'REGISTRADO' | 'MANUAL'>('REGISTRADO');
  const [pacienteId, setPacienteId] = useState('');
  const [pacienteManual, setPacienteManual] = useState('');
  const [diagnosticoIngreso, setDiagnosticoIngreso] = useState('');
  const [medicoTratante, setMedicoTratante] = useState('Dr. Alejandro Morales');
  const [fechaIngreso, setFechaIngreso] = useState(() => new Date().toISOString().split('T')[0]);
  const [notasEnfermeria, setNotasEnfermeria] = useState('');

  // Cargar lista de pacientes para selector rápido con fallback resiliente
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
        console.warn('Usando pacientes de contingencia para hospitalización:', err);
        setPacientesRegistrados(DEFAULT_PACIENTES);
      }
    };
    cargar();
  }, []);

  // Paciente registrado seleccionado en el formulario
  const pacienteSeleccionado = useMemo(() => {
    return pacientesRegistrados.find(p => p.id === pacienteId) || null;
  }, [pacientesRegistrados, pacienteId]);

  // Opciones de pacientes registrados para CustomSelect
  const opcionesPacientes: SelectOption[] = useMemo(() => {
    return pacientesRegistrados.map(p => ({
      value: p.id,
      label: p.nombre_completo,
      badge: p.codigo_paciente || 'PAC',
      description: `DPI: ${p.documento || 'S/D'} • Sangre: ${p.tipo_sangre || 'N/A'}`
    }));
  }, [pacientesRegistrados]);

  // Camas disponibles para el selector del modal
  const opcionesCamasDisponibles: SelectOption[] = useMemo(() => {
    return camas
      .filter(c => c.estado === 'DISPONIBLE' || c.id === camaSeleccionadaId)
      .map(c => ({
        value: c.id,
        label: `${c.codigo} - ${c.habitacion}`,
        badge: ALAS_INFO[c.ala]?.nombre.split('(')[0] || c.ala,
        description: c.equipamiento?.join(', ') || 'Cama estándar'
      }));
  }, [camas, camaSeleccionadaId]);

  // KPIs
  const totalCamas = camas.length;
  const camasOcupadas = camas.filter(c => c.estado === 'OCUPADA').length;
  const camasDisponibles = camas.filter(c => c.estado === 'DISPONIBLE').length;
  const camasLimpieza = camas.filter(c => c.estado === 'LIMPIEZA').length;
  const porcentajeOcupacion = totalCamas > 0 ? Math.round((camasOcupadas / totalCamas) * 100) : 0;

  // Filtrado de camas
  const camasFiltradas = useMemo(() => {
    return camas.filter(c => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto = !q || 
        c.codigo.toLowerCase().includes(q) || 
        c.habitacion.toLowerCase().includes(q) || 
        (c.paciente_nombre && c.paciente_nombre.toLowerCase().includes(q)) || 
        (c.diagnostico_ingreso && c.diagnostico_ingreso.toLowerCase().includes(q));

      const coincideAla = alaSeleccionada === 'TODAS' || c.ala === alaSeleccionada;
      const coincideEstado = estadoFiltro === 'TODOS' || c.estado === estadoFiltro;

      return coincideTexto && coincideAla && coincideEstado;
    });
  }, [camas, busqueda, alaSeleccionada, estadoFiltro]);

  // Handlers
  const handleAbrirAsignar = (cama?: CamaHospital) => {
    if (cama) {
      setCamaSeleccionadaId(cama.id);
    } else {
      const primeraLibre = camas.find(c => c.estado === 'DISPONIBLE');
      if (primeraLibre) {
        setCamaSeleccionadaId(primeraLibre.id);
      }
    }
    setModalAsignarAbierto(true);
  };

  const handleConfirmarAsignacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!camaSeleccionadaId) return;

    let nombre = '';
    let pacId: string | undefined = undefined;

    if (tipoPaciente === 'REGISTRADO') {
      const p = pacientesRegistrados.find(item => item.id === pacienteId);
      if (!p) return;
      nombre = p.nombre_completo;
      pacId = p.id;
    } else {
      if (!pacienteManual.trim()) return;
      nombre = pacienteManual.trim();
    }

    const actualizadas = asignarCama(camaSeleccionadaId, {
      paciente_id: pacId,
      paciente_nombre: nombre,
      diagnostico_ingreso: diagnosticoIngreso.trim() || 'Ingreso clínico bajo observación',
      medico_a_cargo: medicoTratante.trim() || 'Médico de Planta',
      fecha_ingreso: fechaIngreso,
      notas_enfermeria: notasEnfermeria.trim() || 'Paciente ingresado en cama.'
    });

    setCamas(actualizadas);
    setModalAsignarAbierto(false);
    setMensajeExito(`¡Paciente ${nombre} internado con éxito en la cama seleccionada!`);
    setTimeout(() => setMensajeExito(null), 4000);

    // Reset
    setPacienteManual('');
    setDiagnosticoIngreso('');
    setNotasEnfermeria('');
  };

  const handleConfirmarAlta = (enviarALimpieza: boolean) => {
    if (!camaParaAlta) return;
    const actualizadas = liberarCama(camaParaAlta.id, enviarALimpieza);
    setCamas(actualizadas);
    setCamaParaAlta(null);
    setMensajeExito(`Alta hospitalaria concedida para la cama ${camaParaAlta.codigo}. Estado actualizado a ${enviarALimpieza ? 'En Limpieza' : 'Disponible'}.`);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  const handleMarcarLimpia = (camaId: string) => {
    const actualizadas = cambiarEstadoCama(camaId, 'DISPONIBLE');
    setCamas(actualizadas);
    setMensajeExito('Cama desinfectada y lista para recibir pacientes.');
    setTimeout(() => setMensajeExito(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
            <Building2 className="h-7 w-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Camas & Hospitalización
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Pabellones ECE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestión visual de camas por alas (UCI, Medicina Interna, Cirugía, Maternidad) y altas hospitalarias.
            </p>
          </div>
        </div>

        {user?.rol !== 'PACIENTE' && (
          <button
            onClick={() => handleAbrirAsignar()}
            disabled={camasDisponibles === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Asignar Cama a Paciente</span>
          </button>
        )}
      </div>

      {/* 2. MENSAJE FLOTANTE DE ÉXITO */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* 3. KPIS DE OCUPACIÓN HOSPITALARIA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Ocupación Total</span>
            <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {porcentajeOcupacion}%
            </strong>
            <span className="text-[10px] text-slate-500 font-medium">{camasOcupadas} de {totalCamas} camas</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider block">Camas Disponibles</span>
            <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {camasDisponibles}
            </strong>
            <span className="text-[10px] text-slate-500 font-medium">Listas para ingreso</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bed className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">Pacientes Internados</span>
            <strong className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {camasOcupadas}
            </strong>
            <span className="text-[10px] text-slate-500 font-medium">Camas ocupadas</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">En Desinfección</span>
            <strong className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {camasLimpieza}
            </strong>
            <span className="text-[10px] text-slate-500 font-medium">Protocolo de higiene</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <RotateCw className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 4. PESTAÑAS POR ALA CLÍNICA */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'TODAS', label: 'Todas las Alas' },
            { id: 'UCI', label: 'UCI (Cuidados Intensivos)' },
            { id: 'MEDICINA_INTERNA', label: 'Medicina Interna' },
            { id: 'CIRUGIA', label: 'Cirugía' },
            { id: 'MATERNIDAD', label: 'Maternidad' },
            { id: 'URGENCIAS_OBS', label: 'Observación Urgencias' },
          ].map(ala => (
            <button
              key={ala.id}
              onClick={() => setAlaSeleccionada(ala.id)}
              className={`px-3 py-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                alaSeleccionada === ala.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {ala.label}
            </button>
          ))}
        </div>

        {/* Buscador y filtro de estado */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código, habitación, paciente o diagnóstico..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {[
              { id: 'TODOS', label: 'Todos los Estados' },
              { id: 'DISPONIBLE', label: 'Disponibles' },
              { id: 'OCUPADA', label: 'Ocupadas' },
              { id: 'LIMPIEZA', label: 'En Limpieza' },
              { id: 'MANTENIMIENTO', label: 'Mantenimiento' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setEstadoFiltro(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  estadoFiltro === f.id
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. MAPA VISUAL DE CAMAS */}
      {camasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
          <Bed className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-bold">No se encontraron camas hospitalarias con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {camasFiltradas.map((cama) => {
            const esDisponible = cama.estado === 'DISPONIBLE';
            const esOcupada = cama.estado === 'OCUPADA';
            const esLimpieza = cama.estado === 'LIMPIEZA';
            const alaInfo = ALAS_INFO[cama.ala];

            return (
              <div
                key={cama.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                  esOcupada 
                    ? 'border-rose-200 dark:border-rose-900/50' 
                    : esDisponible
                    ? 'border-emerald-200 dark:border-emerald-900/50'
                    : esLimpieza
                    ? 'border-amber-200 dark:border-amber-900/50'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Cabecera de la Cama */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {cama.codigo}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {cama.habitacion}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      esOcupada
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : esDisponible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : esLimpieza
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      {cama.estado}
                    </span>
                  </div>

                  {/* Ala o Pabellón */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${alaInfo?.iconoColor || ''}`}>
                      {alaInfo?.nombre.split('(')[0] || cama.ala}
                    </span>
                  </div>

                  {/* Contenido según Estado */}
                  {esOcupada ? (
                    <div className="space-y-2 pt-1">
                      <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 block">
                          Paciente Internado
                        </span>
                        <strong className="text-sm font-black text-slate-900 dark:text-white block">
                          {cama.paciente_nombre}
                        </strong>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {cama.diagnostico_ingreso}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Médico a Cargo</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{cama.medico_a_cargo}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha Ingreso</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">{cama.fecha_ingreso}</span>
                        </div>
                      </div>

                      {cama.notas_enfermeria && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          &ldquo;{cama.notas_enfermeria}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : esDisponible ? (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl text-center space-y-1">
                      <ShieldCheck className="h-6 w-6 mx-auto text-emerald-600 dark:text-emerald-400" />
                      <strong className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                        Cama Lista para Ingreso
                      </strong>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {cama.notas_enfermeria || 'Cama higienizada y operativa.'}
                      </p>
                    </div>
                  ) : esLimpieza ? (
                    <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-center space-y-1">
                      <RotateCw className="h-6 w-6 mx-auto text-amber-600 dark:text-amber-400 animate-spin" />
                      <strong className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                        En Proceso de Desinfección
                      </strong>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        Limpieza terminal y preparación de ropa hospitalaria.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center space-y-1 text-slate-500 text-xs">
                      <AlertTriangle className="h-6 w-6 mx-auto text-slate-400" />
                      <p className="font-bold">Cama Fuera de Servicio</p>
                    </div>
                  )}

                  {/* Equipamiento */}
                  {cama.equipamiento && cama.equipamiento.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Equipamiento Asociado</span>
                      <div className="flex flex-wrap gap-1">
                        {cama.equipamiento.map((eq, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Acciones */}
                {user?.rol !== 'PACIENTE' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold">
                    {esDisponible && (
                      <button
                        type="button"
                        onClick={() => handleAbrirAsignar(cama)}
                        className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Internar Paciente</span>
                      </button>
                    )}

                    {esOcupada && (
                      <button
                        type="button"
                        onClick={() => setCamaParaAlta(cama)}
                        className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dar de Alta Médica</span>
                      </button>
                    )}

                    {esLimpieza && (
                      <button
                        type="button"
                        onClick={() => handleMarcarLimpia(cama.id)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar como Lista</span>
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
      {/* 6. MODAL ASIGNAR PACIENTE A CAMA (CON CUSTOMDATEPICKER Y CUSTOMSELECT) */}
      {/* ========================================================================= */}
      {modalAsignarAbierto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Bed className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Internamiento & Asignación de Cama
                  </h3>
                  <p className="text-xs text-slate-400">Admisión hospitalaria y registro de estancia</p>
                </div>
              </div>
              <button
                onClick={() => setModalAsignarAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAsignacion} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Selección de Cama con CustomSelect */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cama Hospitalaria Asignada *
                </label>
                <CustomSelect
                  value={camaSeleccionadaId}
                  onChange={(val) => setCamaSeleccionadaId(val)}
                  options={opcionesCamasDisponibles}
                  placeholder="Seleccionar cama disponible..."
                  icon={<Bed className="w-4 h-4" />}
                />
              </div>

              {/* Selector de Paciente: Registrado vs Manual */}
              <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setTipoPaciente('REGISTRADO')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tipoPaciente === 'REGISTRADO'
                      ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Paciente Registrado en ECE
                </button>
                <button
                  type="button"
                  onClick={() => setTipoPaciente('MANUAL')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tipoPaciente === 'MANUAL'
                      ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Ingreso Manual de Paciente
                </button>
              </div>

              {tipoPaciente === 'REGISTRADO' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Seleccionar Paciente *
                    </label>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                      {pacientesRegistrados.length} pacientes registrados
                    </span>
                  </div>
                  <CustomSelect
                    value={pacienteId}
                    onChange={(val) => setPacienteId(val)}
                    options={opcionesPacientes}
                    placeholder="Buscar paciente registrado..."
                    icon={<User className="w-4 h-4" />}
                  />

                  {pacienteSeleccionado && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900 dark:text-white">
                          {pacienteSeleccionado.nombre_completo}
                        </strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {pacienteSeleccionado.codigo_paciente || 'PACIENTE REGISTRADO'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <p>DPI: <span className="font-semibold text-slate-700 dark:text-slate-200">{pacienteSeleccionado.documento || 'No indicado'}</span></p>
                        <p>Grupo Sanguíneo: <span className="font-bold text-rose-600 dark:text-rose-400">{pacienteSeleccionado.tipo_sangre || 'S/D'}</span></p>
                        <p>Teléfono: <span className="font-semibold text-slate-700 dark:text-slate-200">{pacienteSeleccionado.telefono || 'Sin tel.'}</span></p>
                        <p>Contacto Emergencia: <span className="font-semibold text-slate-700 dark:text-slate-200">{pacienteSeleccionado.contacto_emergencia || 'N/A'}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo del Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    value={pacienteManual}
                    onChange={(e) => setPacienteManual(e.target.value)}
                    placeholder="Ej. Roberto Morales Santos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs font-semibold"
                  />
                </div>
              )}

              {/* Diagnóstico de Ingreso */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnóstico de Ingreso / Causa de Hospitalización *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosticoIngreso}
                  onChange={(e) => setDiagnosticoIngreso(e.target.value)}
                  placeholder="Ej. Postoperatorio apendicectomía, monitoreo antibiótico"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Médico Tratante a Cargo
                  </label>
                  <input
                    type="text"
                    value={medicoTratante}
                    onChange={(e) => setMedicoTratante(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* CALENDARIO PERSONALIZADO PARA FECHA DE INGRESO */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Ingreso *
                  </label>
                  <CustomDatePicker
                    value={fechaIngreso}
                    onChange={(val) => setFechaIngreso(val)}
                    placeholder="Elegir fecha..."
                  />
                </div>
              </div>

              {/* Notas de Enfermería */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas de Enfermería / Requerimientos de Cuidado
                </label>
                <input
                  type="text"
                  value={notasEnfermeria}
                  onChange={(e) => setNotasEnfermeria(e.target.value)}
                  placeholder="Ej. Dieta blanda, analgesia horaria IV, reposo absoluto"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalAsignarAbierto(false)}
                  className="px-4 py-2.5 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Confirmar Internamiento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL CONFIRMAR ALTA HOSPITALARIA */}
      {/* ========================================================================= */}
      {camaParaAlta && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Dar de Alta Médica
                </h3>
              </div>
              <button onClick={() => setCamaParaAlta(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl space-y-1">
              <strong className="text-sm text-slate-900 dark:text-white block">{camaParaAlta.paciente_nombre}</strong>
              <p className="text-[11px] text-slate-500">Cama: <span className="font-bold">{camaParaAlta.codigo} ({camaParaAlta.habitacion})</span></p>
              <p className="text-[11px] text-slate-500">Diagnóstico: {camaParaAlta.diagnostico_ingreso}</p>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              ¿Desea enviar la cama a protocolo de desinfección y limpieza terminal tras conceder el alta al paciente?
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCamaParaAlta(null)}
                className="px-3.5 py-2 text-slate-500 font-bold hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarAlta(false)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
              >
                Alta Directa (Libre)
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarAlta(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Alta y a Limpieza
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
