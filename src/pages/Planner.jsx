import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";
import { SUBJECT_COLORS } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Plus, X, Flag } from "lucide-react";

const SUBJECTS = Object.keys(SUBJECT_COLORS);
const KIDS = ["Tigerlily", "Rowen", "Both"];

export default function Planner() {
  const { activeUser } = useUser();
  const [weekRef, setWeekRef] = useState(new Date());
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formDay, setFormDay] = useState(null);
  const [form, setForm] = useState({ subject: "Math", kid: "Tigerlily", title: "", detail: "", handoff_flag: false, sub_directions: [] });
  const [newDirection, setNewDirection] = useState("");
  const [saving, setSaving] = useState(false);

  const weekStart = startOfWeek(weekRef, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekRef, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    .filter(d => d.getDay() >= 1 && d.getDay() <= 5);

  useEffect(() => { loadItems(); }, [weekRef]);

  const loadItems = async () => {
    const data = await base44.entities.PlannerItem.list("-date", 500);
    setItems(data);
  };

  const itemsForDay = (dateStr) => items.filter(i => i.date === dateStr);

  const openForm = (dateStr) => {
    setFormDay(dateStr);
    setShowForm(true);
    setForm({ subject: "Math", kid: "Tigerlily", title: "", detail: "", handoff_flag: false, sub_directions: [] });
  };

  const addDirection = () => {
    if (!newDirection.trim()) return;
    setForm(f => ({ ...f, sub_directions: [...f.sub_directions, newDirection.trim()] }));
    setNewDirection("");
  };

  const saveItem = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.PlannerItem.create({ ...form, date: formDay });
    setSaving(false);
    setShowForm(false);
    loadItems();
  };

  const removeItem = async (id) => {
    await base44.entities.PlannerItem.delete(id);
    loadItems();
  };

  const handoffCount = items.filter(i => {
    const d = new Date(i.date);
    return d >= weekStart && d <= weekEnd && i.handoff_flag;
  }).length;

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">Planner</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekRef(w => subWeeks(w, 1))} className="p-2 hover:bg-muted rounded-md"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium text-foreground min-w-[180px] text-center">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </span>
          <button onClick={() => setWeekRef(w => addWeeks(w, 1))} className="p-2 hover:bg-muted rounded-md"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">Week of</div>
          <div className="text-sm font-semibold mt-0.5">{format(weekStart, "MMMM d")}</div>
        </div>
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">Items planned</div>
          <div className="text-sm font-semibold mt-0.5">
            {weekDays.reduce((sum, d) => sum + itemsForDay(format(d, "yyyy-MM-dd")).length, 0)}
          </div>
        </div>
        <div className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground">Handoff notes</div>
          <div className="text-sm font-semibold mt-0.5">{handoffCount}</div>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-5 gap-3">
        {weekDays.map(day => {
          const ds = format(day, "yyyy-MM-dd");
          const dayItems = itemsForDay(ds);
          const isToday = ds === format(new Date(), "yyyy-MM-dd");

          return (
            <div key={ds} className="min-h-[300px]">
              <div className={`text-xs font-semibold px-2 py-2 rounded-t-md mb-1 ${isToday ? "bg-[#534AB7] text-white" : "text-muted-foreground"}`}>
                {format(day, "EEE")}<br />
                <span className={`text-sm ${isToday ? "text-white" : "text-foreground"}`}>{format(day, "d")}</span>
              </div>
              <div className="space-y-1.5">
                {dayItems.map(item => (
                  <div
                    key={item.id}
                    className="group bg-white border border-border rounded text-xs overflow-hidden"
                    style={{ borderLeftColor: SUBJECT_COLORS[item.subject] || "#534AB7", borderLeftWidth: 3 }}
                  >
                    <div className="px-2.5 py-2">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block truncate">{item.title}</span>
                          {item.detail && <span className="text-muted-foreground block truncate">{item.detail}</span>}
                          <div className="flex items-center gap-1 mt-1">
                            <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: SUBJECT_COLORS[item.subject] + "22", color: SUBJECT_COLORS[item.subject] }}>
                              {item.subject}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{item.kid}</span>
                            {item.handoff_flag && <Flag className="w-2.5 h-2.5 text-[#534AB7]" />}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {item.sub_directions?.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {item.sub_directions.map((d, i) => (
                            <div key={i} className="text-muted-foreground flex gap-1">
                              <span>→</span><span>{d}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => openForm(ds)}
                  className="w-full text-[10px] text-muted-foreground border border-dashed border-border rounded py-1.5 hover:border-[#534AB7] hover:text-[#534AB7] transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-4 mt-5 px-1">
        {Object.entries(SUBJECT_COLORS).map(([subj, color]) => (
          <div key={subj} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{subj}</span>
          </div>
        ))}
      </div>

      {/* Add item form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-border rounded-t-xl sm:rounded-xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-semibold">Add to {formDay}</span>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-border rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#534AB7]">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">For</label>
                  <select value={form.kid} onChange={e => setForm(f => ({ ...f, kid: e.target.value }))} className="w-full border border-border rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#534AB7]">
                    {KIDS.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Multiplication review" className="w-full border border-border rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#534AB7]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Detail / pages</label>
                <input value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} placeholder="e.g. p.33–40" className="w-full border border-border rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#534AB7]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Sub-directions</label>
                <div className="flex gap-2">
                  <input value={newDirection} onChange={e => setNewDirection(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addDirection(); }} placeholder="Add a step..." className="flex-1 border border-border rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#534AB7]" />
                  <button onClick={addDirection} className="text-xs border border-border rounded px-3 py-1.5 hover:bg-muted">Add</button>
                </div>
                {form.sub_directions.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <span>→</span><span>{d}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.handoff_flag} onChange={e => setForm(f => ({ ...f, handoff_flag: e.target.checked }))} className="w-4 h-4 accent-[#534AB7]" />
                <span className="text-sm text-foreground flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-[#534AB7]" /> Mark as handoff carry-forward
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <button onClick={() => setShowForm(false)} className="text-sm border border-border rounded px-4 py-2 hover:bg-muted">Cancel</button>
              <button onClick={saveItem} disabled={saving || !form.title.trim()} className="text-sm bg-[#534AB7] text-white rounded px-4 py-2 hover:bg-[#4340a0] disabled:opacity-50">
                {saving ? "Saving..." : "Add to planner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}