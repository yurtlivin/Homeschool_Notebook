import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";

export default function BulkScheduler({ book, units, onRefresh }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dayData, setDayData] = useState({}); // { "2026-04-30": { pages: "13-15", notes: "Watch video X", unit_id: "u-123" } }
  const [editingDay, setEditingDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conflictDialog, setConflictDialog] = useState(null); // "ask" | null

  useEffect(() => {
    loadScheduledItems();
  }, [book.id]);

  const loadScheduledItems = async () => {
    setLoading(true);
    const items = await base44.entities.PlannerItem.filter({ curriculum_book_id: book.id });
    const newDayData = {};
    items.forEach(item => {
      if (item.date) {
        newDayData[item.date] = {
          pages: item.detail?.split('\n')[0] || item.title || "",
          notes: item.detail?.includes('\n') ? item.detail.split('\n').slice(1).join('\n') : "",
          id: item.id, // track original IDs
          unit_id: item.curriculum_unit_id || "", // store per-day unit
        };
      }
    });
    setDayData(newDayData);
    setLoading(false);
  };

  const checkForConflicts = () => {
    const newAssignments = Object.entries(dayData).filter(
      ([_, data]) => data?.pages?.trim() && !data.id
    );
    const existingAssignments = Object.entries(dayData).filter(
      ([_, data]) => data?.pages?.trim() && data.id
    );
    return { newCount: newAssignments.length, existingCount: existingAssignments.length, existingDates: existingAssignments.map(([d]) => d) };
  };

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

  const handleCreateClick = () => {
    const { newCount, existingCount } = checkForConflicts();
    if (existingCount > 0) {
      setConflictDialog("ask");
    } else {
      createAssignments("new");
    }
  };

  const createAssignments = async (action) => {
    setSaving(true);

    if (action === "delete") {
      // Delete existing assignments
      const existing = Object.entries(dayData).filter(([_, data]) => data?.id);
      await Promise.all(existing.map(([_, data]) => base44.entities.PlannerItem.delete(data.id)));
    }

    if (action === "keep") {
      // Only create new ones
      const newAssignments = Object.entries(dayData).filter(([_, data]) => data?.pages?.trim() && !data.id);
      await Promise.all(
        newAssignments.map(([date, data]) =>
          base44.entities.PlannerItem.create({
            date,
            kid: book.kid,
            subject: book.subject,
            title: `${book.name}: pages ${data.pages}`,
            detail: data.notes ? `pages ${data.pages}\n${data.notes}` : `pages ${data.pages}`,
            curriculum_book_id: book.id,
            curriculum_unit_id: data.unit_id || undefined,
          })
        )
      );
    }

    if (action === "override") {
      // Delete existing and create all
      const existing = Object.entries(dayData).filter(([_, data]) => data?.id);
      await Promise.all(existing.map(([_, data]) => base44.entities.PlannerItem.delete(data.id)));

      const allAssignments = Object.entries(dayData).filter(([_, data]) => data?.pages?.trim());
      await Promise.all(
        allAssignments.map(([date, data]) =>
          base44.entities.PlannerItem.create({
            date,
            kid: book.kid,
            subject: book.subject,
            title: `${book.name}: pages ${data.pages}`,
            detail: data.notes ? `pages ${data.pages}\n${data.notes}` : `pages ${data.pages}`,
            curriculum_book_id: book.id,
            curriculum_unit_id: data.unit_id || undefined,
          })
        )
      );
    }

    if (action === "new") {
      const assignmentList = Object.entries(dayData).filter(([_, data]) => data?.pages?.trim() && !data.id);
      await Promise.all(
        assignmentList.map(([date, data]) =>
          base44.entities.PlannerItem.create({
            date,
            kid: book.kid,
            subject: book.subject,
            title: `${book.name}: pages ${data.pages}`,
            detail: data.notes ? `pages ${data.pages}\n${data.notes}` : `pages ${data.pages}`,
            curriculum_book_id: book.id,
            curriculum_unit_id: data.unit_id || undefined,
          })
        )
      );
    }

    setSaving(false);
    setConflictDialog(null);
    setDayData({});
    await loadScheduledItems();
    onRefresh();
  };

  const { newCount, existingCount } = checkForConflicts();
  const assignmentCount = Object.values(dayData).filter(d => d?.pages?.trim()).length;

  if (loading) {
    return <div className="text-sm text-muted-foreground py-4">Loading schedule...</div>;
  }

  // Assign colors to units for visual distinction
  const unitColors = {};
  const colors = ["#E94B3C", "#2E7D32", "#0D47A1", "#F57C00", "#6A1B9A", "#00796B", "#C62828"];
  units.forEach((u, i) => {
    unitColors[u.id] = colors[i % colors.length];
  });

  const getUnitColor = (unitId) => unitId && unitColors[unitId] ? unitColors[unitId] : "#534AB7";

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">Assign pages and notes across the week—select a unit per day to link the lesson.</div>

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
           const data = dayData[ds] || { pages: "", notes: "", unit_id: "" };
           const dayUnitColor = getUnitColor(data.unit_id);
           const isEditing = editingDay === ds;

           return (
             <div
               key={ds}
               className={`border rounded-lg p-2 transition-colors ${
                 isEditing ? "border-2" : data.pages ? "border-2" : "border bg-white hover:bg-muted/30"
               }`}
               style={{
                 borderColor: isEditing || data.pages ? dayUnitColor : "inherit",
                 backgroundColor: isEditing || data.pages ? dayUnitColor + "08" : "inherit",
               }}
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

               {/* Unit selector dropdown */}
               {units.length > 0 && (
                 <div className="mb-2">
                   <select
                     value={data.unit_id || ""}
                     onChange={e => updateDayData(ds, "unit_id", e.target.value)}
                     className="w-full text-[9px] border rounded px-1.5 py-1 outline-none focus:border-2"
                     style={{
                       borderColor: data.unit_id ? dayUnitColor : "inherit",
                       backgroundColor: data.unit_id ? dayUnitColor + "12" : "inherit",
                     }}
                   >
                     <option value="">No unit</option>
                     {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                   </select>
                 </div>
               )}

               {/* Pages input */}
               <div className="mb-2">
                 <input
                   value={data.pages}
                   onChange={e => updateDayData(ds, "pages", e.target.value)}
                   onFocus={() => setEditingDay(ds)}
                   onBlur={() => setEditingDay(null)}
                   placeholder="e.g. 1-3"
                   className={`w-full text-[10px] border rounded px-1.5 py-1 outline-none focus:border-2 ${
                     data.pages ? "bg-white" : "border-border"
                   }`}
                   style={{
                     borderColor: data.pages ? dayUnitColor : "inherit",
                   }}
                 />
               </div>

               {/* Notes input */}
               <div>
                 <textarea
                   value={data.notes}
                   onChange={e => updateDayData(ds, "notes", e.target.value)}
                   onFocus={() => setEditingDay(ds)}
                   onBlur={() => setEditingDay(null)}
                   placeholder="Video, resource, note..."
                   className="w-full text-[10px] border rounded px-1.5 py-1 resize-none h-12 outline-none focus:border-2"
                   style={{
                     borderColor: data.notes ? dayUnitColor : "inherit",
                   }}
                 />
               </div>
             </div>
           );
         })}
      </div>

      {/* Create button */}
      {newCount > 0 && (
        <button
          onClick={handleCreateClick}
          disabled={saving}
          className="w-full text-sm bg-[#534AB7] text-white py-2.5 rounded hover:bg-[#4340a0] disabled:opacity-50 font-medium"
        >
          {saving ? "Creating..." : existingCount > 0 ? `Create ${newCount} new assignment${newCount !== 1 ? "s" : ""}` : `Create ${newCount} assignment${newCount !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Conflict dialog */}
      {conflictDialog === "ask" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setConflictDialog(null)}>
          <div className="bg-white border border-border rounded-xl w-96 shadow-xl p-5" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-2">Already scheduled</div>
            <p className="text-xs text-muted-foreground mb-4">
              {existingCount} assignment{existingCount !== 1 ? "s" : ""} already exist for these days. What would you like to do?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => createAssignments("keep")}
                disabled={saving}
                className="w-full text-sm border border-[#534AB7] text-[#534AB7] px-4 py-2 rounded hover:bg-[#EEEDFE] disabled:opacity-50"
              >
                Keep existing, add new ({newCount})
              </button>
              <button
                onClick={() => createAssignments("override")}
                disabled={saving}
                className="w-full text-sm bg-amber-100 text-amber-700 px-4 py-2 rounded hover:bg-amber-200 disabled:opacity-50"
              >
                Replace all ({assignmentCount})
              </button>
              <button
                onClick={() => createAssignments("delete")}
                disabled={saving}
                className="w-full text-sm bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50"
              >
                Delete existing, don't create
              </button>
              <button
                onClick={() => setConflictDialog(null)}
                className="w-full text-sm border border-border px-4 py-2 rounded hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}