'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, Loader2, Link as LinkIcon, Check } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  name = 'imageUrl',
  required = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimizar y redimensionar imagen en el cliente para mantener el payload liviano
  const processAndSetFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      setErrorMessage('Ocurrió un error al procesar la imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(img.src);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // Calidad 0.85 en JPEG genera un archivo de ~50KB a 90KB con excelente nitidez
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processAndSetFile(e.target.files[0]);
    }
    // Limpiar para permitir seleccionar el mismo archivo si se desea
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {value ? (
        // Estado con imagen seleccionada (Vista previa)
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group overflow-hidden rounded-2xl border-2 transition-all p-3 bg-[#141414] ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 mb-1">
                <Check className="w-3.5 h-3.5" />
                <span>Imagen cargada con éxito</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-1 mb-3">
                {value.startsWith('data:') ? 'Imagen cargada desde tu dispositivo' : value}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cambiar foto
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          {isDragging && (
            <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
              <p className="text-amber-300 font-semibold text-sm">Suelta para reemplazar la imagen</p>
            </div>
          )}
        </div>
      ) : (
        // Estado sin imagen (Dropzone)
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
              : 'border-zinc-800 hover:border-zinc-700 bg-[#141414]/50 hover:bg-[#141414]'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-9 h-9 text-amber-500 animate-spin mb-2" />
              <p className="text-sm text-zinc-300 font-medium">Procesando y optimizando imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center text-amber-500 mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-200 mb-1">
                Arrastra y suelta tu imagen aquí
              </p>
              <p className="text-xs text-zinc-400 mb-3">
                o haz clic para <span className="text-amber-500 underline font-medium">buscar en tu dispositivo</span>
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>PNG, JPG, WebP (optimización automática)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
      )}

      {/* Opción alternativa: ingresar URL manualmente */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[11px] text-zinc-500 hover:text-amber-500/90 transition-colors inline-flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlFallback ? 'Ocultar opción de URL' : '¿Prefieres ingresar una URL o ruta existente?'}
        </button>

        {showUrlFallback && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="https://... o /peluquero.jpg"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-[#0d0d0d] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
