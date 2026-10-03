import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange, 
  minDate, 
  maxDate,
  placeholder = 'Seleccionar fecha',
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Inicializar el mes y año visualizados
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    // Si hay maxDate menor a hoy (ej. fecha nacimiento), arrancar en un año sugerido
    if (maxDate && maxDate < new Date().toISOString().split('T')[0]) {
      return new Date(2000, 0, 1);
    }
    return new Date();
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Actualizar cuando cambie el valor externo
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
      }
    }
  }, [value]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const isDateDisabled = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return placeholder;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  // Generar lista de años para selección rápida (desde 1920 hasta año actual + 5)
  const currentYearMax = maxDate ? parseInt(maxDate.split('-')[0]) : new Date().getFullYear() + 5;
  const currentYearMin = minDate ? parseInt(minDate.split('-')[0]) : 1920;
  
  const yearsList: number[] = [];
  for (let y = currentYearMax; y >= currentYearMin; y--) {
    yearsList.push(y);
  }

  return (
    <div className="relative w-full" ref={popoverRef}>
      
      {/* Botón Disparador del Calendario */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className || `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border outline-none cursor-pointer ${
          value 
            ? 'text-slate-900 dark:text-white font-bold' 
            : 'text-slate-400 dark:text-slate-500'
        } ${
          isOpen
            ? 'border-teal-500 ring-2 ring-teal-500/20 bg-white dark:bg-slate-900 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalIcon className={`h-4 w-4 shrink-0 transition-colors ${isOpen || value ? 'text-teal-500' : 'text-slate-400'}`} />
          <span className="truncate">{formatDateDisplay(value)}</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          {isOpen ? 'Cerrar' : 'Elegir'}
        </span>
      </button>

      {/* Popover del Calendario Personalizado */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 w-full sm:min-w-[340px] max-w-[420px] bg-white dark:bg-slate-900 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[130] animate-in fade-in zoom-in-95 duration-150 select-none">
          
          {/* Cabecera Interactiva: Navegación de Mes y Año */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-1">
            <button 
              type="button" 
              onClick={prevMonth} 
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Selectores Rápidos de Mes y Año */}
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'months' 
                    ? 'bg-teal-500 text-white shadow-sm' 
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {MESES[month]}
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'years' 
                    ? 'bg-teal-500 text-white shadow-sm' 
                    : 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                }`}
              >
                {year}
              </button>
            </div>

            <button 
              type="button" 
              onClick={nextMonth} 
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* VISTA 1: Selector de Meses */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-3 gap-2 py-3 animate-in fade-in duration-150">
              {MESES.map((nombreMes, idx) => (
                <button
                  key={nombreMes}
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date(year, idx, 1));
                    setViewMode('days');
                  }}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    idx === month
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {nombreMes}
                </button>
              ))}
            </div>
          )}

          {/* VISTA 2: Selector de Años Rápido (Scrollable) */}
          {viewMode === 'years' && (
            <div className="py-2 animate-in fade-in duration-150">
              <p className="text-[11px] font-bold text-slate-400 mb-2 px-1 uppercase tracking-wider">
                Selecciona tu año de nacimiento:
              </p>
              <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {yearsList.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setCurrentDate(new Date(y, month, 1));
                      setViewMode('days');
                    }}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      y === year
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VISTA 3: Grilla de Días del Mes */}
          {viewMode === 'days' && (
            <div className="pt-3 animate-in fade-in duration-150">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d) => (
                  <div key={d} className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Celdas de días */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${i}`} className="w-full h-9" />;
                  }

                  const m = (month + 1).toString().padStart(2, '0');
                  const d = day.toString().padStart(2, '0');
                  const dateStr = `${year}-${m}-${d}`;
                  const isSelected = value === dateStr;
                  const disabled = isDateDisabled(day);
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDate(day)}
                      className={`w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        disabled
                          ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-30'
                          : isSelected
                          ? 'bg-gradient-to-tr from-teal-500 to-sky-600 text-white shadow-md shadow-teal-500/30 scale-105 z-10'
                          : isToday
                          ? 'border border-teal-500/80 text-teal-600 dark:text-teal-400 font-extrabold hover:bg-teal-50 dark:hover:bg-teal-950/40'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra Inferior de Acceso Rápido */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                const hoy = new Date();
                const hoyStr = hoy.toISOString().split('T')[0];
                if (!maxDate || hoyStr <= maxDate) {
                  onChange(hoyStr);
                  setIsOpen(false);
                  setViewMode('days');
                }
              }}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
            >
              Hoy
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setViewMode('days');
                }}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
