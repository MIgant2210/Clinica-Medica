import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CitasPage } from './pages/CitasPage';
import { PacientesPage } from './pages/PacientesPage';
import { ExpedientePage } from './pages/ExpedientePage';
import { AuditoriaPage } from './pages/AuditoriaPage';
import { UsuariosPage } from './pages/UsuariosPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas bajo el Layout principal */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="citas" element={<CitasPage />} />
              <Route path="pacientes" element={<PacientesPage />} />
              <Route path="expediente" element={<ExpedientePage />} />
              <Route path="auditoria" element={<AuditoriaPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
