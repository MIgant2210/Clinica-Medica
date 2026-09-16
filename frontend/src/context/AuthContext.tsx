import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, RolUsuario } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (correo: string, contrasena: string) => Promise<{ ok: boolean; error?: string }>;
  quickLogin: (rol: RolUsuario) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token_clinica');
    const savedUser = localStorage.getItem('usuario_clinica');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token_clinica');
        localStorage.removeItem('usuario_clinica');
      }
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, contrasena: string) => {
    try {
      const response = await apiClient.post('/auth/login', { correo, contrasena });
      if (response.data.ok) {
        const { token: nuevoToken, usuario } = response.data;
        setToken(nuevoToken);
        setUser(usuario);
        localStorage.setItem('token_clinica', nuevoToken);
        localStorage.setItem('usuario_clinica', JSON.stringify(usuario));
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
      await login(cred.correo, cred.contrasena);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token_clinica');
    localStorage.removeItem('usuario_clinica');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickLogin, logout }}>
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
