import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function BulkScheduler({ book, units, onRefresh }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [form, setForm] = useState({ unitId: "", pageRanges: "", startDate: format(new Date(), "yyyy-MM-dd") });
  const [skippedDays, setSkippedDays] = useState([]);
  const [preview, setPreview] = useState([]);
  const [saving, setSaving] = useState(false);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    .filter(d => d.getDay() >= 1 && d.getDay() <= 5); // Mon-Fri only

  const parsePageRanges = (text) => {
    if (!text.trim()) return [];
    // Split by comma or slash, clean up whitespace
    return text.split(/[,/]/).map(s => s.trim()).filter(s => s.length > 0);
  };

  const generatePreview = () => {
    const ranges = parsePageRanges(form.pageRanges);
    if (!ranges.length) return;

    const previewDays = weekDays.filter(d => !skippedDays.includes(format(d, "yyyy-MM-dd")));
    const assignments = ranges.slice(0, previewDays.length).map((range, i) => ({
      date: format(previewDays[i], "yyyy-MM-dd"),
      day: format(previewDays[i], "EEE"),
      title: `pages ${range}`,
      range,
    }));
    setPreview(assignments);
  };

  const createAssignments = async () => {
    if (preview.length === 0) return;
    setSaving(true);

    const selectedUnit = units.find(u => u.id === form.unitId);
    const unitName = selectedUnit?.name || "";

    await Promise.all(
      preview.map(item =>
        base44.entities.PlannerItem.create({
          date: item.date,
          kid: book.kid,
          subject: book.subject,
          title: `${book.name}: ${item.title}`,
          detail: item.title,
          curriculum_book_id: book.id,
          curriculum_unit_id: form.unitId || undefined,
        })
      )
    );

    setSaving(false);
    setForm({ unitId: "", pageRanges: "", startDate: format(new Date(), "yyyy-MM-dd") });
    setSkippedDays([]);
    setPreview([]);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">Bulk schedule multiple pages or chapters across the week.</div>

      {/* Form */}
      <div className="bg-muted/20 rounded-md p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Link to unit (optional)</label>
            <select
              value={form.unitId}
              onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
              className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            >
              <option value="">None</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Page ranges</label>
            <input
              value={form.pageRanges}
              onChange={e => setForm(f => ({ ...f, pageRanges: e.target.value }))}
              placeholder="13-15, 16-18, 19-21"
              className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            />
          </div>
        </div>
        <button
          onClick={generatePreview}
          className="text-xs border border-[#534AB7] text-[#534AB7] px-3 py-1.5 rounded hover:bg-[#EEEDFE]"
        >
          Preview schedule
        </button>
      </div>

      {/* Week view with skip toggles */}
      {preview.length > 0 && (
        <div className="bg-white border border-border rounded-md p-3 space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">Schedule preview — click a day to skip</div>
          <div className="space-y-1.5">
            {weekDays.map(day => {
              const ds = format(day, "yyyy-MM-dd");
              const isSkipped = skippedDays.includes(ds);
              const assignment = preview.find(a => a.date === ds);
              return (
                <button
                  key={ds}
                  onClick={() => setSkippedDays(prev => prev.includes(ds) ? prev.filter(d => d !== ds) : [...prev, ds])}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded border-l-4 transition-all ${
                    isSkipped
                      ? "opacity-40 border-l-border bg-muted/20"
                      : assignment
                        ? "border-l-[#534AB7] bg-[#EEEDFE]"
                        : "border-l-border hover:bg-muted/20"
                  }`}
                >
                  <span className="text-xs font-medium w-12">{format(day, "EEE")}</span>
                  <span className="text-xs text-muted-foreground">{format(day, "M/d")}</span>
                  {assignment && <span className="text-xs text-[#534AB7] font-medium">{assignment.title}</span>}
                  {isSkipped && <span className="text-xs text-muted-foreground ml-auto">skipped</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create button */}
      {preview.length > 0 && (
        <button
          onClick={createAssignments}
          disabled={saving}
          className="w-full text-sm bg-[#534AB7] text-white py-2.5 rounded hover:bg-[#4340a0] disabled:opacity-50 font-medium"
        >
          {saving ? "Creating..." : `Create ${preview.length} assignments`}
        </button>
      )}
    </div>
  );
}