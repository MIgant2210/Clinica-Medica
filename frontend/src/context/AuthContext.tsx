import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, RolUsuario, DatosRegistroUsuario } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  simulandoAdmin: boolean;
  login: (correo: string, contrasena: string, esQuickLogin?: boolean) => Promise<{ ok: boolean; error?: string }>;
  register: (datos: DatosRegistroUsuario) => Promise<{ ok: boolean; error?: string; errors?: Record<string, string>; mensaje?: string }>;
  quickLogin: (rol: RolUsuario) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulandoAdmin, setSimulandoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('simulando_desde_admin') === 'true';
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('token_clinica');
    const savedUser = localStorage.getItem('usuario_clinica');
    const savedSimulando = localStorage.getItem('simulando_desde_admin') === 'true';

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setSimulandoAdmin(savedSimulando);
      } catch (e) {
        localStorage.removeItem('token_clinica');
        localStorage.removeItem('usuario_clinica');
        localStorage.removeItem('simulando_desde_admin');
        setSimulandoAdmin(false);
      }
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string, esQuickLogin: boolean = false) => {
    try {
      const response = await apiClient.post('/auth/login', { correo, contrasena });
      if (response.data.ok) {
        const { token: nuevoToken, usuario } = response.data;
        setToken(nuevoToken);
        setUser(usuario);
        localStorage.setItem('token_clinica', nuevoToken);
        localStorage.setItem('usuario_clinica', JSON.stringify(usuario));

        // Si es un inicio de sesión manual directo (formulario de login)
        // y el rol NO es ADMIN, nos aseguramos de apagar cualquier simulación previa.
        if (!esQuickLogin && usuario.rol !== 'ADMIN') {
          localStorage.removeItem('simulando_desde_admin');
          setSimulandoAdmin(false);
        }
        return { ok: true };
      }
      return { ok: false, error: response.data.error || 'Credenciales inválidas' };
    } catch (err: any) {
      return {
        ok: false,
        error: err.response?.data?.error || 'Error al conectar con el servidor',
      };
    }
  };

  const quickLogin = async (rol: RolUsuario) => {
    const credencialesPorRol: Record<RolUsuario, { correo: string; contrasena: string }> = {
      ADMIN: { correo: 'admin@clinica.com', contrasena: 'admin123' },
      MEDICO: { correo: 'dr.mendoza@redsalud.gt', contrasena: 'medico123' },
      RECEPCIONISTA: { correo: 'recepcion@redsalud.gt', contrasena: 'recep123' },
      PACIENTE: { correo: 'juan.perez@gmail.com', contrasena: 'paciente123' },
    };

    const cred = credencialesPorRol[rol];
    if (cred) {
      const puedeSimular = user?.rol === 'ADMIN' || simulandoAdmin || localStorage.getItem('simulando_desde_admin') === 'true';

      if (puedeSimular) {
        if (rol !== 'ADMIN') {
          localStorage.setItem('simulando_desde_admin', 'true');
          setSimulandoAdmin(true);
        } else {
          localStorage.removeItem('simulando_desde_admin');
          setSimulandoAdmin(false);
        }
      }
      await login(cred.correo, cred.contrasena, true);
    }
  };

  const register = async (datos: DatosRegistroUsuario) => {
    try {
      const response = await apiClient.post('/auth/register', datos);
      if (response.data.ok) {
        const { token: nuevoToken, usuario } = response.data;
        if (nuevoToken && usuario) {
          setToken(nuevoToken);
          setUser(usuario);
          localStorage.setItem('token_clinica', nuevoToken);
          localStorage.setItem('usuario_clinica', JSON.stringify(usuario));
          localStorage.removeItem('simulando_desde_admin');
          setSimulandoAdmin(false);
        }
        return { ok: true, mensaje: response.data.mensaje, usuario };
      }
      return {
        ok: false,
        error: response.data.error || 'Error al procesar el registro.',
        errors: response.data.errors,
      };
    } catch (err: any) {
      return {
        ok: false,
        error: err.response?.data?.error || 'Error al conectar con el servidor para registrar la cuenta.',
        errors: err.response?.data?.errors,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSimulandoAdmin(false);
    localStorage.removeItem('token_clinica');
    localStorage.removeItem('usuario_clinica');
    localStorage.removeItem('simulando_desde_admin');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, simulandoAdmin, login, register, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
