import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Check, ChevronDown, ChevronUp, Plus, Camera, Trash2 } from "lucide-react";
import UnitRow from "./UnitRow";
import TagBadges from "@/components/tags/TagBadges";

// TABS removed - now inline in component

export default function CurriculumCard({ book, logEntries, onRefresh }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState("Units");
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitPages, setNewUnitPages] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [bookNotes, setBookNotes] = useState(book.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: "", date: "", unit_id: "" });
  const [addingTrip, setAddingTrip] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const fileRef = useRef();

  const units = book.units || [];
  const fieldTrips = book.field_trips || [];
  const completed = units.filter(u => u.completed).length;
  const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";
  const nextUnit = units.find(u => !u.completed);
  const connectedLogs = logEntries.filter(e => e.curriculum_name === book.name).length;

  const visibleUnits = showAll ? units : units.slice(0, 8);

  const saveUnits = async (updated) => {
    await base44.entities.CurriculumBook.update(book.id, { units: updated });
    onRefresh();
  };

  const addUnit = async () => {
    if (!newUnitName.trim()) return;
    const newUnit = { id: `u-${Date.now()}`, name: newUnitName.trim(), pages: newUnitPages.trim(), completed: false, resources: [] };
    await saveUnits([...units, newUnit]);
    setNewUnitName("");
    setNewUnitPages("");
    setAddingUnit(false);
  };

  const markUnitDone = async (unitId) => {
    const updated = units.map(u =>
      u.id === unitId ? { ...u, completed: true, completion_date: new Date().toISOString().split("T")[0] } : u
    );
    await saveUnits(updated);
  };

  const toggleUnit = async (unitId, val) => {
    const updated = units.map(u =>
      u.id === unitId ? { ...u, completed: val, completion_date: val ? new Date().toISOString().split("T")[0] : null } : u
    );
    await saveUnits(updated);
  };

  const updateUnit = async (unitId, changes) => {
    await saveUnits(units.map(u => u.id === unitId ? { ...u, ...changes } : u));
  };

  const removeUnit = async (unitId) => {
    await saveUnits(units.filter(u => u.id !== unitId));
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.CurriculumBook.update(book.id, { notes: bookNotes });
    setSavingNotes(false);
    onRefresh();
  };

  const addTrip = async () => {
    if (!newTrip.title.trim()) return;
    const updated = [...fieldTrips, { ...newTrip, id: `ft-${Date.now()}` }];
    await base44.entities.CurriculumBook.update(book.id, { field_trips: updated });
    setNewTrip({ title: "", date: "", unit_id: "" });
    setAddingTrip(false);
    onRefresh();
  };

  const archiveBook = async () => {
    await base44.entities.CurriculumBook.update(book.id, { is_archived: true });
    onRefresh();
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.CurriculumBook.update(book.id, { cover_image: file_url });
    onRefresh();
  };

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden">
      {/* Colored top bar */}
      <div className="h-1" style={{ backgroundColor: subjectColor }} />

      {/* Header row */}
      <div className="px-4 pt-3 pb-2 flex items-start gap-3">
        {/* Cover image */}
        <div
          className="w-12 h-16 rounded border border-border bg-muted/40 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
          onClick={() => fileRef.current?.click()}
          title="Upload cover photo"
        >
          {book.cover_image ? (
            <img src={book.cover_image} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: subjectColor }}>
                  {book.subject}
                </span>
                {book.kid && book.kid !== "Both" && (
                  <span className="text-xs text-muted-foreground">{book.kid}</span>
                )}
                {book.grade_level && (
                  <span className="text-xs text-muted-foreground">· {book.grade_level}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{book.name}</h3>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button onClick={() => setConfirmArchive(true)} className="p-1 text-muted-foreground hover:text-red-400" title="Archive curriculum">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(o => !o)} className="p-1 text-muted-foreground hover:text-foreground">
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Archive confirm dialog */}
            {confirmArchive && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setConfirmArchive(false)}>
                <div className="bg-white border border-border rounded-xl w-80 shadow-xl p-5" onClick={e => e.stopPropagation()}>
                  <div className="text-sm font-semibold text-foreground mb-2">Archive this curriculum?</div>
                  <p className="text-xs text-muted-foreground mb-4">It will be hidden from your main view but its data is preserved and won't be lost.</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setConfirmArchive(false)} className="text-xs border border-border rounded px-3 py-1.5 hover:bg-muted">Cancel</button>
                    <button onClick={archiveBook} className="text-xs bg-red-500 text-white rounded px-3 py-1.5 hover:bg-red-600">Archive</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{completed}/{units.length} lessons</span>
              {connectedLogs > 0 && (
                <span className="text-[#534AB7]">{connectedLogs} log{connectedLogs !== 1 ? "s" : ""}</span>
              )}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ backgroundColor: subjectColor, width: units.length > 0 ? `${(completed / units.length) * 100}%` : "0%" }} />
            </div>
          </div>

          {/* Progress dots */}
          {units.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {units.map((u, i) => (
                <div
                  key={u.id}
                  title={u.name}
                  className={`w-2 h-2 rounded-full border ${u.completed ? "bg-current border-transparent" : u.id === nextUnit?.id ? "bg-white border-current" : "bg-muted border-border"}`}
                  style={u.completed || u.id === nextUnit?.id ? { color: subjectColor, borderColor: subjectColor } : {}}
                />
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="mt-2">
            <TagBadges tagIds={book.tag_ids || []} limit={2} />
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
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => markUnitDone(nextUnit.id)}
                  className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
                >
                  <Check className="w-3 h-3" /> Mark done
                </button>
                {connectedLogs > 0 && (
                  <span className="text-xs text-muted-foreground">{connectedLogs} log entries connected</span>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border px-4">
            {["Lessons", "Photos", "Field trips"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs px-3 py-2 border-b-2 transition-colors -mb-px ${tab === t ? "border-[#534AB7] text-[#534AB7] font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab: Lessons */}
          {tab === "Lessons" && (
            <div className="px-4 py-3">
              <div className="space-y-0.5">
                {visibleUnits.map(unit => (
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
              {units.length > 8 && (
                <button
                  onClick={() => setShowAll(p => !p)}
                  className="text-xs text-[#534AB7] hover:underline mt-2"
                >
                  {showAll ? "Show less" : `Show all ${units.length} lessons`}
                </button>
              )}
              {/* Add lesson */}
              {addingUnit ? (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Unit name"
                    value={newUnitName}
                    onChange={e => setNewUnitName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addUnit(); }}
                    className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Pages"
                    value={newUnitPages}
                    onChange={e => setNewUnitPages(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addUnit(); }}
                    className="w-20 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                  />
                  <button onClick={addUnit} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0]">Add</button>
                  <button onClick={() => { setAddingUnit(false); setNewUnitName(""); setNewUnitPages(""); }} className="text-xs border border-border px-2 py-1.5 rounded hover:bg-muted">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingUnit(true)}
                  className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline mt-3"
                >
                  <Plus className="w-3 h-3" /> Add lesson
                </button>
              )}
            </div>
          )}

          {/* Tab: Notes */}
          {tab === "Notes" && (
            <div className="px-4 py-3 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Curriculum notes</div>
                <textarea
                  value={bookNotes}
                  onChange={e => setBookNotes(e.target.value)}
                  placeholder="General notes about this curriculum..."
                  rows={3}
                  className="w-full text-sm border border-border rounded px-3 py-2 resize-none outline-none focus:border-[#534AB7]"
                />
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0] mt-1 disabled:opacity-50"
                >
                  {savingNotes ? "Saving..." : "Save notes"}
                </button>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Per-lesson notes</div>
                <div className="space-y-2">
                  {units.map(u => (
                    <div key={u.id} className="flex items-start gap-2">
                      <span className="text-xs text-foreground min-w-0 w-28 truncate pt-1.5 shrink-0">{u.name}</span>
                      <textarea
                        defaultValue={u.notes || ""}
                        onBlur={e => updateUnit(u.id, { notes: e.target.value })}
                        placeholder="Note..."
                        rows={1}
                        className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 resize-none outline-none focus:border-[#534AB7]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Field trips */}
          {tab === "Field trips" && (
            <div className="px-4 py-3">
              {fieldTrips.length === 0 && !addingTrip && (
                <p className="text-xs text-muted-foreground mb-2">No field trips logged yet.</p>
              )}
              <div className="space-y-1.5 mb-3">
                {fieldTrips.map((ft, i) => (
                  <div key={i} className="bg-muted/40 rounded px-3 py-2 text-xs">
                    <div className="font-medium text-foreground">{ft.title}</div>
                    <div className="text-muted-foreground">{ft.date}{ft.unit_id && ` · Unit: ${units.find(u => u.id === ft.unit_id)?.name || ft.unit_id}`}</div>
                  </div>
                ))}
              </div>
              {addingTrip ? (
                <div className="space-y-2">
                  <input
                    value={newTrip.title}
                    onChange={e => setNewTrip(p => ({ ...p, title: e.target.value }))}
                    placeholder="Trip title"
                    className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newTrip.date}
                      onChange={e => setNewTrip(p => ({ ...p, date: e.target.value }))}
                      className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                    />
                    <select
                      value={newTrip.unit_id}
                      onChange={e => setNewTrip(p => ({ ...p, unit_id: e.target.value }))}
                      className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                    >
                      <option value="">Link to unit...</option>
                      {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addTrip} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0]">Add trip</button>
                    <button onClick={() => setAddingTrip(false)} className="text-xs border border-border rounded px-3 py-1.5 hover:bg-muted">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTrip(true)}
                  className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add field trip
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}