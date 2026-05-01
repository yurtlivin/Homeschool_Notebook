import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import db from "@/lib/supabaseClient";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Camera, Plus, X, Trash2, Check, Pencil, MapPin, Sparkles, Upload, Save, Calendar } from "lucide-react";
import UnitRow from "./UnitRow";
import BookMiniCalendar from "./BookMiniCalendar";
import BookPhotoGallery from "./BookPhotoGallery";
import CompletionDatePicker from "./CompletionDatePicker";
import BulkScheduler from "./BulkScheduler";
import LessonDetailModal from "./LessonDetailModal";

const TABS = ["Lessons", "Photos", "Field Trips", "Notes", "Schedule", "Plan"];
const KIDS = ["Tigerlily", "Rowen", "Both"];

export default function BookDetailPanel({ book, onRefresh, onClose }) {
  const [tab, setTab] = useState("Lessons");
  const [subjects, setSubjects] = useState([]);
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitPages, setNewUnitPages] = useState("");
  const [bookNotes, setBookNotes] = useState(book.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [addingTrip, setAddingTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: "", date: "", unit_id: "", note: "" });
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState(null);
  const [scannedUnits, setScannedUnits] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ name: book.name, subject: book.subject, kid: book.kid, grade_level: book.grade_level || "" });
  const [savingInfo, setSavingInfo] = useState(false);
  const [datePickerUnitId, setDatePickerUnitId] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const coverRef = useRef();
  const scanRef = useRef();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const cats = await db.subjectCategories.list();
    setSubjects(cats);
  };

  const units = book.units || [];
  const fieldTrips = book.field_trips || [];
  const completed = units.filter(u => u.completed).length;
  const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";
  const nextUnit = units.find(u => !u.completed);

  const saveUnits = async (updated) => {
    await base44.entities.CurriculumBook.update(book.id, { units: updated });
    onRefresh();
  };

  const addUnit = async () => {
    if (!newUnitName.trim()) return;
    const newUnit = { id: `u-${Date.now()}`, name: newUnitName.trim(), pages: newUnitPages.trim(), completed: false, resources: [] };
    await saveUnits([...units, newUnit]);
    setNewUnitName(""); setNewUnitPages(""); setAddingUnit(false);
  };

  const toggleUnit = async (unitId, val) => {
    const newDate = val ? new Date().toISOString().split("T")[0] : null;
    await saveUnits(units.map(u => u.id === unitId ? { ...u, completed: val, completion_date: newDate } : u));
  };

  const updateCompletionDate = async (unitId, newDate) => {
    await saveUnits(units.map(u => u.id === unitId ? { ...u, completion_date: newDate } : u));
    setDatePickerUnitId(null);
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

  const saveInfo = async () => {
    setSavingInfo(true);
    await base44.entities.CurriculumBook.update(book.id, {
      name: editForm.name.trim(),
      subject: editForm.subject,
      kid: editForm.kid,
      grade_level: editForm.grade_level.trim(),
    });
    setSavingInfo(false);
    setEditingInfo(false);
    onRefresh();
  };

  const addTrip = async () => {
    if (!newTrip.title.trim()) return;
    const updated = [...fieldTrips, { ...newTrip, id: `ft-${Date.now()}` }];
    await base44.entities.CurriculumBook.update(book.id, { field_trips: updated });
    setNewTrip({ title: "", date: "", unit_id: "", note: "" });
    setAddingTrip(false);
    onRefresh();
  };

  const removeTrip = async (id) => {
    await base44.entities.CurriculumBook.update(book.id, { field_trips: fieldTrips.filter(f => f.id !== id) });
    onRefresh();
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.CurriculumBook.update(book.id, { cover_image: file_url });
    onRefresh();
  };

  const handleScanImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanPreview(URL.createObjectURL(file));
    setScanning(true);
    setScannedUnits([]);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing an image of a homeschool curriculum book (table of contents, index, or chapter list page).
Extract all chapters, lessons, or units you can find.
For each unit extract: name (the chapter/lesson title) and pages (page range as a string like "pp. 12–24", leave blank if not visible).
Return ONLY a JSON object with a "units" array.`,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          units: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                pages: { type: "string" }
              }
            }
          }
        }
      }
    });
    setScannedUnits((result.units || []).map((u, i) => ({ ...u, id: `u-scan-${Date.now()}-${i}` })));
    setScanning(false);
  };

  const importScannedUnits = async () => {
    const newUnits = scannedUnits.filter(u => u.name.trim()).map(u => ({
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: u.name.trim(),
      pages: u.pages || "",
      completed: false,
      resources: []
    }));
    await saveUnits([...units, ...newUnits]);
    setShowScanModal(false);
    setScanPreview(null);
    setScannedUnits([]);
  };

  const archiveBook = async () => {
    await base44.entities.CurriculumBook.update(book.id, { is_archived: true });
    onRefresh();
    onClose();
  };

  const pct = units.length > 0 ? Math.round((completed / units.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-start gap-4">
          {/* Cover */}
          <div
            className="w-12 rounded border border-border bg-muted/40 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
            style={{ height: 96 }}
            onClick={() => coverRef.current?.click()}
          >
            {book.cover_image ? (
              <img src={book.cover_image} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          <div className="flex-1 min-w-0">
            {editingInfo ? (
              <div className="space-y-2">
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Book name"
                  className="w-full text-sm font-semibold border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                />
                <div className="flex gap-2">
                  <select
                    value={editForm.subject}
                    onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                    className="flex-1 text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-[#534AB7]"
                  >
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <select
                    value={editForm.kid}
                    onChange={e => setEditForm(f => ({ ...f, kid: e.target.value }))}
                    className="flex-1 text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-[#534AB7]"
                  >
                    {KIDS.map(k => <option key={k}>{k}</option>)}
                  </select>
                  <input
                    value={editForm.grade_level}
                    onChange={e => setEditForm(f => ({ ...f, grade_level: e.target.value }))}
                    placeholder="Grade"
                    className="w-24 text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-[#534AB7]"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveInfo} disabled={savingInfo} className="flex items-center gap-1 text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded disabled:opacity-50">
                    <Save className="w-3 h-3" /> {savingInfo ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => { setEditingInfo(false); setEditForm({ name: book.name, subject: book.subject, kid: book.kid, grade_level: book.grade_level || "" }); }} className="text-xs border border-border px-3 py-1.5 rounded hover:bg-muted">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: subjectColor }}>
                    {book.subject}
                  </span>
                  <span className="text-xs text-muted-foreground">{book.kid}</span>
                  {book.grade_level && <span className="text-xs text-muted-foreground">· {book.grade_level}</span>}
                  <button onClick={() => setEditingInfo(true)} className="text-muted-foreground hover:text-[#534AB7] transition-colors ml-1">
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
                <h2 className="text-base font-semibold text-foreground">{book.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{completed}/{units.length} lessons</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: subjectColor, width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setConfirmArchive(true)} className="text-xs text-muted-foreground hover:text-red-400 px-2 py-1 rounded border border-border hover:border-red-200 transition-colors">
              Archive
            </button>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Up next */}
        {nextUnit && !editingInfo && (
          <div className="mt-3 border-l-4 border-[#534AB7] bg-[#EEEDFE] px-3 py-2 rounded-r-md">
            <div className="text-xs text-[#534AB7] font-medium mb-0.5">Up next</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground font-medium">{nextUnit.name}</div>
                {nextUnit.pages && <div className="text-xs text-muted-foreground">{nextUnit.pages}</div>}
              </div>
              <button
                onClick={() => toggleUnit(nextUnit.id, true)}
                className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
              >
                <Check className="w-3 h-3" /> Mark done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6 shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-2.5 border-b-2 transition-colors -mb-px ${tab === t ? "border-[#534AB7] text-[#534AB7] font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">

        {/* Lessons */}
        {tab === "Lessons" && (
          <div>
            <div className="space-y-0.5 mb-3">
              {units.map(unit => (
                <div key={unit.id} className="relative">
                  <UnitRow
                    unit={unit}
                    isNext={unit.id === nextUnit?.id}
                    onToggle={(val) => toggleUnit(unit.id, val)}
                    onUpdate={(changes) => updateUnit(unit.id, changes)}
                    onRemove={() => removeUnit(unit.id)}
                    onEditDate={unit.completed ? () => setDatePickerUnitId(unit.id) : null}
                    onSelectLesson={setSelectedLesson}
                  />
                  {datePickerUnitId === unit.id && unit.completion_date && (
                    <CompletionDatePicker
                      initialDate={unit.completion_date}
                      onSelect={(newDate) => updateCompletionDate(unit.id, newDate)}
                      onClose={() => setDatePickerUnitId(null)}
                    />
                  )}
                </div>
              ))}
              {units.length === 0 && <p className="text-xs text-muted-foreground py-4">No lessons yet.</p>}
            </div>
            {addingUnit ? (
              <div className="flex gap-2 mt-2">
                <input
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addUnit(); }}
                  placeholder="Unit name"
                  autoFocus
                  className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                />
                <input
                  value={newUnitPages}
                  onChange={e => setNewUnitPages(e.target.value)}
                  placeholder="Pages"
                  className="w-24 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                />
                <button onClick={addUnit} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded">Add</button>
                <button onClick={() => { setAddingUnit(false); setNewUnitName(""); setNewUnitPages(""); }} className="text-xs border border-border px-2 py-1.5 rounded">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => setAddingUnit(true)} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                  <Plus className="w-3 h-3" /> Add unit
                </button>
                <button onClick={() => setShowScanModal(true)} className="flex items-center gap-1.5 text-xs text-[#534AB7] border border-[#534AB7]/30 px-2.5 py-1.5 rounded-md hover:bg-[#EEEDFE] transition-colors">
                  <Sparkles className="w-3 h-3" /> Import lessons with AI
                </button>
              </div>
            )}

            {/* Scan Modal */}
            {showScanModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => { setShowScanModal(false); setScanPreview(null); setScannedUnits([]); }}>
                <div className="bg-white border border-border rounded-xl w-[480px] max-h-[80vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#534AB7]" />
                      <span className="text-sm font-semibold">Import lessons with AI</span>
                    </div>
                    <button onClick={() => { setShowScanModal(false); setScanPreview(null); setScannedUnits([]); }}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <p className="text-xs text-muted-foreground">Upload a photo of the table of contents or index page — AI will extract the units automatically.</p>
                    <div
                      onClick={() => scanRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors py-8 ${scanPreview ? "border-[#534AB7]/30 bg-[#EEEDFE]/30" : "border-border hover:border-[#534AB7]/50 hover:bg-muted/20"}`}
                    >
                      {scanPreview ? (
                        <img src={scanPreview} alt="preview" className="max-h-40 object-contain rounded" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload table of contents image</span>
                        </>
                      )}
                    </div>
                    <input ref={scanRef} type="file" accept="image/*" className="hidden" onChange={handleScanImage} />

                    {scanning && (
                      <div className="flex items-center justify-center gap-2 py-3 text-sm text-[#534AB7]">
                        <div className="w-4 h-4 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" />
                        Scanning with AI...
                      </div>
                    )}

                    {scannedUnits.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-[#534AB7]">Found {scannedUnits.length} lessons — review before importing:</div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {scannedUnits.map((u, i) => (
                            <div key={u.id} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                              <input
                                value={u.name}
                                onChange={e => setScannedUnits(prev => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                                className="flex-1 text-xs border border-border rounded px-2 py-1 outline-none focus:border-[#534AB7]"
                              />
                              <input
                                value={u.pages}
                                onChange={e => setScannedUnits(prev => prev.map((x, idx) => idx === i ? { ...x, pages: e.target.value } : x))}
                                placeholder="Pages"
                                className="w-20 text-xs border border-border rounded px-2 py-1 outline-none focus:border-[#534AB7]"
                              />
                              <button onClick={() => setScannedUnits(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
                    <button onClick={() => { setShowScanModal(false); setScanPreview(null); setScannedUnits([]); }} className="text-xs border border-border rounded px-3 py-1.5 hover:bg-muted">Cancel</button>
                    <button
                      onClick={importScannedUnits}
                      disabled={scannedUnits.length === 0}
                      className="text-xs bg-[#534AB7] text-white rounded px-4 py-1.5 hover:bg-[#4340a0] disabled:opacity-50"
                    >
                      Import {scannedUnits.length > 0 ? `${scannedUnits.length} lessons` : ""}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Photos */}
        {tab === "Photos" && (
          <BookPhotoGallery book={book} units={units} onRefresh={onRefresh} />
        )}

        {/* Field Trips */}
        {tab === "Field Trips" && (
          <div>
            <div className="space-y-2 mb-4">
              {fieldTrips.length === 0 && !addingTrip && <p className="text-xs text-muted-foreground">No field trips yet.</p>}
              {fieldTrips.map(ft => (
                <div key={ft.id} className="bg-white border border-border rounded-md px-3 py-2.5 flex items-start gap-3 group">
                  <MapPin className="w-3.5 h-3.5 text-[#534AB7] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{ft.title}</div>
                    {ft.date && <div className="text-xs text-muted-foreground">{ft.date}</div>}
                    {ft.unit_id && <div className="text-xs text-muted-foreground">Unit: {units.find(u => u.id === ft.unit_id)?.name}</div>}
                    {ft.note && <div className="text-xs text-muted-foreground mt-1">{ft.note}</div>}
                  </div>
                  <button onClick={() => removeTrip(ft.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {addingTrip ? (
              <div className="space-y-2 bg-muted/20 rounded-md p-3">
                <input value={newTrip.title} onChange={e => setNewTrip(p => ({ ...p, title: e.target.value }))} placeholder="Trip title" className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]" />
                <div className="flex gap-2">
                  <input type="date" value={newTrip.date} onChange={e => setNewTrip(p => ({ ...p, date: e.target.value }))} className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]" />
                  <select value={newTrip.unit_id} onChange={e => setNewTrip(p => ({ ...p, unit_id: e.target.value }))} className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]">
                    <option value="">Link to unit...</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <textarea value={newTrip.note} onChange={e => setNewTrip(p => ({ ...p, note: e.target.value }))} placeholder="Notes (optional)" rows={2} className="w-full text-xs border border-border rounded px-2.5 py-1.5 resize-none outline-none focus:border-[#534AB7]" />
                <div className="flex gap-2">
                  <button onClick={addTrip} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded">Add trip</button>
                  <button onClick={() => setAddingTrip(false)} className="text-xs border border-border rounded px-3 py-1.5">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingTrip(true)} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                <Plus className="w-3 h-3" /> Add field trip
              </button>
            )}
          </div>
        )}

        {/* Notes */}
        {tab === "Notes" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Curriculum notes</label>
              <textarea
                value={bookNotes}
                onChange={e => setBookNotes(e.target.value)}
                placeholder="General notes about this curriculum..."
                rows={4}
                className="w-full text-sm border border-border rounded px-3 py-2 resize-none outline-none focus:border-[#534AB7]"
              />
              <button onClick={saveNotes} disabled={savingNotes} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded mt-1 disabled:opacity-50">
                {savingNotes ? "Saving..." : "Save notes"}
              </button>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Per-lesson notes</div>
              <div className="space-y-2">
                {units.map(u => (
                  <div key={u.id} className="flex items-start gap-2">
                    <span className="text-xs text-foreground w-32 truncate pt-1.5 shrink-0">{u.name}</span>
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

        {/* Schedule */}
        {tab === "Schedule" && (
          <BulkScheduler 
            book={book} 
            units={units} 
            onRefresh={onRefresh}
            onLessonSelected={selectedLesson}
          />
        )}

        {/* Plan */}
        {tab === "Plan" && (
          <BookMiniCalendar book={book} units={units} onRefresh={onRefresh} />
        )}
      </div>

      {/* Archive confirm */}
      {confirmArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setConfirmArchive(false)}>
          <div className="bg-white border border-border rounded-xl w-80 shadow-xl p-5" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-2">Archive this curriculum?</div>
            <p className="text-xs text-muted-foreground mb-4">It will be hidden from your main view but its data is preserved.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmArchive(false)} className="text-xs border border-border rounded px-3 py-1.5">Cancel</button>
              <button onClick={archiveBook} className="text-xs bg-red-500 text-white rounded px-3 py-1.5">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson detail modal */}
      {selectedLesson && (
        <LessonDetailModal
          book={book}
          unit={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onUpdate={onRefresh}
          onViewInSchedule={() => setTab("Schedule")}
        />
      )}
    </div>
  );
}