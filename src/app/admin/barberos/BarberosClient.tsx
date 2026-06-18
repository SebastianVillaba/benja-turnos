'use client';

import { useState, useTransition } from 'react';
import { createBarber, updateBarber, deleteBarber, getBarbersAdmin } from '@/app/actions/admin-actions';
import { Plus, Pencil, Trash2, X, Loader2, Calendar as CalendarIcon, MapPin } from 'lucide-react';

interface BarberItem {
  _id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
  unavailableDays?: number[];
  branchAssignments?: {
    branchId: string;
    workDays: number[];
  }[];
}

interface Branch {
  _id: string;
  name: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
];

export default function BarberosClient({
  initialBarbers,
  branches = []
}: {
  initialBarbers: BarberItem[];
  branches: Branch[];
}) {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberItem | null>(null);
  
  // Asignaciones de días a sucursales
  const [dayAssignments, setDayAssignments] = useState<Record<number, string>>({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: ''
  });

  const [isPending, startTransition] = useTransition();

  const refreshBarbers = async () => {
    const updated = await getBarbersAdmin();
    setBarbers(updated);
  };

  const handleSubmit = async (formData: FormData) => {
    // Generar branchAssignments y unavailableDays en base a dayAssignments
    const assignments = branches.map(branch => {
      const workDays = Object.entries(dayAssignments)
        .filter(([_, branchId]) => branchId === branch._id)
        .map(([day]) => parseInt(day));
      return {
        branchId: branch._id,
        workDays
      };
    }).filter(a => a.workDays.length > 0);

    const unDays = Object.entries(dayAssignments)
      .filter(([_, branchId]) => branchId === '')
      .map(([day]) => parseInt(day));

    formData.append('branchAssignments', JSON.stringify(assignments));
    formData.append('unavailableDays', JSON.stringify(unDays));

    startTransition(async () => {
      if (editingBarber) {
        await updateBarber(editingBarber._id, formData);
      } else {
        await createBarber(formData);
      }
      await refreshBarbers();
      setShowModal(false);
      setEditingBarber(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este barbero?')) return;
    startTransition(async () => {
      await deleteBarber(id);
      await refreshBarbers();
    });
  };

  const openCreate = () => {
    setEditingBarber(null);
    setDayAssignments({
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: ''
    });
    setShowModal(true);
  };

  const openEdit = (barber: BarberItem) => {
    setEditingBarber(barber);
    
    // Inicializar asignaciones
    const initialAssignments: Record<number, string> = {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: ''
    };
    
    if (barber.branchAssignments) {
      barber.branchAssignments.forEach(assignment => {
        assignment.workDays.forEach(day => {
          initialAssignments[day] = assignment.branchId;
        });
      });
    }
    setDayAssignments(initialAssignments);
    setShowModal(true);
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.name : 'Desconocida';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Barberos</h1>
          <p className="text-zinc-400 mt-1">Gestiona el equipo de la barbería</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all duration-300 text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Barbero
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.length === 0 ? (
          <p className="text-zinc-500 col-span-full text-center py-12">No hay barberos registrados.</p>
        ) : (
          barbers.map((barber) => (
            <div
              key={barber._id}
              className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl overflow-hidden group transition-all duration-300 hover:border-zinc-700/80 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square w-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={barber.imageUrl}
                    alt={barber.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                    barber.isActive
                      ? 'bg-green-950/80 text-green-400 border border-green-800/50'
                      : 'bg-red-950/80 text-red-400 border border-red-800/50'
                  }`}>
                    {barber.isActive ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                
                {/* Visual scheduler info on card */}
                <div className="p-4 border-b border-zinc-800/50">
                  <h3 className="text-lg font-bold text-white mb-2">{barber.name}</h3>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-500" /> Horario de Atención
                    </p>
                    {barber.branchAssignments && barber.branchAssignments.length > 0 ? (
                      barber.branchAssignments.map((assignment) => (
                        <div key={assignment.branchId} className="text-xs text-zinc-400 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-amber-500/80 font-medium">{getBranchName(assignment.branchId)}:</strong>{' '}
                            {assignment.workDays
                              .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
                              .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label)
                              .join(', ')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">Sin asignaciones de sucursal configuradas.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex items-center justify-end gap-2 bg-[#0c0c0c]">
                <button
                  onClick={() => openEdit(barber)}
                  className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(barber._id)}
                  className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-red-950/50 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingBarber(null); }}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre</label>
                <input
                  name="name"
                  required
                  defaultValue={editingBarber?.name || ''}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">URL de Imagen</label>
                <input
                  name="imageUrl"
                  required
                  defaultValue={editingBarber?.imageUrl || ''}
                  placeholder="https://... o /imagen.jpg"
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Estado</label>
                <select
                  name="isActive"
                  defaultValue={editingBarber?.isActive !== false ? 'true' : 'false'}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                >
                  <option value="true">Activo (General)</option>
                  <option value="false">Inactivo (Completamente)</option>
                </select>
              </div>

              {/* Asignación de Sucursales por Día */}
              <div className="border-t border-zinc-800/80 pt-4 mt-4">
                <label className="block text-sm font-medium text-zinc-300 mb-1">Asignación de Sucursales por Día</label>
                <p className="text-[11px] text-zinc-500 mb-4">Define en qué sucursal trabaja cada día o si es su día libre.</p>
                <div className="space-y-2.5">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center justify-between bg-[#141414] border border-zinc-800/50 px-4 py-2.5 rounded-xl gap-2">
                      <span className="text-sm font-medium text-zinc-300 shrink-0">{day.label}</span>
                      <select
                        value={dayAssignments[day.value] || ''}
                        onChange={(e) => setDayAssignments({
                          ...dayAssignments,
                          [day.value]: e.target.value
                        })}
                        className="bg-[#0d0d0d] border border-zinc-800/80 rounded-lg px-3 py-1.5 text-zinc-200 text-sm focus:border-amber-600/50 focus:outline-none transition-colors max-w-[200px]"
                      >
                        <option value="">No trabaja (Libre)</option>
                        {branches.map((b) => (
                          <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-zinc-950 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-6"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingBarber ? 'Guardar Cambios' : 'Crear Barbero'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
