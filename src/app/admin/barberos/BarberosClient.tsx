'use client';

import { useState, useTransition } from 'react';
import { createBarber, updateBarber, deleteBarber, getBarbersAdmin } from '@/app/actions/admin-actions';
import { Plus, Pencil, Trash2, X, Loader2, Calendar as CalendarIcon, MapPin, Scissors } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface ServiceItem {
  _id: string;
  name: string;
  precioCentro: number;
  precioCambyreta: number;
  description: string;
  durationMinutes: number;
}

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
  servicePrices?: {
    serviceId: string;
    precioCentro?: number;
    precioCambyreta?: number;
    price?: number;
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
  branches = [],
  services = []
}: {
  initialBarbers: BarberItem[];
  branches: Branch[];
  services?: ServiceItem[];
}) {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberItem | null>(null);
  
  // Asignaciones de días a sucursales
  const [dayAssignments, setDayAssignments] = useState<Record<number, string>>({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: ''
  });

  // Precios personalizados por servicio para este barbero
  const [servicePricesState, setServicePricesState] = useState<
    Record<string, { precioCentro: string; precioCambyreta: string }>
  >({});

  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  const [isPending, startTransition] = useTransition();

  const closeModal = () => {
    setShowModal(false);
    setEditingBarber(null);
    setImageUrl('');
    setImageError('');
  };

  const refreshBarbers = async () => {
    const updated = await getBarbersAdmin();
    setBarbers(updated);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!imageUrl.trim()) {
      setImageError('Debes subir o seleccionar una foto para el barbero.');
      return;
    }
    formData.set('imageUrl', imageUrl);
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

    // Generar servicePrices omitiendo servicios sin personalización
    const servicePrices = Object.entries(servicePricesState)
      .map(([serviceId, prices]) => {
        const pCentro = prices.precioCentro !== '' ? Number(prices.precioCentro) : undefined;
        const pCamby = prices.precioCambyreta !== '' ? Number(prices.precioCambyreta) : undefined;
        if (pCentro !== undefined || pCamby !== undefined) {
          return {
            serviceId,
            ...(pCentro !== undefined ? { precioCentro: pCentro } : {}),
            ...(pCamby !== undefined ? { precioCambyreta: pCamby } : {})
          };
        }
        return null;
      })
      .filter(Boolean);

    formData.append('branchAssignments', JSON.stringify(assignments));
    formData.append('unavailableDays', JSON.stringify(unDays));
    formData.append('servicePrices', JSON.stringify(servicePrices));

    startTransition(async () => {
      if (editingBarber) {
        await updateBarber(editingBarber._id, formData);
      } else {
        await createBarber(formData);
      }
      await refreshBarbers();
      closeModal();
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
    setImageUrl('');
    setImageError('');
    setDayAssignments({
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: ''
    });
    const initialPrices: Record<string, { precioCentro: string; precioCambyreta: string }> = {};
    services.forEach(s => {
      initialPrices[s._id] = { precioCentro: '', precioCambyreta: '' };
    });
    setServicePricesState(initialPrices);
    setShowModal(true);
  };

  const openEdit = (barber: BarberItem) => {
    setEditingBarber(barber);
    setImageUrl(barber.imageUrl || '');
    setImageError('');
    
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

    // Inicializar precios por servicio
    const initialPrices: Record<string, { precioCentro: string; precioCambyreta: string }> = {};
    services.forEach(s => {
      const found = barber.servicePrices?.find(sp => sp.serviceId === s._id);
      initialPrices[s._id] = {
        precioCentro: found?.precioCentro !== undefined && found?.precioCentro !== null ? String(found.precioCentro) : '',
        precioCambyreta: found?.precioCambyreta !== undefined && found?.precioCambyreta !== null ? String(found.precioCambyreta) : ''
      };
    });
    setServicePricesState(initialPrices);

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

                  {barber.servicePrices && barber.servicePrices.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60">
                      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Scissors className="w-3.5 h-3.5 text-amber-500" /> Tarifas Diferenciadas
                      </p>
                      <div className="space-y-1">
                        {barber.servicePrices.map((sp) => {
                          const srv = services.find(s => s._id === sp.serviceId);
                          return (
                            <div key={sp.serviceId} className="text-xs text-zinc-400 flex justify-between items-center">
                              <span className="truncate max-w-[140px] text-zinc-300">{srv?.name || 'Servicio'}:</span>
                              <span className="text-amber-400 font-medium shrink-0">
                                {sp.precioCentro ? `C: Gs. ${sp.precioCentro.toLocaleString('es-AR')}` : ''}
                                {sp.precioCentro && sp.precioCambyreta ? ' | ' : ''}
                                {sp.precioCambyreta ? `Cb: Gs. ${sp.precioCambyreta.toLocaleString('es-AR')}` : ''}
                                {!sp.precioCentro && !sp.precioCambyreta && sp.price ? `Gs. ${sp.price.toLocaleString('es-AR')}` : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
              </h2>
              <button
                onClick={closeModal}
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
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Foto del Barbero <span className="text-amber-500">*</span>
                </label>
                <ImageUpload
                  value={imageUrl}
                  onChange={(val) => {
                    setImageUrl(val);
                    if (val) setImageError('');
                  }}
                  name="imageUrl"
                  required
                />
                {imageError && (
                  <p className="text-xs text-red-400 mt-1">{imageError}</p>
                )}
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

              {/* Precios diferenciados por servicio */}
              {services.length > 0 && (
                <div className="border-t border-zinc-800/80 pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="w-4 h-4 text-amber-500" />
                    <label className="text-sm font-medium text-zinc-300">Precios por Servicio (Diferenciados por Barbero)</label>
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-3">
                    Personaliza el precio para este barbero. Si dejas el campo vacío, se usará el precio base del servicio.
                  </p>
                  <div className="space-y-3">
                    {services.map((service) => {
                      const currentPrices = servicePricesState[service._id] || { precioCentro: '', precioCambyreta: '' };
                      return (
                        <div key={service._id} className="bg-[#141414] border border-zinc-800/50 p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-white truncate">{service.name}</span>
                            <span className="text-[10px] text-zinc-500">
                              Base: {service.precioCentro.toLocaleString('es-AR')} / {service.precioCambyreta.toLocaleString('es-AR')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Centro (Gs.)</label>
                              <input
                                type="number"
                                placeholder={service.precioCentro.toString()}
                                value={currentPrices.precioCentro}
                                onChange={(e) => setServicePricesState({
                                  ...servicePricesState,
                                  [service._id]: {
                                    ...currentPrices,
                                    precioCentro: e.target.value
                                  }
                                })}
                                className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Cambyreta (Gs.)</label>
                              <input
                                type="number"
                                placeholder={service.precioCambyreta.toString()}
                                value={currentPrices.precioCambyreta}
                                onChange={(e) => setServicePricesState({
                                  ...servicePricesState,
                                  [service._id]: {
                                    ...currentPrices,
                                    precioCambyreta: e.target.value
                                  }
                                })}
                                className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
