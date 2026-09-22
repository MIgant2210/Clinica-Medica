import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Paciente } from '../types';
import { 
  Search, User, FileText, X, Heart, 
  ChevronRight, ChevronLeft, Phone, Mail, UserPlus, Check, Contact
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const PacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Pasos del Wizard interactivo (1: Identidad, 2: Datos Médicos, 3: Contacto)
  const [pasoActual, setPasoActual] = useState(1);

  // Formulario interactivo de paciente
  const [primerNombre, setPrimerNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('DPI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('MASCULINO');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoSangre, setTipoSangre] = useState('O+');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [antecedentesAlergias, setAntecedentesAlergias] = useState('');
  const [antecedentesPatologicos, setAntecedentesPatologicos] = useState('');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setBusqueda(q);
    if (searchParams.get('nuevo') === 'true') {
      setModalAbierto(true);
      setPasoActual(1);
      searchParams.delete('nuevo');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const cargarPacientes = async () => {
    try {
      const res = await apiClient.get('/pacientes', {
        params: { busqueda: busqueda || undefined },
      });
      if (res.data.ok) {
        setPacientes(res.data.pacientes);
      }
    } catch (e) {
      console.error('Error al cargar pacientes:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, [busqueda]);

  const handleCrearPaciente = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorModal(null);

    try {
      const res = await apiClient.post('/pacientes', {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        primer_nombre: primerNombre,
        primer_apellido: primerApellido,
        fecha_nacimiento: fechaNacimiento,
        sexo,
        telefono,
        correo,
        tipo_sangre: tipoSangre,
        contacto_emergencia_nombre: contactoEmergencia,
        antecedentes_alergias: antecedentesAlergias,
        antecedentes_patologicos: antecedentesPatologicos,
      });

      if (res.data.ok) {
        setModalAbierto(false);
        setPasoActual(1);
        setPrimerNombre('');
        setPrimerApellido('');
        setNumeroDocumento('');
        setTelefono('');
        setCorreo('');
        cargarPacientes();
      }
    } catch (err: any) {
      setErrorModal(err.response?.data?.error || 'Error al registrar paciente.');
    }
  };

  const gruposSanguineos = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const sangreColors: Record<string, string> = {
    'O+': 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'O-': 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
    'A+': 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    'B+': 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    'AB+': 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up relative">
      
      {/* Fondos flotantes decorativos */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Encabezado y Acción */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
            <User className="h-3.5 w-3.5" />
            Padrón Único de Salud
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Directorio de Pacientes
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Identidad centralizada y apertura automática del Expediente Clínico Electrónico (ECE)
          </p>
        </div>

        <button
          onClick={() => {
            setPasoActual(1);
            setModalAbierto(true);
          }}
          className="group relative px-6 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] text-sm font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          <UserPlus className="h-5 w-5 relative z-10" />
          <span className="relative z-10">Registrar Paciente</span>
        </button>
      </div>

      {/* Buscador Interactivo */}
      <div className="relative group z-10">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre completo, número de DPI o código de expediente..."
          className="w-full pl-14 pr-6 py-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-white/60 dark:border-white/10 rounded-[1.5rem] text-sm shadow-lg shadow-slate-200/20 dark:shadow-none focus:outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 font-bold transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
      </div>

      {/* Grid de Pacientes */}
      {cargando ? (
        <div className="p-16 text-center text-sm font-bold text-slate-400 animate-pulse">Cargando pacientes...</div>
      ) : pacientes.length === 0 ? (
        <div className="p-16 text-center text-sm font-bold text-slate-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white/60 dark:border-white/10">
          No se encontraron pacientes que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
          {pacientes.map((p) => {
            const sangreBadge = sangreColors[p.tipo_sangre] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            return (
              <div
                key={p.id}
                className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-400/50 dark:hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => navigate(`/expediente?pacienteId=${p.id}`)}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-[1.25rem] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {p.nombre_completo}
                        </h3>
                        <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-lg mt-1 inline-block">
                          {p.codigo_paciente}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border flex items-center gap-1.5 ${sangreBadge}`}>
                      <Heart className="h-3 w-3 fill-current" />
                      {p.tipo_sangre}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-white/60 dark:border-white/5 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Documento</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{p.documento}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Teléfono</span>
                      <span className="text-slate-700 dark:text-slate-300">{p.telefono}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Correo</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{p.correo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <div 
                    className="flex-1 py-3.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-[1.25rem] text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:bg-teal-600 dark:hover:bg-teal-500 hover:text-white"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Expediente (ECE)</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`¿Estás seguro de eliminar a ${p.nombre_completo}?`)) {
                        apiClient.delete(`/pacientes/${p.id}`).then(() => cargarPacientes());
                      }
                    }}
                    className="w-12 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 hover:border-rose-500 rounded-[1.25rem] flex items-center justify-center transition-all duration-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* FORMULARIO STEPPER INTERACTIVO DE NUEVO PACIENTE                    */}
      {/* =================================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[36px] p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-800 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Encabezado */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Alta de Paciente</h3>
                  <p className="text-xs text-slate-400">Paso {pasoActual} de 3 &bull; Registro clínico unificado</p>
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Barra de Progreso del Stepper */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className={pasoActual >= 1 ? 'text-teal-600 dark:text-teal-400' : ''}>1. Identidad</span>
                <span className={pasoActual >= 2 ? 'text-teal-600 dark:text-teal-400' : ''}>2. Datos Médicos</span>
                <span className={pasoActual >= 3 ? 'text-teal-600 dark:text-teal-400' : ''}>3. Contacto</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: pasoActual === 1 ? '33%' : pasoActual === 2 ? '66%' : '100%' }}
                />
              </div>
            </div>

            {errorModal && (
              <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl font-medium">
                {errorModal}
              </div>
            )}

            <div className="space-y-4 text-sm">
              
              {/* PASO 1: IDENTIDAD & BIOGRAFÍA */}
              {pasoActual === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        required
                        value={primerNombre}
                        onChange={(e) => setPrimerNombre(e.target.value)}
                        placeholder="Ej. María Fernanda"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        required
                        value={primerApellido}
                        onChange={(e) => setPrimerApellido(e.target.value)}
                        placeholder="Ej. López"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Tipo de Documento
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['DPI', 'PASAPORTE', 'PARTIDA'].map((doc) => (
                        <button
                          type="button"
                          key={doc}
                          onClick={() => setTipoDocumento(doc)}
                          className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                            tipoDocumento === doc
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {doc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value)}
                      placeholder="2981726350101"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: DATOS MÉDICOS & GRUPO SANGUÍNEO */}
              {pasoActual === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Selector Interactivo de Grupo Sanguíneo (Gotas de Sangre) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-500 fill-current" />
                      <span>Selecciona el Tipo de Sangre</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {gruposSanguineos.map((sangre) => (
                        <button
                          type="button"
                          key={sangre}
                          onClick={() => setTipoSangre(sangre)}
                          className={`py-3 px-2 rounded-2xl text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 ${
                            tipoSangre === sangre
                              ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30 scale-105'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${tipoSangre === sangre ? 'fill-white' : 'text-rose-500'}`} />
                          <span>{sangre}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        required
                        value={fechaNacimiento}
                        onChange={(e) => setFechaNacimiento(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Sexo Biológico
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['MASCULINO', 'FEMENINO'].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setSexo(s)}
                            className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all ${
                              sexo === s
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {s === 'MASCULINO' ? 'Masculino' : 'Femenino'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alergias y Patologías */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-rose-600">
                        Alergias Conocidas
                      </label>
                      <input
                        type="text"
                        value={antecedentesAlergias}
                        onChange={(e) => setAntecedentesAlergias(e.target.value)}
                        placeholder="Ej. Penicilina, Ninguna"
                        className="w-full px-4 py-2.5 bg-rose-50/50 dark:bg-rose-950/20 border rounded-2xl border-rose-200 dark:border-rose-900/50 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium placeholder-rose-300 dark:placeholder-rose-800/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-amber-600">
                        Antecedentes Patológicos
                      </label>
                      <input
                        type="text"
                        value={antecedentesPatologicos}
                        onChange={(e) => setAntecedentesPatologicos(e.target.value)}
                        placeholder="Ej. Hipertensión, Asma"
                        className="w-full px-4 py-2.5 bg-amber-50/50 dark:bg-amber-950/20 border rounded-2xl border-amber-200 dark:border-amber-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder-amber-300 dark:placeholder-amber-800/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: CONTACTO & EMERGENCIA */}
              {pasoActual === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Teléfono Móvil
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="5500-1122"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={correo}
                          onChange={(e) => setCorreo(e.target.value)}
                          placeholder="paciente@correo.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Contacto de Urgencia / Familiar
                    </label>
                    <input
                      type="text"
                      value={contactoEmergencia}
                      onChange={(e) => setContactoEmergencia(e.target.value)}
                      placeholder="Nombre del familiar y teléfono de urgencia"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  {/* Tarjeta Resumen / Carnet Médico Previsto */}
                  <div className="p-4 bg-gradient-to-br from-teal-50/70 to-emerald-50/70 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-3xl border border-teal-200/80 dark:border-teal-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 block">
                        Ficha Médica por Crear
                      </span>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {primerNombre || 'Nombre'} {primerApellido || 'Apellido'}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        DPI: {numeroDocumento || '---'} &bull; Tipo: {tipoSangre}
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md">
                      <Contact className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Navegación del Stepper */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                {pasoActual > 1 ? (
                  <button
                    type="button"
                    onClick={() => setPasoActual((p) => p - 1)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                )}

                {pasoActual < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (pasoActual === 1 && (!primerNombre || !primerApellido || !numeroDocumento)) {
                        setErrorModal('Por favor completa los nombres y número de documento.');
                        return;
                      }
                      if (pasoActual === 2 && !fechaNacimiento) {
                        setErrorModal('Por favor indica la fecha de nacimiento.');
                        return;
                      }
                      setErrorModal(null);
                      setPasoActual((p) => p + 1);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCrearPaciente}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Guardar y Aperturar ECE</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
