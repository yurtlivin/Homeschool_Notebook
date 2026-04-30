import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function CompletionDatePicker({ initialDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(new Date(initialDate + "T00:00:00"));

  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start);

  const handleSelectDate = (day) => {
    const selected = format(day, "yyyy-MM-dd");
    onSelect(selected);
  };

  return (
    <div className="absolute top-full mt-2 right-0 bg-white border border-border rounded-lg shadow-lg p-3 z-40">
      <div className="flex items-center justify-between mb-3 w-48">
        <button
          onClick={() => setViewDate(d => subMonths(d, 1))}
          className="p-1 hover:bg-muted rounded"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-medium">{format(viewDate, "MMM yyyy")}</span>
        <button
          onClick={() => setViewDate(d => addMonths(d, 1))}
          className="p-1 hover:bg-muted rounded"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground w-5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="w-5 h-5" />
        ))}
        {days.map(day => {
          const dayFormatted = format(day, "yyyy-MM-dd");
          const isSelected = dayFormatted === initialDate;
          return (
            <button
              key={dayFormatted}
              onClick={() => handleSelectDate(day)}
              className={`w-5 h-5 text-[10px] rounded transition-colors ${
                isSelected
                  ? "bg-[#534AB7] text-white font-medium"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}