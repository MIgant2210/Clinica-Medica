import re

with open("c:/Users/miguel.donis/Documents/MIguel/Universidad/Tareas 2026/Aseguramiento de la Calidad/Clinica Medica/frontend/src/pages/CitasPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the table rendering with a beautiful grid of cards
table_pattern = re.compile(r'<div className="overflow-x-auto">\s*<table.*?</table>\s*</div>', re.DOTALL)

grid_cards = """<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-2">
            {citasFiltradas.map((c) => {
              const style = estadoBadgeClass[c.estado] || estadoBadgeClass.PROGRAMADA;
              return (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between gap-4">
                  
                  {/* Header de la Tarjeta */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                        {c.paciente_nombre}
                      </div>
                      <div className="text-xs font-bold text-sky-600 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3"/> {c.profesional_nombre}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border ${style.bg} ${style.text} ${style.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {c.estado}
                    </span>
                  </div>

                  {/* Cuerpo */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm text-sky-500">
                        <CalIcon className="w-4 h-4"/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {new Date(c.fecha_inicio).toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {new Date(c.fecha_inicio).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })} • {c.duracion_minutos} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm text-teal-500">
                        <Activity className="w-4 h-4"/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                          {c.servicio_nombre}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">
                          {c.sede_nombre}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2 pt-2">
                    {c.motivo?.includes('[Telemedicina]') && c.estado !== 'CANCELADA' && c.estado !== 'ATENDIDA' && (
                      <button onClick={() => setSimiCallActive(c.id)} className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                        Iniciar Video
                      </button>
                    )}
                    
                    {user?.rol !== 'PACIENTE' && c.estado !== 'CANCELADA' && (
                      <>
                        {c.estado === 'PROGRAMADA' && (
                          <button onClick={() => handleCambiarEstado(c.id, 'CONFIRMADA')} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                            Confirmar
                          </button>
                        )}
                        {c.estado !== 'ATENDIDA' && (
                          <button onClick={() => navigate(`/expediente?pacienteId=${c.paciente_id}`)} className="flex-1 py-2 bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 hover:bg-teal-400 transition-all transform hover:-translate-y-0.5">
                            Dar Atención
                          </button>
                        )}
                        <button onClick={() => handleCambiarEstado(c.id, 'CANCELADA')} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors" title="Cancelar cita">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>"""

new_content = table_pattern.sub(grid_cards, content)

with open("c:/Users/miguel.donis/Documents/MIguel/Universidad/Tareas 2026/Aseguramiento de la Calidad/Clinica Medica/frontend/src/pages/CitasPage.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("CitasPage grid updated!")
