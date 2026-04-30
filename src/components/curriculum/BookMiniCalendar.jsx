import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/constants";

export default function BookMiniCalendar({ book, units, onRefresh }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [plannerItems, setPlannerItems] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [form, setForm] = useState({ title: "", detail: "", unit_id: "", kid: book.kid === "Both" ? "Tigerlily" : book.kid });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    const items = await base44.entities.PlannerItem.filter({ curriculum_book_id: book.id });
    setPlannerItems(items);
  };

  const addItem = async () => {
    if (!form.title.trim() || !selectedDay) return;
    await base44.entities.PlannerItem.create({
      date: selectedDay,
      kid: form.kid,
      subject: book.subject,
      title: form.title,
      detail: form.detail,
      curriculum_book_id: book.id,
      curriculum_unit_id: form.unit_id || undefined,
    });
    setForm({ title: "", detail: "", unit_id: "", kid: book.kid === "Both" ? "Tigerlily" : book.kid });
    setAddingItem(false);
    loadItems();
  };

  const removeItem = async (id) => {
    await base44.entities.PlannerItem.delete(id);
    loadItems();
  };

  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start);
  const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";

  const itemsForDay = (ds) => plannerItems.filter(i => i.date === ds);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">Plan daily assignments for this book. They'll appear in your Planner and Home page.</div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(d => subMonths(d, 1))} className="p-1 hover:bg-muted rounded"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-medium">{format(viewDate, "MMMM yyyy")}</span>
        <button onClick={() => setViewDate(d => addMonths(d, 1))} className="p-1 hover:bg-muted rounded"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-center mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-[10px] text-muted-foreground py-1 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-border rounded-md overflow-hidden">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`p-${i}`} className="border-r border-b border-border h-14 bg-muted/20" />
        ))}
        {days.map(day => {
          const ds = format(day, "yyyy-MM-dd");
          const dayItems = itemsForDay(ds);
          const isSelected = selectedDay === ds;
          const isTodayDay = isToday(day);
          return (
            <div
              key={ds}
              onClick={() => { setSelectedDay(ds); setAddingItem(false); }}
              className={`border-r border-b border-border h-14 p-1 cursor-pointer transition-colors ${isSelected ? "bg-[#EEEDFE]" : isTodayDay ? "bg-blue-50/50" : "hover:bg-muted/30"}`}
            >
              <div className={`text-[10px] font-medium mb-0.5 w-5 h-5 flex items-center justify-center rounded-full ${isTodayDay ? "bg-[#534AB7] text-white" : "text-foreground"}`}>
                {format(day, "d")}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {dayItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjectColor }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="border border-border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {format(new Date(selectedDay + "T12:00:00"), "EEEE, MMMM d")}
            </span>
            <button
              onClick={() => setAddingItem(a => !a)}
              className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
            >
              <Plus className="w-3 h-3" /> Add assignment
            </button>
          </div>

          {/* Existing items */}
          {itemsForDay(selectedDay).map(item => (
            <div key={item.id} className="flex items-center gap-2 group">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{item.title}</div>
                {item.detail && <div className="text-[10px] text-muted-foreground">{item.detail}</div>}
              </div>
              <span className="text-[10px] text-muted-foreground">{item.kid}</span>
              <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add form */}
          {addingItem && (
            <div className="space-y-2 pt-2 border-t border-border">
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Assignment title (e.g. pp. 12–15)"
                autoFocus
                className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
              />
              <div className="flex gap-2">
                <select
                  value={form.unit_id}
                  onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}
                  className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                >
                  <option value="">Link to unit...</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {book.kid === "Both" && (
                  <select
                    value={form.kid}
                    onChange={e => setForm(f => ({ ...f, kid: e.target.value }))}
                    className="text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                  >
                    <option value="Tigerlily">Tigerlily</option>
                    <option value="Rowen">Rowen</option>
                  </select>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={addItem} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded">Add</button>
                <button onClick={() => setAddingItem(false)} className="text-xs border border-border rounded px-3 py-1.5">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}