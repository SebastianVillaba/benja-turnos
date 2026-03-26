'use client';

import { useState, useTransition } from 'react';
import { createService, updateService, deleteService, getServicesAdmin } from '@/app/actions/admin-actions';
import { Plus, Pencil, Trash2, X, Loader2, Scissors } from 'lucide-react';

interface ServiceItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  durationMinutes: number;
}

export default function ServiciosClient({ initialServices }: { initialServices: ServiceItem[] }) {
  const [services, setServices] = useState(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshServices = async () => {
    const updated = await getServicesAdmin();
    setServices(updated);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      if (editingService) {
        await updateService(editingService._id, formData);
      } else {
        await createService(formData);
      }
      await refreshServices();
      setShowModal(false);
      setEditingService(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    startTransition(async () => {
      await deleteService(id);
      await refreshServices();
    });
  };

  const openCreate = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const openEdit = (service: ServiceItem) => {
    setEditingService(service);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Servicios</h1>
          <p className="text-zinc-400 mt-1">Gestiona los servicios de la barbería</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all duration-300 text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/80">
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Nombre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Precio</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Duración</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-zinc-500">
                    No hay servicios registrados.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service._id} className="border-b border-zinc-800/40 hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
                          <Scissors className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 max-w-[250px] truncate">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-amber-500 font-medium">
                      ${service.price.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {service.durationMinutes} min
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-amber-500 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-red-950/50 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingService(null); }}
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
                  defaultValue={editingService?.name || ''}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Precio</label>
                <input
                  name="price"
                  type="number"
                  required
                  defaultValue={editingService?.price || ''}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Duración (minutos)</label>
                <input
                  name="durationMinutes"
                  type="number"
                  defaultValue={editingService?.durationMinutes || 30}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingService?.description || ''}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-zinc-950 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
