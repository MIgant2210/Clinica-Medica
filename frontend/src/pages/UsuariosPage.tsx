import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Plus, Edit2, Trash2, Shield, CheckCircle2, XCircle } from 'lucide-react';

interface Usuario {
  id: string;
  usuario: string;
  correo: string;
  rol: string;
  nombre_completo: string;
  estado: string;
  fecha_registro: string;
}

export const UsuariosPage: React.FC = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);

  // Form State
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('MEDICO');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [estado, setEstado] = useState('ACTIVO');

  const cargarUsuarios = async () => {
    try {
      const res = await apiClient.get('/usuarios');
      if (res.data.ok) {
        setUsuarios(res.data.usuarios);
      }
    } catch (e) {
      console.error('Error al cargar usuarios:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirModalNuevo = () => {
    setUsuarioEditar(null);
    setUsuario('');
    setCorreo('');
    setRol('MEDICO');
    setNombreCompleto('');
    setContrasena('');
    setEstado('ACTIVO');
    setModalAbierto(true);
  };

  const abrirModalEditar = (u: Usuario) => {
    setUsuarioEditar(u);
    setUsuario(u.usuario);
    setCorreo(u.correo);
    setRol(u.rol);
    setNombreCompleto(u.nombre_completo);
    setContrasena(''); // Leave blank unless they want to change it
    setEstado(u.estado);
    setModalAbierto(true);
  };

  const handleGuardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        usuario, correo, rol, nombre_completo: nombreCompleto, estado, contrasena
      };

      if (usuarioEditar) {
        await apiClient.put(`/usuarios/${usuarioEditar.id}`, payload);
      } else {
        await apiClient.post('/usuarios', payload);
      }
      setModalAbierto(false);
      cargarUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar el usuario.');
    }
  };

  const inactivarUsuario = async (id: string) => {
    if (window.confirm('¿Estás seguro de inactivar este usuario?')) {
      try {
        await apiClient.delete(`/usuarios/${id}`);
        cargarUsuarios();
      } catch (err: any) {
        alert('Error al inactivar usuario.');
      }
    }
  };

  if (user?.rol !== 'ADMIN') {
    return <div className="p-12 text-center text-rose-500 font-bold">No tienes permisos para ver esta página.</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up relative">
      {/* Fondos flotantes decorativos */}
      <div className="absolute top-0 right-10 w-72 h-72 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Encabezado y Acción */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-black uppercase tracking-widest mb-3">
            <Shield className="h-3.5 w-3.5" />
            Control de Accesos
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Administra los roles, accesos y permisos del sistema clínico.
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="group relative px-6 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] text-sm font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-sky-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          <Plus className="h-5 w-5 relative z-10" />
          <span className="relative z-10">Nuevo Usuario</span>
        </button>
      </div>

      {cargando ? (
        <div className="p-16 text-center text-sm font-bold text-slate-400 animate-pulse">Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <div className="p-16 text-center text-sm font-bold text-slate-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] border border-white/60 dark:border-white/10">
          No se encontraron usuarios.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[1.25rem] bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Shield className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {u.nombre_completo}
                      </h3>
                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-lg mt-1 inline-block">
                        @{u.usuario}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-white/60 dark:border-white/5 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Rol</span>
                    <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-lg text-[10px] font-black">{u.rol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Correo</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{u.correo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-black">Estado</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${u.estado === 'ACTIVO' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'}`}>
                      {u.estado === 'ACTIVO' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {u.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => abrirModalEditar(u)}
                  className="flex-1 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-200 dark:border-sky-800 hover:border-sky-500 rounded-[1.25rem] py-3 flex items-center justify-center gap-2 transition-all duration-300 font-bold text-xs"
                >
                  <Edit2 className="h-4 w-4" /> Editar
                </button>
                <button
                  onClick={() => inactivarUsuario(u.id)}
                  className="w-14 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200 dark:border-rose-800 hover:border-rose-500 rounded-[1.25rem] flex items-center justify-center transition-all duration-300"
                  title="Inactivar Usuario"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE USUARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-xl shadow-2xl flex flex-col border border-white/20 dark:border-white/10 max-h-full overflow-hidden">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[1.25rem] bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner font-bold border border-purple-500/20">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Control de accesos y credenciales
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 sm:p-8 overflow-y-auto">
              <form id="form-usuario" onSubmit={handleGuardarUsuario} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nombre Completo *
                    </label>
                    <input type="text" required value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Usuario *
                    </label>
                    <input type="text" required value={usuario} onChange={e => setUsuario(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Correo Electrónico *
                    </label>
                    <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                      {usuarioEditar ? 'Nueva Contraseña' : 'Contraseña *'}
                      {usuarioEditar && <span className="text-[9px] text-slate-400 font-normal lowercase">(Opcional)</span>}
                    </label>
                    <input type="password" required={!usuarioEditar} value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder={usuarioEditar ? "Dejar vacío para no cambiar" : ""} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Rol *
                    </label>
                    <select value={rol} onChange={e => setRol(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium font-bold text-slate-700 dark:text-slate-300">
                      <option value="ADMIN">Administrador</option>
                      <option value="MEDICO">Médico</option>
                      <option value="RECEPCIONISTA">Recepcionista</option>
                    </select>
                  </div>
                  {usuarioEditar && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Estado
                      </label>
                      <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border rounded-2xl border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium font-bold text-slate-700 dark:text-slate-300">
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                      </select>
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            {/* Pie del Modal */}
            <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-usuario"
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{usuarioEditar ? 'Actualizar Usuario' : 'Registrar Usuario'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
