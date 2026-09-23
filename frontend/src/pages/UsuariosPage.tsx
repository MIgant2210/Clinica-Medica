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
    return <div className="p-12 text-center text-red-500 font-bold">No tienes permisos para ver esta página.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gestión de Usuarios</h1>
            <p className="text-sm text-slate-500">Administra los accesos al sistema clínico</p>
          </div>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-slate-500">Cargando usuarios...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 font-bold">Usuario</th>
                <th className="p-4 font-bold">Rol</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">{u.nombre_completo}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{u.correo} ({u.usuario})</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">{u.rol}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex w-fit items-center gap-1 ${u.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {u.estado === 'ACTIVO' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {u.estado}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => abrirModalEditar(u)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => inactivarUsuario(u.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-black mb-4">
              {usuarioEditar ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
            </h2>
            <form onSubmit={handleGuardarUsuario} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Nombre Completo *</label>
                  <input type="text" required value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Nombre de Usuario *</label>
                  <input type="text" required value={usuario} onChange={e => setUsuario(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Correo Electrónico *</label>
                  <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">{usuarioEditar ? 'Nueva Contraseña' : 'Contraseña *'}</label>
                  <input type="password" required={!usuarioEditar} value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder={usuarioEditar ? "Dejar en blanco para no cambiar" : ""} className="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Rol *</label>
                  <select value={rol} onChange={e => setRol(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl">
                    <option value="ADMIN">Administrador</option>
                    <option value="MEDICO">Médico</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                  </select>
                </div>
                {usuarioEditar && (
                  <div>
                    <label className="block text-xs font-bold mb-1">Estado</label>
                    <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl">
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
