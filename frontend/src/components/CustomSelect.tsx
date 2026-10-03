import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  error?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  icon,
  className,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setBusqueda('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Enfocar input de búsqueda al abrir si hay muchas opciones
  useEffect(() => {
    if (isOpen && options.length > 4 && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, options.length]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setBusqueda('');
  };

  // Filtrado reactivo de opciones
  const opcionesFiltradas = options.filter((opt) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase().trim();
    const matchLabel = opt.label.toLowerCase().includes(q);
    const matchDesc = opt.description ? opt.description.toLowerCase().includes(q) : false;
    const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
    return matchLabel || matchDesc || matchBadge;
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      
      {/* Botón Principal del Selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className || `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all border outline-none cursor-pointer ${
          selectedOption 
            ? 'text-slate-900 dark:text-white font-medium' 
            : 'text-slate-400 dark:text-slate-500'
        } ${
          error
            ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/10'
            : isOpen
            ? 'border-teal-500 ring-2 ring-teal-500/20 bg-white dark:bg-slate-900 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && (
            <span className={`shrink-0 transition-colors ${isOpen || selectedOption ? 'text-teal-500' : 'text-slate-400'}`}>
              {icon}
            </span>
          )}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate font-semibold">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown 
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-500' : ''
          }`} 
        />
      </button>

      {/* Menú Desplegable con Búsqueda Integrada */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[240px] max-h-72 flex flex-col p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[130] animate-in fade-in zoom-in-95 duration-150 select-none">
          
          {/* Buscador dentro del Select cuando hay más de 3 opciones */}
          {options.length > 3 && (
            <div className="p-1 pb-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-teal-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBusqueda('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lista scrolleable de opciones */}
          <div className="space-y-1 overflow-y-auto max-h-56 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 pr-0.5">
            {opcionesFiltradas.length === 0 ? (
              <div className="py-4 px-2 text-center text-xs text-slate-400">
                <span>No se encontraron resultados para &ldquo;{busqueda}&rdquo;</span>
              </div>
            ) : (
              opcionesFiltradas.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {option.icon && (
                        <span className={`shrink-0 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                          {option.icon}
                        </span>
                      )}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{option.label}</span>
                          {option.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 stroke-[2.5] ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
