import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Check, ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from "lucide-react";
import UnitRow from "./UnitRow";

export default function CurriculumCard({ book, onRefresh }) {
  const [open, setOpen] = useState(true);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitPages, setNewUnitPages] = useState("");

  const units = book.units || [];
  const completed = units.filter(u => u.completed).length;
  const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";
  const nextUnit = units.find(u => !u.completed);

  const addUnit = async () => {
    if (!newUnitName.trim()) return;
    const newUnit = {
      id: `u-${Date.now()}`,
      name: newUnitName.trim(),
      pages: newUnitPages.trim(),
      completed: false,
    };
    await base44.entities.CurriculumBook.update(book.id, {
      units: [...units, newUnit],
    });
    setNewUnitName("");
    setNewUnitPages("");
    onRefresh();
  };

  const markUnitDone = async (unitId) => {
    const updated = units.map(u =>
      u.id === unitId ? { ...u, completed: true, completion_date: new Date().toISOString().split("T")[0] } : u
    );
    await base44.entities.CurriculumBook.update(book.id, { units: updated });
    onRefresh();
  };

  const toggleUnit = async (unitId, val) => {
    const updated = units.map(u =>
      u.id === unitId ? { ...u, completed: val, completion_date: val ? new Date().toISOString().split("T")[0] : null } : u
    );
    await base44.entities.CurriculumBook.update(book.id, { units: updated });
    onRefresh();
  };

  const updateUnit = async (unitId, changes) => {
    const updated = units.map(u => u.id === unitId ? { ...u, ...changes } : u);
    await base44.entities.CurriculumBook.update(book.id, { units: updated });
    onRefresh();
  };

  const removeUnit = async (unitId) => {
    const updated = units.filter(u => u.id !== unitId);
    await base44.entities.CurriculumBook.update(book.id, { units: updated });
    onRefresh();
  };

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden">
      {/* Colored top bar */}
      <div className="h-1" style={{ backgroundColor: subjectColor }} />

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: subjectColor }}
              >
                {book.subject}
              </span>
              {book.grade_level && (
                <span className="text-xs text-muted-foreground">{book.grade_level}</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground">{book.name}</h3>
          </div>
          <button onClick={() => setOpen(o => !o)} className="p-1 text-muted-foreground hover:text-foreground">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{completed}/{units.length} units done</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                backgroundColor: subjectColor,
                width: units.length > 0 ? `${(completed / units.length) * 100}%` : "0%"
              }}
            />
          </div>
        </div>
      </div>

      {open && (
        <>
          {/* Up next */}
          {nextUnit && (
            <div className="mx-4 mb-3 border-l-4 border-[#534AB7] bg-[#EEEDFE] px-3 py-2 rounded-r-md">
              <div className="text-xs text-[#534AB7] font-medium mb-0.5">Up next</div>
              <div className="text-sm text-foreground font-medium">{nextUnit.name}</div>
              {nextUnit.pages && <div className="text-xs text-muted-foreground">{nextUnit.pages}</div>}
              <button
                onClick={() => markUnitDone(nextUnit.id)}
                className="mt-2 flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
              >
                <Check className="w-3 h-3" /> Mark done
              </button>
            </div>
          )}

          {/* Unit list */}
          <div className="px-4 pb-2">
            <div className="space-y-0.5">
              {units.map((unit, i) => (
                <UnitRow
                  key={unit.id}
                  unit={unit}
                  isNext={unit.id === nextUnit?.id}
                  onToggle={(val) => toggleUnit(unit.id, val)}
                  onUpdate={(changes) => updateUnit(unit.id, changes)}
                  onRemove={() => removeUnit(unit.id)}
                />
              ))}
            </div>

            {/* Add unit */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Unit name"
                value={newUnitName}
                onChange={e => setNewUnitName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addUnit(); }}
                className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
              />
              <input
                type="text"
                placeholder="Pages"
                value={newUnitPages}
                onChange={e => setNewUnitPages(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addUnit(); }}
                className="w-20 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
              />
              <button
                onClick={addUnit}
                className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}