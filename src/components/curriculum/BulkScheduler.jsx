import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Plus, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export default function BulkScheduler({ book, units, onRefresh }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [unitId, setUnitId] = useState("");
  const [assignments, setAssignments] = useState({}); // { "2026-04-30": "13-15", ... }
  const [editingDay, setEditingDay] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [saving, setSaving] = useState(false);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    .filter(d => d.getDay() >= 1 && d.getDay() <= 5); // Mon-Fri only

  const handleDayClick = (day) => {
    const ds = format(day, "yyyy-MM-dd");
    setEditingDay(ds);
    setEditInput(assignments[ds] || "");
  };

  const saveAssignment = () => {
    if (editInput.trim()) {
      setAssignments(prev => ({ ...prev, [editingDay]: editInput.trim() }));
    } else {
      setAssignments(prev => {
        const next = { ...prev };
        delete next[editingDay];
        return next;
      });
    }
    setEditingDay(null);
    setEditInput("");
  };

  const removeAssignment = (ds) => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[ds];
      return next;
    });
  };

  const createAssignments = async () => {
    const assignmentList = Object.entries(assignments).filter(([_, pages]) => pages?.trim());
    if (assignmentList.length === 0) return;
    setSaving(true);

    await Promise.all(
      assignmentList.map(([date, pages]) =>
        base44.entities.PlannerItem.create({
          date,
          kid: book.kid,
          subject: book.subject,
          title: `${book.name}: pages ${pages}`,
          detail: `pages ${pages}`,
          curriculum_book_id: book.id,
          curriculum_unit_id: unitId || undefined,
        })
      )
    );

    setSaving(false);
    setAssignments({});
    setUnitId("");
    onRefresh();
  };

  const assignmentCount = Object.values(assignments).filter(p => p?.trim()).length;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">Click a day to assign page ranges. Organize one unit across multiple days.</div>

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

      {/* Week calendar */}
      <div className="bg-white border border-border rounded-md p-3 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setWeekStart(d => subWeeks(d, 1))} className="p-1 hover:bg-muted rounded">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-medium">{format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}</span>
          <button onClick={() => setWeekStart(d => addWeeks(d, 1))} className="p-1 hover:bg-muted rounded">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {weekDays.map(day => {
            const ds = format(day, "yyyy-MM-dd");
            const pages = assignments[ds];
            const isEditing = editingDay === ds;

            return (
              <div key={ds} className={`border rounded-md p-2.5 transition-colors ${isEditing ? "bg-[#EEEDFE]" : "bg-muted/20"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">{format(day, "EEE, M/d")}</span>
                  {pages && !isEditing && (
                    <button
                      onClick={() => removeAssignment(ds)}
                      className="text-muted-foreground hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex gap-1.5">
                    <input
                      value={editInput}
                      onChange={e => setEditInput(e.target.value)}
                      placeholder="13-15"
                      autoFocus
                      className="flex-1 text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-[#534AB7]"
                    />
                    <button
                      onClick={saveAssignment}
                      className="text-xs bg-[#534AB7] text-white px-2 py-1.5 rounded hover:bg-[#4340a0]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDay(null)}
                      className="text-xs border border-border px-2 py-1.5 rounded hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${
                      pages
                        ? "bg-[#534AB7] text-white font-medium"
                        : "text-muted-foreground hover:bg-muted/50 border border-dashed border-border"
                    }`}
                  >
                    {pages ? `pages ${pages}` : "+ Add pages"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
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