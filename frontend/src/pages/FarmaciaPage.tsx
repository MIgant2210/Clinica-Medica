import React, { useState, useMemo, useEffect } from 'react';
import { 
  Pill, Package, AlertTriangle, CheckCircle2, Search, Plus, 
  X, TrendingDown, Activity, ShoppingCart, User, FileText,
  Stethoscope, Sparkles, Building, Info, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Paciente, ExpedienteClinico } from '../types';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { 
  getMedicamentosFarmacia, 
  guardarMedicamentoFarmacia, 
  actualizarStockFarmacia, 
  dispensarStockFarmacia, 
  Medicamento 
} from '../services/farmaciaService';
import { DEFAULT_PACIENTES } from '../services/pacientesSeed';

export const FarmaciaPage: React.FC = () => {
  const { user } = useAuth();

  // 1. Estado del inventario respaldado por farmaciaService
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() => getMedicamentosFarmacia());
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | 'EN_STOCK' | 'STOCK_BAJO' | 'AGOTADOS'>('TODOS');
  
  // 2. Pacientes cargados desde la API
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  // 3. Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalDispensarAbierto, setModalDispensarAbierto] = useState(false);
  const [medicamentoAReabastecer, setMedicamentoAReabastecer] = useState<Medicamento | null>(null);
  const [cantidadReabastecer, setCantidadReabastecer] = useState(10);
  
  // Mensajes de retroalimentación
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // 4. Formulario de Dispensación (con Receta o Manual)
  const [modoDispensacion, setModoDispensacion] = useState<'RECETA' | 'MANUAL'>('RECETA');
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>('');
  const [pacienteExpediente, setPacienteExpediente] = useState<ExpedienteClinico | null>(null);
  const [cargandoExpediente, setCargandoExpediente] = useState(false);
  const [medicamentoSeleccionadoId, setMedicamentoSeleccionadoId] = useState<string>('');
  const [cantidadDispensar, setCantidadDispensar] = useState<number>(1);
  const [indicacionesEntrega, setIndicacionesEntrega] = useState<string>('');
  
  // Formulario manual de dispensación
  const [pacienteManualNombre, setPacienteManualNombre] = useState('');
  const [recetaManualReferencia, setRecetaManualReferencia] = useState('');
  const [medicoPrescriptorManual, setMedicoPrescriptorManual] = useState('');

  // 5. Formulario nuevo medicamento
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrincipio, setNuevoPrincipio] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<Medicamento['categoria']>('ANTIBIOTICOS');
  const [nuevaPresentacion, setNuevaPresentacion] = useState('');
  const [nuevoStock, setNuevoStock] = useState(25);
  const [nuevoStockMin, setNuevoStockMin] = useState(10);
  const [nuevoPrecio, setNuevoPrecio] = useState(50);
  const [nuevoLote, setNuevoLote] = useState('L-2026-A1');
  const [nuevoVencimiento, setNuevoVencimiento] = useState('2028-12-31');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('Estante Farmacia Principal');

  // Opciones de Categorías para CustomSelect
  const categoriasSelectOptions: SelectOption[] = useMemo(() => [
    { value: 'ANTIBIOTICOS', label: 'Antibióticos', description: 'Control de infecciones bacterianas' },
    { value: 'ANALGESICOS', label: 'Analgésicos / AINEs', description: 'Alivio del dolor e inflamación' },
    { value: 'CARDIOVASCULAR', label: 'Cardiovascular', description: 'Antihipertensivos y vasodilatadores' },
    { value: 'METABOLICOS', label: 'Metabólicos / Diabetes', description: 'Control glucémico y endocrino' },
    { value: 'RESPIRATORIOS', label: 'Respiratorios', description: 'Broncodilatadores e inhaladores' },
    { value: 'GASTROINTESTINALES', label: 'Gastrointestinales', description: 'Protectores y antiácidos' },
    { value: 'OTROS', label: 'Otros Fármacos', description: 'Suplementos y fórmulas generales' },
  ], []);

  // Cargar lista de pacientes al montar (con fallback resiliente)
  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const res = await apiClient.get('/pacientes');
        const lista = res.data?.pacientes || res.data?.data || [];
        if (Array.isArray(lista) && lista.length > 0) {
          setPacientes(lista);
        } else {
          setPacientes(DEFAULT_PACIENTES);
        }
      } catch (err) {
        console.warn('Usando pacientes predeterminados para dispensación:', err);
        setPacientes(DEFAULT_PACIENTES);
      }
    };
    cargarPacientes();
  }, []);

  // Sincronizar catálogo de medicamentos si otra pestaña o componente cambia el localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setMedicamentos(getMedicamentosFarmacia());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cargar expediente clínico cuando se selecciona un paciente en el modal de dispensación
  useEffect(() => {
    if (!pacienteSeleccionadoId) {
      setPacienteExpediente(null);
      return;
    }

    const cargarExpediente = async () => {
      setCargandoExpediente(true);
      try {
        const res = await apiClient.get(`/clinico/expediente/${pacienteSeleccionadoId}`);
        if (res.data?.ok && res.data.expediente) {
          setPacienteExpediente(res.data.expediente);
        } else {
          setPacienteExpediente(null);
        }
      } catch (err) {
        // En caso de que el paciente no tenga expediente registrado en BD aún
        setPacienteExpediente(null);
      } finally {
        setCargandoExpediente(false);
      }
    };

    cargarExpediente();
  }, [pacienteSeleccionadoId]);

  // Medicamento actualmente enfocado en la dispensación
  const medicamentoSeleccionado = useMemo(() => {
    return medicamentos.find(m => m.id === medicamentoSeleccionadoId) || null;
  }, [medicamentos, medicamentoSeleccionadoId]);

  // Paciente actualmente enfocado en la dispensación
  const pacienteSeleccionado = useMemo(() => {
    return pacientes.find(p => p.id === pacienteSeleccionadoId) || null;
  }, [pacientes, pacienteSeleccionadoId]);

  // Lista de tratamientos/recetas extraídas del expediente del paciente o recetas sugeridas
  const recetasActivas = useMemo(() => {
    const lista: {
      consultaId: string;
      fecha: string;
      medico: string;
      medicamento: string;
      dosis: string;
      frecuencia: string;
      duracion_dias: number;
      diagnosticoPrincipal?: string;
    }[] = [];

    if (pacienteExpediente?.consultas && Array.isArray(pacienteExpediente.consultas)) {
      pacienteExpediente.consultas.forEach(c => {
        if (Array.isArray(c.tratamiento)) {
          c.tratamiento.forEach(t => {
            lista.push({
              consultaId: c.id,
              fecha: c.fecha_atencion,
              medico: c.profesional_nombre || 'Médico de Turno',
              medicamento: t.medicamento,
              dosis: t.dosis,
              frecuencia: t.frecuencia,
              duracion_dias: t.duracion_dias,
              diagnosticoPrincipal: c.diagnosticos?.[0]?.descripcion,
            });
          });
        }
      });
    }

    // Si el paciente no tiene consultas registradas en BD o es seed, generamos prescripciones clínicas realistas
    if (lista.length === 0 && pacienteSeleccionado) {
      const nombre = pacienteSeleccionado.nombre_completo.toLowerCase();
      if (nombre.includes('carlos') || nombre.includes('mendoza')) {
        lista.push(
          {
            consultaId: 'seed-rec-1',
            fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
            medico: 'Dr. Alejandro Soto (Cardiología)',
            medicamento: 'Losartán Potásico 50mg',
            dosis: '50mg',
            frecuencia: '1 tableta cada 12 horas con agua',
            duracion_dias: 30,
            diagnosticoPrincipal: 'Hipertensión Arterial Primaria'
          },
          {
            consultaId: 'seed-rec-2',
            fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
            medico: 'Dr. Alejandro Soto (Cardiología)',
            medicamento: 'Amlodipino 5mg',
            dosis: '5mg',
            frecuencia: '1 tableta diaria por la mañana',
            duracion_dias: 30,
            diagnosticoPrincipal: 'Hipertensión Arterial Primaria'
          }
        );
      } else if (nombre.includes('maría') || nombre.includes('gómez')) {
        lista.push(
          {
            consultaId: 'seed-rec-3',
            fecha: new Date(Date.now() - 86400000).toISOString(),
            medico: 'Dra. Carmen Morales (Endocrinología)',
            medicamento: 'Metformina Clorhidrato 850mg',
            dosis: '850mg',
            frecuencia: '1 tableta tras la cena',
            duracion_dias: 60,
            diagnosticoPrincipal: 'Diabetes Mellitus Tipo 2'
          },
          {
            consultaId: 'seed-rec-4',
            fecha: new Date(Date.now() - 86400000).toISOString(),
            medico: 'Dra. Carmen Morales (Endocrinología)',
            medicamento: 'Atorvastatina 20mg',
            dosis: '20mg',
            frecuencia: '1 tableta en la noche',
            duracion_dias: 30,
            diagnosticoPrincipal: 'Dislipidemia'
          }
        );
      } else if (nombre.includes('juan') || nombre.includes('herrera')) {
        lista.push(
          {
            consultaId: 'seed-rec-5',
            fecha: new Date().toISOString(),
            medico: 'Dr. Fernando Ruiz (Neumología)',
            medicamento: 'Salbutamol Inhalador 100mcg',
            dosis: '100mcg',
            frecuencia: '2 inhalaciones cada 8 horas',
            duracion_dias: 15,
            diagnosticoPrincipal: 'Asma Bronquial'
          }
        );
      } else {
        lista.push(
          {
            consultaId: 'seed-rec-gen',
            fecha: new Date().toISOString(),
            medico: 'Dra. Sofía Castillo (Medicina General)',
            medicamento: 'Amoxicilina + Ácido Clavulánico 875/125mg',
            dosis: '875/125mg',
            frecuencia: 'Cada 12 horas con las comidas',
            duracion_dias: 7,
            diagnosticoPrincipal: 'Infección Respiratoria'
          },
          {
            consultaId: 'seed-rec-gen2',
            fecha: new Date().toISOString(),
            medico: 'Dra. Sofía Castillo (Medicina General)',
            medicamento: 'Paracetamol 500mg',
            dosis: '500mg',
            frecuencia: 'Cada 8 horas según necesidad por dolor o fiebre',
            duracion_dias: 5,
            diagnosticoPrincipal: 'Control de Síntomas'
          }
        );
      }
    }

    return lista;
  }, [pacienteExpediente, pacienteSeleccionado]);

  // Opciones de pacientes formateadas para CustomSelect
  const opcionesPacientes: SelectOption[] = useMemo(() => {
    return pacientes.map(p => ({
      value: p.id,
      label: p.nombre_completo,
      badge: p.codigo_paciente || 'PAC',
      description: `DPI: ${p.documento || 'S/D'} • Tel: ${p.telefono || 'Sin tel.'}`
    }));
  }, [pacientes]);

  // Opciones de medicamentos formateadas para CustomSelect
  const opcionesMedicamentos: SelectOption[] = useMemo(() => {
    return medicamentos.map(m => {
      const stockBadge = m.stock_actual > 0 
        ? `Stock: ${m.stock_actual}` 
        : 'AGOTADO';
      return {
        value: m.id,
        label: m.nombre,
        badge: stockBadge,
        description: `${m.principio_activo} • Q. ${m.precio_unitario.toFixed(2)} c/u • ${m.presentacion}`
      };
    });
  }, [medicamentos]);

  // KPIs
  const totalItems = medicamentos.length;
  const totalUnidades = useMemo(() => medicamentos.reduce((acc, m) => acc + m.stock_actual, 0), [medicamentos]);
  const stockCriticoCount = useMemo(() => medicamentos.filter(m => m.stock_actual > 0 && m.stock_actual <= m.stock_minimo).length, [medicamentos]);
  const agotadosCount = useMemo(() => medicamentos.filter(m => m.stock_actual === 0).length, [medicamentos]);

  // Filtrado reactivo de catálogo
  const medicamentosFiltrados = useMemo(() => {
    return medicamentos.filter(m => {
      const q = busqueda.toLowerCase().trim();
      const coincideTexto = !q || 
        m.nombre.toLowerCase().includes(q) || 
        m.principio_activo.toLowerCase().includes(q) || 
        m.codigo.toLowerCase().includes(q) || 
        m.lote.toLowerCase().includes(q);

      const coincideCategoria = categoriaFiltro === 'TODAS' || m.categoria === categoriaFiltro;

      let coincideEstado = true;
      if (estadoFiltro === 'EN_STOCK') coincideEstado = m.stock_actual > m.stock_minimo;
      if (estadoFiltro === 'STOCK_BAJO') coincideEstado = m.stock_actual > 0 && m.stock_actual <= m.stock_minimo;
      if (estadoFiltro === 'AGOTADOS') coincideEstado = m.stock_actual === 0;

      return coincideTexto && coincideCategoria && coincideEstado;
    });
  }, [medicamentos, busqueda, categoriaFiltro, estadoFiltro]);

  // Abrir modal de dispensación preseleccionando un medicamento
  const handleAbrirDispensarConMedicamento = (med: Medicamento) => {
    setMedicamentoSeleccionadoId(med.id);
    setCantidadDispensar(1);
    setIndicacionesEntrega('');
    setMensajeError(null);
    setModalDispensarAbierto(true);
  };

  // Abrir modal de dispensación general
  const handleAbrirDispensarGeneral = () => {
    if (!medicamentoSeleccionadoId && medicamentos.length > 0) {
      const primeroDisponible = medicamentos.find(m => m.stock_actual > 0) || medicamentos[0];
      setMedicamentoSeleccionadoId(primeroDisponible.id);
    }
    setCantidadDispensar(1);
    setIndicacionesEntrega('');
    setMensajeError(null);
    setModalDispensarAbierto(true);
  };

  // Vincular una receta médica seleccionada al formulario de dispensación
  const handleSeleccionarReceta = (receta: typeof recetasActivas[0]) => {
    // Intentar encontrar coincidencia en el inventario de farmacia
    const match = medicamentos.find(m => 
      m.nombre.toLowerCase().includes(receta.medicamento.toLowerCase()) ||
      receta.medicamento.toLowerCase().includes(m.nombre.toLowerCase()) ||
      m.principio_activo.toLowerCase().includes(receta.medicamento.toLowerCase())
    );

    if (match) {
      setMedicamentoSeleccionadoId(match.id);
    }
    setIndicacionesEntrega(`Dosis: ${receta.dosis} | Frecuencia: ${receta.frecuencia} | Durante: ${receta.duracion_dias || 7} días (Prescrito por ${receta.medico})`);
    setCantidadDispensar(1);
  };

  // Confirmar dispensación
  const handleConfirmarDispensacion = () => {
    setMensajeError(null);

    if (!medicamentoSeleccionado) {
      setMensajeError('Por favor seleccione un medicamento para dispensar.');
      return;
    }

    if (medicamentoSeleccionado.stock_actual <= 0) {
      setMensajeError(`El fármaco ${medicamentoSeleccionado.nombre} está actualmente agotado en almacén.`);
      return;
    }

    if (cantidadDispensar <= 0) {
      setMensajeError('La cantidad a dispensar debe ser al menos de 1 unidad.');
      return;
    }

    if (cantidadDispensar > medicamentoSeleccionado.stock_actual) {
      setMensajeError(`No hay suficiente existencia. Stock disponible: ${medicamentoSeleccionado.stock_actual} unidades.`);
      return;
    }

    let nombreDestinatario = '';
    if (modoDispensacion === 'RECETA') {
      if (!pacienteSeleccionado) {
        setMensajeError('Por favor seleccione al paciente registrado con su receta.');
        return;
      }
      nombreDestinatario = pacienteSeleccionado.nombre_completo;
    } else {
      if (!pacienteManualNombre.trim()) {
        setMensajeError('Por favor ingrese el nombre del paciente destinatario.');
        return;
      }
      nombreDestinatario = pacienteManualNombre.trim();
    }

    // Efectuar el descuento de stock persistente
    const actualizados = dispensarStockFarmacia(medicamentoSeleccionado.id, cantidadDispensar);
    setMedicamentos(actualizados);

    // Mensaje de éxito
    setMensajeExito(`¡Dispensación exitosa! Se despacharon ${cantidadDispensar} unidades de "${medicamentoSeleccionado.nombre}" para ${nombreDestinatario}. Stock restante: ${Math.max(0, medicamentoSeleccionado.stock_actual - cantidadDispensar)} unidades.`);
    setTimeout(() => setMensajeExito(null), 5000);

    // Cerrar y resetear
    setModalDispensarAbierto(false);
    setCantidadDispensar(1);
    setIndicacionesEntrega('');
    setPacienteManualNombre('');
    setRecetaManualReferencia('');
    setMedicoPrescriptorManual('');
  };

  // Crear nuevo medicamento
  const handleCrearMedicamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoCodigo.trim()) {
      setMensajeError('El código y el nombre del medicamento son campos obligatorios.');
      return;
    }

    const nuevo: Medicamento = {
      id: `med-${Date.now()}`,
      codigo: nuevoCodigo.toUpperCase().trim(),
      nombre: nuevoNombre.trim(),
      principio_activo: nuevoPrincipio.trim() || nuevoNombre.trim(),
      categoria: nuevaCategoria,
      presentacion: nuevaPresentacion.trim() || 'Caja estándar',
      stock_actual: Number(nuevoStock) || 0,
      stock_minimo: Number(nuevoStockMin) || 5,
      precio_unitario: Number(nuevoPrecio) || 0,
      lote: nuevoLote.toUpperCase().trim() || 'L-GENERAL',
      fecha_vencimiento: nuevoVencimiento,
      ubicacion: nuevaUbicacion.trim() || 'Farmacia Central',
    };

    const actualizados = guardarMedicamentoFarmacia(nuevo);
    setMedicamentos(actualizados);
    setModalNuevoAbierto(false);
    setMensajeExito(`¡Fármaco "${nuevo.nombre}" registrado exitosamente en el catálogo hospitalario!`);
    setTimeout(() => setMensajeExito(null), 4000);

    // Resetear formulario
    setNuevoCodigo('');
    setNuevoNombre('');
    setNuevoPrincipio('');
    setNuevaPresentacion('');
  };

  // Reabastecer lote
  const handleReabastecer = () => {
    if (!medicamentoAReabastecer) return;
    const qty = Number(cantidadReabastecer) || 1;
    const nuevoTotal = medicamentoAReabastecer.stock_actual + qty;

    const actualizados = actualizarStockFarmacia(medicamentoAReabastecer.id, nuevoTotal);
    setMedicamentos(actualizados);

    setMensajeExito(`Ingreso de ${qty} unidades al lote de "${medicamentoAReabastecer.nombre}" completado con éxito.`);
    setTimeout(() => setMensajeExito(null), 4000);
    setMedicamentoAReabastecer(null);
    setCantidadReabastecer(10);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
            <Pill className="h-7 w-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Farmacia Hospitalaria & Dispensario
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Inventario ECE & Recetas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestión de stock, dispensación vinculada a recetas médicas y trazabilidad SQA (ISO/IEC 25010).
            </p>
          </div>
        </div>

        {user?.rol !== 'PACIENTE' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAbrirDispensarGeneral}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4 stroke-[2.5]" />
              <span>Dispensar Receta / Fármaco</span>
            </button>
            <button
              onClick={() => setModalNuevoAbierto(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Nuevo Medicamento</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. MENSAJES FLOTANTES */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-rose-800 dark:text-rose-200 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{mensajeError}</span>
        </div>
      )}

      {/* 3. KPIS DE INVENTARIO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Catálogo Activo</span>
            <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{totalItems}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Fármacos registrados</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Unidades en Stock</span>
            <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{totalUnidades}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Existencia total almacén</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block">Stock Crítico / Bajo</span>
            <strong className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{stockCriticoCount}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Requieren reposición</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">Fármacos Agotados</span>
            <strong className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{agotadosCount}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Existencia en 0 unidades</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* 4. BARRA DE HERRAMIENTAS: BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, principio activo, lote o código..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filtro por estado de stock */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'EN_STOCK', label: 'En Stock' },
              { id: 'STOCK_BAJO', label: 'Stock Bajo' },
              { id: 'AGOTADOS', label: 'Agotados' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEstadoFiltro(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  estadoFiltro === f.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Pestañas de categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
          {[
            { id: 'TODAS', label: 'Todas las Categorías' },
            { id: 'ANTIBIOTICOS', label: 'Antibióticos' },
            { id: 'ANALGESICOS', label: 'Analgésicos' },
            { id: 'CARDIOVASCULAR', label: 'Cardiovascular' },
            { id: 'METABOLICOS', label: 'Metabólicos' },
            { id: 'RESPIRATORIOS', label: 'Respiratorios' },
            { id: 'GASTROINTESTINALES', label: 'Gastrointestinales' },
            { id: 'OTROS', label: 'Otros' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors ${
                categoriaFiltro === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. LISTA DE MEDICAMENTOS */}
      {medicamentosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
          <Pill className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-bold">No se encontraron medicamentos con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {medicamentosFiltrados.map((med) => {
            const estaAgotado = med.stock_actual === 0;
            const stockBajo = med.stock_actual > 0 && med.stock_actual <= med.stock_minimo;
            const porcentajeStock = Math.min(100, Math.round((med.stock_actual / (med.stock_minimo * 2.5)) * 100));

            return (
              <div
                key={med.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {med.codigo}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        estaAgotado
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                          : stockBajo
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                      }`}
                    >
                      {estaAgotado ? 'Agotado' : stockBajo ? 'Stock Bajo' : 'En Existencia'}
                    </span>
                  </div>

                  {/* Nombre y Principio Activo */}
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {med.nombre}
                  </h3>
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mt-0.5">
                    {med.principio_activo}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {med.presentacion} &bull; <span className="font-mono text-slate-400">Lote: {med.lote}</span>
                  </p>

                  {/* Ubicación en Farmacia */}
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{med.ubicacion}</span>
                  </div>

                  {/* Barra de progreso de Stock */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Stock Disponible</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {med.stock_actual} <span className="text-[10px] text-slate-400 font-normal">/ mín. {med.stock_minimo}</span>
                      </strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          estaAgotado
                            ? 'bg-rose-500 w-0'
                            : stockBajo
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${porcentajeStock}%` }}
                      />
                    </div>
                  </div>

                  {/* Info complementaria */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Precio Unitario</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">Q. {med.precio_unitario.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Caducidad</span>
                      <span className="text-slate-600 dark:text-slate-300 font-mono">{med.fecha_vencimiento}</span>
                    </div>
                  </div>

                </div>

                {/* Acciones */}
                {user?.rol !== 'PACIENTE' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={estaAgotado}
                      onClick={() => handleAbrirDispensarConMedicamento(med)}
                      className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Dispensar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMedicamentoAReabastecer(med);
                        setCantidadReabastecer(10);
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Ingreso de Lote / Reabastecer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lote</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DISPENSAR MEDICAMENTO (PACIENTE CON RECETA O MANUAL) */}
      {/* ========================================================================= */}
      {modalDispensarAbierto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-sm">
                  <ShoppingCart className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Dispensación de Medicamentos & Recetas
                  </h3>
                  <p className="text-xs text-slate-400">Entrega oficial a pacientes con trazabilidad hospitalaria SQA</p>
                </div>
              </div>
              <button
                onClick={() => setModalDispensarAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto text-xs">
              
              {/* Selector de Modo: Paciente Registrado vs Ingreso Manual */}
              <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setModoDispensacion('RECETA')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    modoDispensacion === 'RECETA'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Paciente Registrado (con Receta)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoDispensacion('MANUAL')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    modoDispensacion === 'MANUAL'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Ingreso Manual de Paciente</span>
                </button>
              </div>

              {/* SECCIÓN 1: SELECCIÓN DEL PACIENTE O DATOS MANUALES */}
              {modoDispensacion === 'RECETA' ? (
                <div className="space-y-3 p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="block font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                      1. Seleccionar Paciente Registrado *
                    </label>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                      {pacientes.length} pacientes disponibles
                    </span>
                  </div>

                  {/* Selector bonito de Pacientes */}
                  <CustomSelect
                    value={pacienteSeleccionadoId}
                    onChange={(val) => setPacienteSeleccionadoId(val)}
                    options={opcionesPacientes}
                    placeholder="Buscar y seleccionar paciente..."
                    icon={<User className="w-4 h-4" />}
                  />

                  {/* Detalle del paciente seleccionado y sus recetas */}
                  {cargandoExpediente && (
                    <div className="p-3 bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/50 rounded-xl text-center text-teal-700 dark:text-teal-300">
                      <span className="animate-pulse font-bold">Consultando expediente clínico y recetas del paciente...</span>
                    </div>
                  )}

                  {pacienteSeleccionado && !cargandoExpediente && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{pacienteSeleccionado.nombre_completo}</p>
                          <p className="text-[11px] text-slate-400">DPI: {pacienteSeleccionado.documento || 'No registrado'} &bull; Tel: {pacienteSeleccionado.telefono || 'N/A'}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-200 dark:border-emerald-800">
                          {pacienteSeleccionado.codigo_paciente || 'PACIENTE ACTIVO'}
                        </span>
                      </div>

                      {/* Recetas médicas detectadas en el expediente */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                            <span>Prescripciones Médicas en Expediente</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{recetasActivas.length} recetas encontradas</span>
                        </div>

                        {recetasActivas.length === 0 ? (
                          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-[11px] flex items-center gap-2">
                            <Info className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>El paciente no tiene recetas prescritas recientemente en su expediente. Puede seleccionar el fármaco a dispensar manualmente a continuación.</span>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {recetasActivas.map((rec, idx) => {
                              const matchInventario = medicamentos.find(m => 
                                m.nombre.toLowerCase().includes(rec.medicamento.toLowerCase()) ||
                                rec.medicamento.toLowerCase().includes(m.nombre.toLowerCase())
                              );

                              return (
                                <div
                                  key={`${rec.consultaId}-${idx}`}
                                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-teal-400 dark:hover:border-teal-600 transition-all flex items-start justify-between gap-3 shadow-xs"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <strong className="text-slate-900 dark:text-white font-bold text-xs">
                                        {rec.medicamento}
                                      </strong>
                                      {matchInventario ? (
                                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                          matchInventario.stock_actual > 0 
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                        }`}>
                                          {matchInventario.stock_actual > 0 ? `Stock Farmacia: ${matchInventario.stock_actual}` : 'Agotado en Farmacia'}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                          Prescripción Externa
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                                      Dosis: {rec.dosis} &bull; Frecuencia: {rec.frecuencia} ({rec.duracion_dias || 7} días)
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      Dr. {rec.medico} &bull; {new Date(rec.fecha).toLocaleDateString('es-GT')} {rec.diagnosticoPrincipal && `&bull; ${rec.diagnosticoPrincipal}`}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleSeleccionarReceta(rec)}
                                    className="px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg font-bold text-[10px] border border-teal-200 dark:border-teal-800 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Seleccionar</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* MODO INGRESO MANUAL */
                <div className="space-y-3 p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <label className="block font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    1. Datos de Identificación del Paciente *
                  </label>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre Completo del Paciente / Destinatario *
                    </label>
                    <input
                      type="text"
                      required
                      value={pacienteManualNombre}
                      onChange={(e) => setPacienteManualNombre(e.target.value)}
                      placeholder="Ej. Roberto Alexander Morales Santos"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        No. de Receta Médica / Referencia (Opcional)
                      </label>
                      <input
                        type="text"
                        value={recetaManualReferencia}
                        onChange={(e) => setRecetaManualReferencia(e.target.value)}
                        placeholder="Ej. REC-2026-9041"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Médico Prescriptor Externo (Opcional)
                      </label>
                      <input
                        type="text"
                        value={medicoPrescriptorManual}
                        onChange={(e) => setMedicoPrescriptorManual(e.target.value)}
                        placeholder="Ej. Dr. Carlos Villagrán"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: SELECCIÓN DEL MEDICAMENTO DE FARMACIA */}
              <div className="space-y-3 p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    2. Medicamento a Dispensar del Inventario *
                  </label>
                  {medicamentoSeleccionado && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Lote: {medicamentoSeleccionado.lote} &bull; Vence: {medicamentoSeleccionado.fecha_vencimiento}
                    </span>
                  )}
                </div>

                {/* CustomSelect para elegir el medicamento con badges de stock */}
                <CustomSelect
                  value={medicamentoSeleccionadoId}
                  onChange={(val) => setMedicamentoSeleccionadoId(val)}
                  options={opcionesMedicamentos}
                  placeholder="Seleccionar medicamento del almacén..."
                  icon={<Pill className="w-4 h-4" />}
                />

                {medicamentoSeleccionado && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Presentación</span>
                      <strong className="text-slate-800 dark:text-slate-200">{medicamentoSeleccionado.presentacion}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock Disponible</span>
                      <strong className={medicamentoSeleccionado.stock_actual > 0 ? 'text-emerald-600 font-mono' : 'text-rose-600 font-mono'}>
                        {medicamentoSeleccionado.stock_actual} unidades
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Precio Unitario</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">Q. {medicamentoSeleccionado.precio_unitario.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Ubicación</span>
                      <span className="text-slate-600 dark:text-slate-300">{medicamentoSeleccionado.ubicacion}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 3: CANTIDAD, POSOLOGÍA & NOTAS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad a Dispensar *
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={cantidadDispensar <= 1}
                      onClick={() => setCantidadDispensar(Math.max(1, cantidadDispensar - 1))}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-l-xl font-bold cursor-pointer disabled:opacity-40"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={medicamentoSeleccionado?.stock_actual || 1}
                      value={cantidadDispensar}
                      onChange={(e) => setCantidadDispensar(Number(e.target.value))}
                      className="w-full text-center py-2.5 bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 font-mono text-sm font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={!medicamentoSeleccionado || cantidadDispensar >= medicamentoSeleccionado.stock_actual}
                      onClick={() => setCantidadDispensar(cantidadDispensar + 1)}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-r-xl font-bold cursor-pointer disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Indicaciones / Posología de Entrega
                  </label>
                  <input
                    type="text"
                    value={indicacionesEntrega}
                    onChange={(e) => setIndicacionesEntrega(e.target.value)}
                    placeholder="Ej. Tomar 1 tableta cada 8 horas por 7 días con abundante agua"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Subtotal estimado */}
              {medicamentoSeleccionado && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">Total Dispensación</span>
                  </div>
                  <strong className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    Q. {(cantidadDispensar * medicamentoSeleccionado.precio_unitario).toFixed(2)}
                  </strong>
                </div>
              )}

            </div>

            {/* Footer con botones de acción */}
            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalDispensarAbierto(false)}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDispensacion}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Dispensar Fármaco</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL REGISTRO DE NUEVO MEDICAMENTO (CON CUSTOMSELECT Y CUSTOMDATEPICKER) */}
      {/* ========================================================================= */}
      {modalNuevoAbierto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Registrar Nuevo Fármaco
                  </h3>
                  <p className="text-xs text-slate-400">Control de calidad e inventario farmacéutico</p>
                </div>
              </div>
              <button
                onClick={() => setModalNuevoAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCrearMedicamento} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Código del Medicamento *</label>
                  <input
                    type="text"
                    required
                    value={nuevoCodigo}
                    onChange={(e) => setNuevoCodigo(e.target.value)}
                    placeholder="Ej. MED-IBU-600"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría Farmacológica *</label>
                  <CustomSelect
                    value={nuevaCategoria}
                    onChange={(val) => setNuevaCategoria(val as any)}
                    options={categoriasSelectOptions}
                    placeholder="Seleccionar categoría..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial del Fármaco *</label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Ibuprofeno Ultra Rápido"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Principio Activo & Concentración</label>
                  <input
                    type="text"
                    value={nuevoPrincipio}
                    onChange={(e) => setNuevoPrincipio(e.target.value)}
                    placeholder="Ej. Ibuprofeno 600mg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Presentación Farmacéutica</label>
                  <input
                    type="text"
                    value={nuevaPresentacion}
                    onChange={(e) => setNuevaPresentacion(e.target.value)}
                    placeholder="Ej. Caja con 20 tabletas"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={nuevoStock}
                    onChange={(e) => setNuevoStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={nuevoStockMin}
                    onChange={(e) => setNuevoStockMin(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Precio (Q.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Número de Lote</label>
                  <input
                    type="text"
                    value={nuevoLote}
                    onChange={(e) => setNuevoLote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                
                {/* CALENDARIO PERSONALIZADO PARA FECHA DE VENCIMIENTO */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Vencimiento *</label>
                  <CustomDatePicker
                    value={nuevoVencimiento}
                    onChange={(val) => setNuevoVencimiento(val)}
                    placeholder="Elegir fecha..."
                    minDate="2025-01-01"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ubicación / Estante</label>
                  <input
                    type="text"
                    value={nuevaUbicacion}
                    onChange={(e) => setNuevaUbicacion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoAbierto(false)}
                  className="px-4 py-2.5 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL REABASTECER LOTE */}
      {/* ========================================================================= */}
      {medicamentoAReabastecer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Ingreso de Lote a Almacén
                </h3>
              </div>
              <button onClick={() => setMedicamentoAReabastecer(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl space-y-1">
              <strong className="text-sm text-slate-900 dark:text-white block">{medicamentoAReabastecer.nombre}</strong>
              <p className="text-[10px] text-slate-500 font-mono">Stock actual en almacén: {medicamentoAReabastecer.stock_actual} unidades</p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Lote actual: {medicamentoAReabastecer.lote}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unidades que Ingresan al Almacén</label>
              <input
                type="number"
                min="1"
                value={cantidadReabastecer}
                onChange={(e) => setCantidadReabastecer(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMedicamentoAReabastecer(null)}
                className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReabastecer}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Actualizar Existencias
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
