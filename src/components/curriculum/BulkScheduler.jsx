import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";

export default function BulkScheduler({ book, units, onRefresh }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [unitId, setUnitId] = useState("");
  const [dayData, setDayData] = useState({}); // { "2026-04-30": { pages: "13-15", notes: "Watch video X" } }
  const [editingDay, setEditingDay] = useState(null);
  const [saving, setSaving] = useState(false);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    .filter(d => d.getDay() >= 1 && d.getDay() <= 5); // Mon-Fri only

  const updateDayData = (ds, field, value) => {
    setDayData(prev => ({
      ...prev,
      [ds]: { ...prev[ds], [field]: value },
    }));
  };

  const removeDay = (ds) => {
    setDayData(prev => {
      const next = { ...prev };
      delete next[ds];
      return next;
    });
  };

  const createAssignments = async () => {
    const assignmentList = Object.entries(dayData).filter(([_, data]) => data?.pages?.trim());
    if (assignmentList.length === 0) return;
    setSaving(true);

    await Promise.all(
      assignmentList.map(([date, data]) =>
        base44.entities.PlannerItem.create({
          date,
          kid: book.kid,
          subject: book.subject,
          title: `${book.name}: pages ${data.pages}`,
          detail: data.notes ? `pages ${data.pages}\n${data.notes}` : `pages ${data.pages}`,
          curriculum_book_id: book.id,
          curriculum_unit_id: unitId || undefined,
        })
      )
    );

    setSaving(false);
    setDayData({});
    setUnitId("");
    onRefresh();
  };

  const assignmentCount = Object.values(dayData).filter(d => d?.pages?.trim()).length;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">Assign pages and notes across the week—add videos, resources, or reminders per day.</div>

      {/* Unit selector */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Link to unit (optional)</label>
        <select
          value={unitId}
          onChange={e => setUnitId(e.target.value)}
          className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
        >
          <option value="">None</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => setWeekStart(d => subWeeks(d, 1))} className="p-1 hover:bg-muted rounded">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-medium">{format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}</span>
        <button onClick={() => setWeekStart(d => addWeeks(d, 1))} className="p-1 hover:bg-muted rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal calendar grid */}
      <div className="grid grid-cols-5 gap-2">
        {weekDays.map(day => {
          const ds = format(day, "yyyy-MM-dd");
          const data = dayData[ds] || { pages: "", notes: "" };
          const isEditing = editingDay === ds;

          return (
            <div
              key={ds}
              className={`border rounded-lg p-2 transition-colors ${
                isEditing ? "bg-[#EEEDFE] border-[#534AB7]" : data.pages ? "bg-[#EEEDFE] border-[#534AB7]/30" : "bg-white hover:bg-muted/30"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-foreground">{format(day, "EEE")}</span>
                <span className="text-[10px] text-muted-foreground">{format(day, "d")}</span>
                {data.pages && !isEditing && (
                  <button
                    onClick={() => removeDay(ds)}
                    className="text-muted-foreground hover:text-red-500 p-0.5 -mr-1"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Pages input */}
              <div className="mb-2">
                <input
                  value={data.pages}
                  onChange={e => updateDayData(ds, "pages", e.target.value)}
                  onFocus={() => setEditingDay(ds)}
                  onBlur={() => setEditingDay(null)}
                  placeholder="Pages"
                  className={`w-full text-[10px] border rounded px-1.5 py-1 outline-none focus:border-[#534AB7] ${
                    data.pages ? "bg-white border-[#534AB7]" : "border-border"
                  }`}
                />
              </div>

              {/* Notes input */}
              <div>
                <textarea
                  value={data.notes}
                  onChange={e => updateDayData(ds, "notes", e.target.value)}
                  onFocus={() => setEditingDay(ds)}
                  onBlur={() => setEditingDay(null)}
                  placeholder="Notes, video, resource..."
                  className="w-full text-[10px] border border-border rounded px-1.5 py-1 resize-none h-12 outline-none focus:border-[#534AB7]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create button */}
      {assignmentCount > 0 && (
        <button
          onClick={createAssignments}
          disabled={saving}
          className="w-full text-sm bg-[#534AB7] text-white py-2.5 rounded hover:bg-[#4340a0] disabled:opacity-50 font-medium"
        >
          {saving ? "Creating..." : `Create ${assignmentCount} assignment${assignmentCount !== 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}