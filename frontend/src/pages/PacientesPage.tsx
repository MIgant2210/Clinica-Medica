import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Paciente } from '../types';
import { Plus, Search, User, FileText, X, Heart, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PacientesPage: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Formulario nuevo paciente
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

  const navigate = useNavigate();

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

  const handleCrearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
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
      });

      if (res.data.ok) {
        setModalAbierto(false);
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

  const sangreColors: Record<string, string> = {
    'O+': 'bg-rose-50 text-rose-700 border-rose-200',
    'O-': 'bg-rose-100 text-rose-800 border-rose-300',
    'A+': 'bg-teal-50 text-teal-700 border-teal-200',
    'B+': 'bg-sky-50 text-sky-700 border-sky-200',
    'AB+': 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1 border border-emerald-100">
            <User className="h-3.5 w-3.5 text-emerald-600" />
            Padrón Único de Salud
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Directorio de Pacientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Identidad centralizada y apertura automática del Expediente Clínico Electrónico
          </p>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Registrar Paciente
        </button>
      </div>

      {/* Buscador Interactivo */}
      <div className="relative group">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre completo, número de DPI o código de expediente..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium transition-all"
        />
      </div>

      {/* Grid de Pacientes */}
      {cargando ? (
        <div className="p-12 text-center text-sm text-slate-400">Cargando pacientes...</div>
      ) : pacientes.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-400 bg-white rounded-[32px] border border-slate-200/80">
          No se encontraron pacientes que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pacientes.map((p) => {
            const sangreBadge = sangreColors[p.tipo_sangre] || 'bg-slate-100 text-slate-700 border-slate-200';
            return (
              <div
                key={p.id}
                className="bg-white p-6 rounded-[32px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-200/50 group-hover:scale-105 transition-transform">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-teal-700 transition-colors">
                          {p.nombre_completo}
                        </h3>
                        <span className="text-xs font-mono font-semibold text-teal-600">
                          {p.codigo_paciente}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1 ${sangreBadge}`}>
                      <Heart className="h-3 w-3 fill-current" />
                      {p.tipo_sangre}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Documento:</span>
                      <span className="font-mono font-bold text-slate-800">{p.documento}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Teléfono:</span>
                      <span className="font-medium text-slate-700">{p.telefono}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Correo:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{p.correo}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/expediente?pacienteId=${p.id}`)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-600 hover:to-emerald-600 text-teal-800 hover:text-white font-bold rounded-2xl text-xs border border-teal-200 hover:border-transparent shadow-sm transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                >
                  <FileText className="h-4 w-4" />
                  <span>Abrir Expediente (ECE)</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Registrar Paciente */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/60 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Registrar Paciente</h3>
                  <p className="text-xs text-slate-400">Apertura inmediata de historia clínica</p>
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleCrearPaciente} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Primer Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={primerNombre}
                    onChange={(e) => setPrimerNombre(e.target.value)}
                    placeholder="Ej. María"
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={primerApellido}
                    onChange={(e) => setPrimerApellido(e.target.value)}
                    placeholder="Ej. López"
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Tipo de Documento
                  </label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    <option value="DPI">DPI (CUI)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="PARTIDA">Partida de Nacimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="2981726350101"
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    F. Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Sexo
                  </label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-xs"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Tipo Sangre
                  </label>
                  <input
                    type="text"
                    value={tipoSangre}
                    onChange={(e) => setTipoSangre(e.target.value)}
                    placeholder="O+, A+, etc."
                    className="w-full px-3 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Teléfono Móvil
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="5500-1122"
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Correo Personal
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="paciente@correo.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Contacto de Emergencia
                </label>
                <input
                  type="text"
                  value={contactoEmergencia}
                  onChange={(e) => setContactoEmergencia(e.target.value)}
                  placeholder="Nombre y teléfono de un familiar cercano"
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-2xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
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
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  Guardar y Crear Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
