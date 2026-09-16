import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import organizacionRoutes from './modules/organizacion/organizacion.routes';
import pacientesRoutes from './modules/pacientes/pacientes.routes';
import citasRoutes from './modules/citas/citas.routes';
import clinicoRoutes from './modules/clinico/clinico.routes';
import auditoriaRoutes from './modules/auditoria/auditoria.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({
  origin: '*', // Permitir conexión desde frontend local y en red
  credentials: true
}));
app.use(express.json());

// Log de peticiones HTTP
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Endpoint de verificación de salud
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    servicio: 'API Sistema Integrado de Gestión Clínica y Expediente Clínico Electrónico',
    version: '1.0.0',
    estado: 'ACTIVO',
    timestamp: new Date().toISOString(),
  });
});

// Registro de Módulos de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/organizacion', organizacionRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/clinico', clinicoRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// Manejador de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.url}`,
  });
});

// Manejador centralizado de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor. Por favor intente más tarde.',
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('=============================================================');
  console.log(`🏥 SERVIDOR CLÍNICA MÉDICA INICIADO CON ÉXITO`);
  console.log(`📡 URL API: http://localhost:${PORT}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log('=============================================================');
});

export default app;
