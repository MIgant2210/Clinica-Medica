import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Paciente } from '../types';
import { Plus, Search, User, FileText, Phone, Mail, X } from 'lucide-react';
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
        // Limpiar campos
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Directorio de Pacientes</h1>
          <p className="text-sm text-slate-500">
            Registro unificado de identidad civil y apertura automática de expediente clínico
          </p>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Registrar Paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, documento (DPI) o código de paciente..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Lista / Grid de Pacientes */}
      {cargando ? (
        <div className="p-8 text-center text-sm text-slate-500">Cargando pacientes...</div>
      ) : pacientes.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-400 bg-white rounded-3xl border border-slate-200">
          No se encontraron pacientes que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pacientes.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{p.nombre_completo}</h3>
                      <span className="text-xs font-mono text-slate-400">{p.codigo_paciente}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    {p.tipo_sangre}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 my-4 border-y border-slate-50 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 w-20">Documento:</span>
                    <span>{p.documento}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{p.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{p.correo}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/expediente?pacienteId=${p.id}`)}
                className="w-full mt-2 py-2 px-3 bg-slate-50 hover:bg-sky-50 text-sky-700 font-semibold rounded-xl text-xs border border-slate-200/70 hover:border-sky-300 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Abrir Expediente (ECE)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Registrar Paciente */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Paciente</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorModal && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorModal}
              </div>
            )}

            <form onSubmit={handleCrearPaciente} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primer Nombre *</label>
                  <input
                    type="text"
                    required
                    value={primerNombre}
                    onChange={(e) => setPrimerNombre(e.target.value)}
                    placeholder="Ej. María"
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primer Apellido *</label>
                  <input
                    type="text"
                    required
                    value={primerApellido}
                    onChange={(e) => setPrimerApellido(e.target.value)}
                    placeholder="Ej. López"
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Documento</label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="DPI">DPI (CUI)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="PARTIDA">Partida de Nacimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número Documento *</label>
                  <input
                    type="text"
                    required
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="2981726350101"
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">F. Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Sangre</label>
                  <input
                    type="text"
                    value={tipoSangre}
                    onChange={(e) => setTipoSangre(e.target.value)}
                    placeholder="O+, A+, etc."
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="5500-1122"
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="paciente@correo.com"
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={contactoEmergencia}
                  onChange={(e) => setContactoEmergencia(e.target.value)}
                  placeholder="Nombre y Teléfono del familiar"
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
