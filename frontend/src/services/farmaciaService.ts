export interface Medicamento {
  id: string;
  codigo: string;
  nombre: string;
  principio_activo: string;
  categoria: 'ANTIBIOTICOS' | 'ANALGESICOS' | 'CARDIOVASCULAR' | 'METABOLICOS' | 'RESPIRATORIOS' | 'GASTROINTESTINALES' | 'OTROS';
  presentacion: string;
  stock_actual: number;
  stock_minimo: number;
  precio_unitario: number;
  lote: string;
  fecha_vencimiento: string;
  ubicacion: string;
}

const MEDICAMENTOS_SEMILLA: Medicamento[] = [
  {
    id: 'med-1',
    codigo: 'MED-AMOX-500',
    nombre: 'Amoxicilina + Ácido Clavulánico',
    principio_activo: 'Amoxicilina 500mg / Clavulanato 125mg',
    categoria: 'ANTIBIOTICOS',
    presentacion: 'Caja con 14 tabletas',
    stock_actual: 42,
    stock_minimo: 15,
    precio_unitario: 95.00,
    lote: 'L-2601-AMX',
    fecha_vencimiento: '2027-04-15',
    ubicacion: 'Estante A-01 (Antibióticos)'
  },
  {
    id: 'med-2',
    codigo: 'MED-PARA-500',
    nombre: 'Paracetamol Forte',
    principio_activo: 'Paracetamol 500mg',
    categoria: 'ANALGESICOS',
    presentacion: 'Caja con 30 tabletas',
    stock_actual: 120,
    stock_minimo: 30,
    precio_unitario: 25.00,
    lote: 'L-2509-PAR',
    fecha_vencimiento: '2027-11-20',
    ubicacion: 'Estante B-04 (Analgésicos)'
  },
  {
    id: 'med-3',
    codigo: 'MED-IBU-400',
    nombre: 'Ibuprofeno Antiinflamatorio',
    principio_activo: 'Ibuprofeno 400mg',
    categoria: 'ANALGESICOS',
    presentacion: 'Blíster con 10 cápsulas blandas',
    stock_actual: 8,
    stock_minimo: 20,
    precio_unitario: 32.50,
    lote: 'L-2508-IBU',
    fecha_vencimiento: '2026-11-10',
    ubicacion: 'Estante B-05 (Analgésicos)'
  },
  {
    id: 'med-4',
    codigo: 'MED-LOS-50',
    nombre: 'Losartán Potásico',
    principio_activo: 'Losartán 50mg',
    categoria: 'CARDIOVASCULAR',
    presentacion: 'Caja con 30 tabletas recubiertas',
    stock_actual: 35,
    stock_minimo: 15,
    precio_unitario: 65.00,
    lote: 'L-2512-LOS',
    fecha_vencimiento: '2027-02-28',
    ubicacion: 'Estante C-02 (Cardiovascular)'
  },
  {
    id: 'med-5',
    codigo: 'MED-MET-850',
    nombre: 'Metformina Clorhidrato',
    principio_activo: 'Metformina 850mg',
    categoria: 'METABOLICOS',
    presentacion: 'Caja con 60 tabletas',
    stock_actual: 6,
    stock_minimo: 25,
    precio_unitario: 80.00,
    lote: 'L-2506-MET',
    fecha_vencimiento: '2026-10-30',
    ubicacion: 'Estante C-05 (Metabólicos)'
  },
  {
    id: 'med-6',
    codigo: 'MED-OME-20',
    nombre: 'Omeprazol Protect',
    principio_activo: 'Omeprazol 20mg',
    categoria: 'GASTROINTESTINALES',
    presentacion: 'Frasco con 28 cápsulas',
    stock_actual: 54,
    stock_minimo: 20,
    precio_unitario: 45.00,
    lote: 'L-2602-OME',
    fecha_vencimiento: '2027-08-15',
    ubicacion: 'Estante D-01 (Gastrointestinal)'
  },
  {
    id: 'med-7',
    codigo: 'MED-SALB-AER',
    nombre: 'Salbutamol Inhalador',
    principio_activo: 'Salbutamol 100mcg/dosis',
    categoria: 'RESPIRATORIOS',
    presentacion: 'Aerosol inhalador 200 dosis',
    stock_actual: 18,
    stock_minimo: 10,
    precio_unitario: 75.00,
    lote: 'L-2511-SAL',
    fecha_vencimiento: '2027-06-30',
    ubicacion: 'Estante E-03 (Respiratorio)'
  },
  {
    id: 'med-8',
    codigo: 'MED-AZIT-500',
    nombre: 'Azitromicina Monohidrato',
    principio_activo: 'Azitromicina 500mg',
    categoria: 'ANTIBIOTICOS',
    presentacion: 'Caja con 3 tabletas',
    stock_actual: 0,
    stock_minimo: 10,
    precio_unitario: 68.00,
    lote: 'L-2503-AZI',
    fecha_vencimiento: '2026-12-01',
    ubicacion: 'Estante A-04 (Antibióticos)'
  }
];

const STORAGE_KEY = 'clinica_farmacia_inventario_v1';

export const getMedicamentosFarmacia = (): Medicamento[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error al leer medicamentos de farmacia:', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MEDICAMENTOS_SEMILLA));
  return MEDICAMENTOS_SEMILLA;
};

export const guardarMedicamentoFarmacia = (nuevo: Medicamento): Medicamento[] => {
  const actuales = getMedicamentosFarmacia();
  const actualizados = [nuevo, ...actuales];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};

export const actualizarStockFarmacia = (id: string, nuevoStock: number): Medicamento[] => {
  const actuales = getMedicamentosFarmacia();
  const actualizados = actuales.map(m => m.id === id ? { ...m, stock_actual: Math.max(0, nuevoStock) } : m);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};

export const dispensarStockFarmacia = (id: string, cantidad: number): Medicamento[] => {
  const actuales = getMedicamentosFarmacia();
  const actualizados = actuales.map(m => {
    if (m.id === id) {
      return { ...m, stock_actual: Math.max(0, m.stock_actual - cantidad) };
    }
    return m;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  return actualizados;
};
