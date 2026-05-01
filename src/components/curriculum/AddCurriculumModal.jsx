import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { SUBJECT_COLORS } from "@/lib/constants";
import { X, Upload, Sparkles, Plus, Trash2, Settings } from "lucide-react";
import TagSelector from "@/components/tags/TagSelector";
import TagManagementModal from "@/components/tags/TagManagementModal";

const SUBJECTS = Object.keys(SUBJECT_COLORS);
const KIDS = [
  { value: "Tigerlily", label: "Tigerlily" },
  { value: "Rowen", label: "Rowen" },
  { value: "Both", label: "Both" },
];

const EMPTY_ROW = () => ({ name: "", pages: "" });

export default function AddCurriculumModal({ onClose, onAdded }) {
  const [tab, setTab] = useState("scan"); // "scan" | "paste" | "manual"

  // Shared fields
  const [name, setName] = useState("");
  const [kid, setKid] = useState("Tigerlily");
  const [subject, setSubject] = useState("Math");
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);

  // AI scan state
  const [scanImage, setScanImage] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedUnits, setScannedUnits] = useState([]);
  const [scanFileUrl, setScanFileUrl] = useState(null);
  const fileRef = useRef();

  // Manual state
  const [rows, setRows] = useState([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);

  // Paste text state
  const [pastedText, setPastedText] = useState("");
  const [parsingText, setParsingText] = useState(false);
  const [parsedUnits, setParsedUnits] = useState([]);

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [showTagManagement, setShowTagManagement] = useState(false);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanImage(file);
    setScanPreview(URL.createObjectURL(file));
    setScannedUnits([]);
    setName("");
    setGrade("");
  };

  const runScan = async () => {
    if (!scanImage) return;
    setScanning(true);
    const { file_url: uploadedFileUrl } = await base44.integrations.Core.UploadFile({ file: scanImage });
    setScanFileUrl(uploadedFileUrl);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing an image of a homeschool curriculum book (could be cover, table of contents, or index page).
Extract the following information:
- title: the full book/curriculum name
- subject: best match from [Math, English, Science, History, Writing, Reading, Art, Music, PE, Other]
- grade_level: e.g. "Grade 4" or "Level 2" (leave blank if unclear)
- units: an array of chapters/lessons/units found. For each unit extract: name (title of the chapter/lesson) and pages (page range as a string, e.g. "pp. 12–24"). If no page info visible, leave pages blank.
Return ONLY a JSON object. Do not include markdown.`,
      file_urls: [uploadedFileUrl],
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          subject: { type: "string" },
          grade_level: { type: "string" },
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
    setName(result.title || "");
    if (result.subject && SUBJECTS.includes(result.subject)) setSubject(result.subject);
    setGrade(result.grade_level || "");
    setScannedUnits((result.units || []).map((u, i) => ({ ...u, id: `u-${Date.now()}-${i}` })));
    setScanning(false);
  };

  const updateScannedUnit = (i, field, val) => {
    setScannedUnits(prev => prev.map((u, idx) => idx === i ? { ...u, [field]: val } : u));
  };
  const removeScannedUnit = (i) => setScannedUnits(prev => prev.filter((_, idx) => idx !== i));
  const addScannedUnit = () => setScannedUnits(prev => [...prev, { id: `u-${Date.now()}`, name: "", pages: "" }]);

  const runParseText = async () => {
    if (!pastedText.trim()) return;
    setParsingText(true);
    setParsedUnits([]);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a text paste of a curriculum book's table of contents or unit list.
The text may contain chapters, lessons, or units separated by line breaks, numbers, bullets, or other markers.
IMPORTANT: Split each line or logical unit into its own entry. Do NOT combine multiple lines into one unit.
For each unit extract: name (the chapter/lesson title, cleaned up) and pages (page range as a string like "pp. 12–24" or "12-24", leave blank if not visible).
Look for patterns like:
- "Chapter 1: Title pp.1-10"
- "1. Unit Name p.5"
- "- Lesson Name"
- Numbered or bulleted lists with optional page ranges

Return ONLY a JSON object with a "units" array where each item is a separate chapter/lesson/unit.`,
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
    setParsedUnits((result.units || []).map((u, i) => ({ ...u, id: `u-paste-${Date.now()}-${i}` })));
    setParsingText(false);
  };

  const updateParsedUnit = (i, field, val) => setParsedUnits(prev => prev.map((u, idx) => idx === i ? { ...u, [field]: val } : u));
  const removeParsedUnit = (i) => setParsedUnits(prev => prev.filter((_, idx) => idx !== i));
  const addParsedUnit = () => setParsedUnits(prev => [...prev, { id: `u-${Date.now()}`, name: "", pages: "" }]);

  const splitByLines = () => {
    const lines = pastedText.trim().split('\n').filter(line => line.trim().length > 0);
    setParsedUnits(lines.map((line, i) => ({ 
      id: `u-paste-${Date.now()}-${i}`, 
      name: line.trim(), 
      pages: "" 
    })));
  };

  const updateRow = (i, field, val) => setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const removeRow = (i) => setRows(prev => prev.filter((_, idx) => idx !== i));
  const addRow = () => setRows(prev => [...prev, EMPTY_ROW()]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    let units = [];
    if (tab === "scan") {
      units = scannedUnits.filter(u => u.name.trim()).map(u => ({ ...u, completed: false, resources: [] }));
    } else if (tab === "paste") {
      units = parsedUnits.filter(u => u.name.trim()).map(u => ({ ...u, completed: false, resources: [] }));
    } else {
      units = rows.filter(r => r.name.trim()).map((r, i) => ({
        id: `u-${Date.now()}-${i}`,
        name: r.name.trim(),
        pages: r.pages.trim(),
        completed: false,
        resources: [],
      }));
    }

    // Create book first
    const book = await base44.entities.CurriculumBook.create({
      name: name.trim(),
      kid,
      subject,
      grade_level: grade.trim(),
      units,
      ...(tab === "scan" && scanFileUrl ? { cover_image: scanFileUrl } : {})
    });

    // Link tags if any selected
    if (book && selectedTagIds.length > 0) {
      const db = (await import("@/lib/supabaseClient")).default;
      await Promise.all(selectedTagIds.map(tagId =>
        db.bookTags.create({ book_id: book.id, tag_id: tagId })
      ));
    }

    setSaving(false);
    onAdded();
    onClose();
  };

  const canSave = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white border border-border rounded-xl w-[520px] max-h-[90vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <span className="text-sm font-semibold">Add curriculum</span>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {[
            { id: "scan", label: "Scan with AI", icon: Sparkles },
            { id: "paste", label: "Paste Text", icon: Plus },
            { id: "manual", label: "Enter manually", icon: Plus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 text-sm px-5 py-3 border-b-2 transition-colors -mb-px ${tab === id ? "border-[#534AB7] text-[#534AB7] font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* ── SCAN TAB ── */}
          {tab === "scan" && (
            <>
              {/* Image upload */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors py-8 ${scanPreview ? "border-[#534AB7]/30 bg-[#EEEDFE]/30" : "border-border hover:border-[#534AB7]/50 hover:bg-muted/30"}`}
              >
                {scanPreview ? (
                  <img src={scanPreview} alt="preview" className="max-h-40 object-contain rounded" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload book cover or table of contents</span>
                    <span className="text-xs text-muted-foreground mt-1">Any page with chapter/unit info works</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />

              {scanImage && !scanning && scannedUnits.length === 0 && (
                <button
                  onClick={runScan}
                  className="w-full flex items-center justify-center gap-2 text-sm bg-[#534AB7] text-white py-2.5 rounded-lg hover:bg-[#4340a0]"
                >
                  <Sparkles className="w-4 h-4" /> Scan with AI
                </button>
              )}

              {scanning && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#534AB7]">
                  <div className="w-4 h-4 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" />
                  Scanning image...
                </div>
              )}

              {/* AI results */}
              {scannedUnits.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#534AB7]" />
                    <span className="text-xs font-medium text-[#534AB7]">AI extracted {scannedUnits.length} units — review &amp; edit below</span>
                  </div>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {scannedUnits.map((u, i) => (
                      <div key={u.id} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}.</span>
                        <input
                          value={u.name}
                          onChange={e => updateScannedUnit(i, "name", e.target.value)}
                          placeholder="Unit name"
                          className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                        />
                        <input
                          value={u.pages}
                          onChange={e => updateScannedUnit(i, "pages", e.target.value)}
                          placeholder="Pages"
                          className="w-24 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                        />
                        <button onClick={() => removeScannedUnit(i)} className="text-muted-foreground hover:text-red-500 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addScannedUnit} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                    <Plus className="w-3 h-3" /> Add unit
                  </button>
                </div>
              )}
              </>
              )}

              {/* ── PASTE TAB ── */}
              {tab === "paste" && (
                <>
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Paste your table of contents or unit list here... (e.g., 'Chapter 1: Intro pp.1-10\nChapter 2: Advanced pp.11-20')"
                    rows={8}
                    className="w-full text-sm border border-border rounded px-3 py-2 resize-none outline-none focus:border-[#534AB7]"
                  />
                  {!parsingText && parsedUnits.length === 0 && (pastedText.trim().length > 0) && (
                    <div className="flex gap-2">
                      <button
                        onClick={splitByLines}
                        className="flex-1 text-sm border border-[#534AB7] text-[#534AB7] py-2.5 rounded-lg hover:bg-[#EEEDFE]"
                      >
                        Split by Lines
                      </button>
                      <button
                        onClick={runParseText}
                        className="flex-1 flex items-center justify-center gap-2 text-sm bg-[#534AB7] text-white py-2.5 rounded-lg hover:bg-[#4340a0]"
                      >
                        <Sparkles className="w-4 h-4" /> AI Parse
                      </button>
                    </div>
                  )}

                  {parsingText && (
                    <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#534AB7]">
                      <div className="w-4 h-4 border-2 border-[#534AB7] border-t-transparent rounded-full animate-spin" />
                      Parsing text with AI...
                    </div>
                  )}

                  {parsedUnits.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#534AB7]" />
                        <span className="text-xs font-medium text-[#534AB7]">AI parsed {parsedUnits.length} units — review &amp; edit below</span>
                      </div>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {parsedUnits.map((u, i) => (
                          <div key={u.id} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}.</span>
                            <input
                              value={u.name}
                              onChange={e => updateParsedUnit(i, "name", e.target.value)}
                              placeholder="Unit name"
                              className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                            />
                            <input
                              value={u.pages}
                              onChange={e => updateParsedUnit(i, "pages", e.target.value)}
                              placeholder="Pages"
                              className="w-24 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                            />
                            <button onClick={() => removeParsedUnit(i)} className="text-muted-foreground hover:text-red-500 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={addParsedUnit} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                        <Plus className="w-3 h-3" /> Add unit
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── MANUAL TAB ── */}
          {tab === "manual" && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Enter as many units/chapters as you like at once.</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-6">
                <span className="flex-1">Chapter / unit name</span>
                <span className="w-24">Pages</span>
                <span className="w-6" />
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {rows.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}.</span>
                    <input
                      value={row.name}
                      onChange={e => updateRow(i, "name", e.target.value)}
                      placeholder="e.g. Chapter 4: The Solar System"
                      className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                      onKeyDown={e => { if (e.key === "Enter") addRow(); }}
                    />
                    <input
                      value={row.pages}
                      onChange={e => updateRow(i, "pages", e.target.value)}
                      placeholder="pp. 58–74"
                      className="w-24 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                    />
                    <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-red-500 p-1 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addRow} className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline">
                <Plus className="w-3 h-3" /> Add row
              </button>
            </div>
          )}

          {/* ── SHARED FIELDS ── */}
          <div className="border-t border-border pt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Book / curriculum name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Math with Confidence Grade 4"
                className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground block">Tags</label>
                <button
                  onClick={() => setShowTagManagement(true)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" /> Manage
                </button>
              </div>
              <TagSelector
                selectedTagIds={selectedTagIds}
                onTagsChange={setSelectedTagIds}
                onOpenManagement={() => setShowTagManagement(true)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">For</label>
              <div className="flex gap-2">
                {KIDS.map(k => (
                  <button
                    key={k.value}
                    onClick={() => setKid(k.value)}
                    className={`flex-1 text-xs py-2 rounded border transition-colors ${kid === k.value ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-foreground hover:bg-muted"}`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
                >
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Grade / level</label>
                <input
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  placeholder="e.g. Grade 4"
                  className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="text-sm border border-border rounded px-4 py-2 hover:bg-muted">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="text-sm bg-[#534AB7] text-white rounded px-4 py-2 hover:bg-[#4340a0] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add curriculum"}
          </button>
        </div>
        </div>

        {/* Tag Management Modal */}
        {showTagManagement && <TagManagementModal onClose={() => setShowTagManagement(false)} />}
        </div>
        );
        }