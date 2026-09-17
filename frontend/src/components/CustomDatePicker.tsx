import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, minDate, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSelectDate = (day: number) => {
    const m = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${currentMonth.getFullYear()}-${m}-${d}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const m = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const dateStr = `${currentMonth.getFullYear()}-${m}-${d}`;
    return dateStr < minDate;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Seleccionar fecha';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className || "w-full flex items-center justify-between px-5 py-3.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-slate-200/80 dark:border-slate-700/80 rounded-[1.25rem] text-sm font-bold text-slate-800 dark:text-slate-100 hover:border-sky-400 dark:hover:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all shadow-sm"}
      >
        <span className="truncate">{formatDateDisplay(value)}</span>
        <CalIcon className={`h-4 w-4 shrink-0 transition-colors ${isOpen ? 'text-sky-500' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 w-[280px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 rounded-[1.5rem] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-bold text-sm text-slate-800 dark:text-white capitalize">
              {currentMonth.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-9 w-9" />;
              
              const m = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
              const d = day.toString().padStart(2, '0');
              const dateStr = `${currentMonth.getFullYear()}-${m}-${d}`;
              const isSelected = value === dateStr;
              const disabled = isDateDisabled(day);
              
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDate(day)}
                  className={`h-9 w-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                    disabled 
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50' 
                      : isSelected 
                      ? 'bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-500/30 scale-110 z-10' 
                      : 'text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
