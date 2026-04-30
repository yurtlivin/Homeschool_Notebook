import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";
import { Plus, Image, X, ChevronDown } from "lucide-react";

export default function QuickAddLesson({ date, onAdded }) {
  const { activeUser } = useUser();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [kid, setKid] = useState("Tigerlily");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    if (open) loadBooks();
  }, [open, kid]);

  const loadBooks = async () => {
    const data = await base44.entities.CurriculumBook.filter({ is_archived: false });
    setBooks(data.filter(b => b.kid === kid || b.kid === "Both"));
  };

  const selectedBook = books.find(b => b.id === selectedBookId);
  const units = selectedBook?.units || [];

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setPhotos(p => [...p, ...urls]);
    setUploading(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput("");
  };

  const save = async () => {
    if (!content.trim() && photos.length === 0) return;
    setSaving(true);

    // Create log entry
    const logEntry = await base44.entities.LogEntry.create({
      date,
      kid,
      logged_by: activeUser,
      content: content.trim(),
      photos,
      tags,
      curriculum_name: selectedBook?.name || undefined,
      curriculum_unit_id: selectedUnitId || undefined,
    });

    // If linked to a unit and that unit has a planner item today, optionally link them
    if (selectedBookId && selectedUnitId) {
      // Also add photo to book's photo gallery linked to the unit
      if (photos.length > 0) {
        const book = books.find(b => b.id === selectedBookId);
        const existingPhotos = book?.photos || [];
        const newPhotos = photos.map(url => ({
          id: `ph-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url,
          unit_id: selectedUnitId,
          caption: content.trim().slice(0, 80),
          date,
        }));
        await base44.entities.CurriculumBook.update(selectedBookId, {
          photos: [...existingPhotos, ...newPhotos]
        });
      }
    }

    setContent(""); setPhotos([]); setTags([]); setTagInput("");
    setSelectedBookId(""); setSelectedUnitId("");
    setSaving(false);
    setOpen(false);
    onAdded();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 bg-white border border-dashed border-[#534AB7] text-[#534AB7] rounded-md px-4 py-3 hover:bg-[#EEEDFE] transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Log a lesson, photo, or moment...
      </button>
    );
  }

  return (
    <div className="bg-white border border-border rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Add to today's log</span>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      {/* Kid selector */}
      <div className="flex gap-2">
        {["Tigerlily", "Rowen", "Both"].map(k => (
          <button
            key={k}
            onClick={() => { setKid(k); setSelectedBookId(""); setSelectedUnitId(""); }}
            className={`flex-1 text-xs py-1.5 rounded border transition-colors ${kid === k ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-foreground hover:bg-muted"}`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What did you learn today? Describe the lesson, activity, or moment..."
        rows={3}
        className="w-full text-sm border border-border rounded px-3 py-2 resize-none outline-none focus:border-[#534AB7]"
        autoFocus
      />

      {/* Link to curriculum */}
      <div className="flex gap-2">
        <select
          value={selectedBookId}
          onChange={e => { setSelectedBookId(e.target.value); setSelectedUnitId(""); }}
          className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
        >
          <option value="">Link to curriculum book...</option>
          {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {selectedBookId && units.length > 0 && (
          <select
            value={selectedUnitId}
            onChange={e => setSelectedUnitId(e.target.value)}
            className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
          >
            <option value="">Link to unit...</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Add tag (e.g. outdoor, math)..."
            className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
          />
          <button onClick={addTag} className="text-xs border border-border px-2.5 py-1.5 rounded hover:bg-muted">+ Tag</button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full">
                {t}
                <button onClick={() => setTags(prev => prev.filter(x => x !== t))}><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs border border-border rounded px-3 py-1.5 hover:bg-muted disabled:opacity-50"
          >
            <Image className="w-3 h-3" />
            {uploading ? "Uploading..." : "Add photos"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </div>
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-14 h-14 object-cover rounded border border-border" />
                <button
                  onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving || (!content.trim() && photos.length === 0)}
        className="w-full text-sm bg-[#534AB7] text-white py-2 rounded hover:bg-[#4340a0] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save entry"}
      </button>
    </div>
  );
}