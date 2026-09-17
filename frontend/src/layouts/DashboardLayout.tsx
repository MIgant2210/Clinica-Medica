import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutProvider } from '../context/LayoutContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Iniciando ClinicMed...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LayoutProvider>
      <div className="relative min-h-screen w-full bg-gradient-to-br from-sky-50 via-slate-50 to-teal-50 dark:from-[#040b16] dark:via-[#020617] dark:to-[#09151a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-500">
        
        {/* Fondo Animado de Malla (Mesh Gradient) y Puntos */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Blobs de color más vívidos */}
          <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] bg-teal-400/20 dark:bg-teal-500/15 animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] bg-sky-400/20 dark:bg-sky-500/15 animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[60%] w-[35vw] h-[35vw] rounded-full blur-[100px] bg-emerald-400/15 dark:bg-emerald-500/10 animate-blob" style={{ animationDelay: '4s' }} />
          <div className="absolute top-[20%] right-[30%] w-[25vw] h-[25vw] rounded-full blur-[90px] bg-purple-400/10 dark:bg-indigo-500/10 animate-blob" style={{ animationDelay: '6s' }} />
          
          {/* Patrón de puntos premium (Dotted Grid) */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        {/* Contenedor Principal */}
        <div className="relative z-10 flex h-screen w-full p-2 sm:p-4 gap-4">
          {/* Sidebar Flotante */}
          <div className="hidden lg:flex w-[260px] flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* Contenido Central */}
          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            <Navbar />
            <main className="flex-1 overflow-y-auto mt-4 pb-4">
              <div className="h-full w-full max-w-7xl mx-auto px-2 sm:px-4">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
};
