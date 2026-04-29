import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isSameMonth } from "date-fns";

export default function MiniCalendar({ loggedDates, selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date());

  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start); // 0=Sun

  const prev = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const isLogged = (day) => loggedDates.some(d => isSameDay(new Date(d), day));
  const isSelected = (day) => selectedDate && isSameDay(new Date(selectedDate), day);

  return (
    <div className="bg-white border border-border rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1 hover:bg-muted rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
        <span className="text-xs font-semibold text-foreground">{format(viewDate, "MMMM yyyy")}</span>
        <button onClick={next} className="p-1 hover:bg-muted rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-7 text-center mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center gap-y-0.5">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(format(day, "yyyy-MM-dd"))}
            className={`relative mx-auto w-7 h-7 flex flex-col items-center justify-center rounded text-xs transition-colors ${
              isSelected(day)
                ? "bg-[#534AB7] text-white"
                : isToday(day)
                ? "border border-[#534AB7] text-[#534AB7] font-medium"
                : isSameMonth(day, viewDate)
                ? "text-foreground hover:bg-muted"
                : "text-muted-foreground"
            }`}
          >
            {format(day, "d")}
            {isLogged(day) && !isSelected(day) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}