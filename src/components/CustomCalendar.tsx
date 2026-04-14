'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isBefore, startOfDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function CustomCalendar({ selectedDate, onDateChange }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  });

  return (
    <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
      {/* Header del Calendario */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-medium capitalize text-lg">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </span>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-zinc-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {days.map((day, idx) => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const isSelected = selectedDate === formattedDate;
          const isPast = isBefore(day, startOfDay(new Date()));
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={idx}
              disabled={isPast || !isCurrentMonth}
              onClick={() => onDateChange(formattedDate)}
              className={`
                relative h-10 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300
                ${!isCurrentMonth ? 'text-zinc-700/30 cursor-not-allowed' : ''}
                ${isPast && isCurrentMonth ? 'text-zinc-600 line-through cursor-not-allowed' : ''}
                ${!isPast && isCurrentMonth && !isSelected ? 'text-zinc-300 hover:bg-zinc-800 hover:text-amber-400' : ''}
                ${isSelected ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(217,176,108,0.4)] transform scale-105' : ''}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
