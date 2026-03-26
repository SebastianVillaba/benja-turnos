'use client';

import { useState, useTransition } from 'react';
import { createBarber, updateBarber, deleteBarber, getBarbersAdmin } from '@/app/actions/admin-actions';
import { Plus, Pencil, Trash2, X, Loader2, User } from 'lucide-react';

interface BarberItem {
  _id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export default function BarberosClient({ initialBarbers }: { initialBarbers: BarberItem[] }) {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [showModal, setShowModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<BarberItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshBarbers = async () => {
    const updated = await getBarbersAdmin();
    setBarbers(updated);
  };

  const handleSubmit = async (formData: FormData) => {
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
    setShowModal(true);
  };

  const openEdit = (barber: BarberItem) => {
    setEditingBarber(barber);
    setShowModal(true);
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
              className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl overflow-hidden group transition-all duration-300 hover:border-zinc-700/80"
            >
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
              <div className="p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                <div className="flex items-center gap-2">
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
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-6 w-full max-w-md shadow-2xl">
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
                  defaultValue={editingBarber?.isActive ? 'true' : 'false'}
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-zinc-950 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
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
