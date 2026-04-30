import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Upload, X } from "lucide-react";

export default function BookPhotoGallery({ book, units, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [linkUnit, setLinkUnit] = useState("");
  const [caption, setCaption] = useState("");
  const fileRef = useRef();

  const photos = book.photos || [];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newPhotos = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newPhotos.push({
        id: `ph-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: file_url,
        unit_id: "",
        caption: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    await base44.entities.CurriculumBook.update(book.id, { photos: [...photos, ...newPhotos] });
    setUploading(false);
    onRefresh();
  };

  const removePhoto = async (id) => {
    await base44.entities.CurriculumBook.update(book.id, { photos: photos.filter(p => p.id !== id) });
    onRefresh();
  };

  const updatePhoto = async (id, changes) => {
    await base44.entities.CurriculumBook.update(book.id, {
      photos: photos.map(p => p.id === id ? { ...p, ...changes } : p)
    });
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-muted-foreground">{photos.length} photo{photos.length !== 1 ? "s" : ""}</div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0] disabled:opacity-50"
        >
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading..." : "Upload photos"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </div>

      {photos.length === 0 && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center py-12 cursor-pointer hover:border-[#534AB7]/50 hover:bg-muted/20 transition-colors"
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Upload photos of learning moments</span>
          <span className="text-xs text-muted-foreground mt-1">Link them to specific units</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {photos.map(photo => (
          <div key={photo.id} className="group relative">
            <img
              src={photo.url}
              alt={photo.caption || ""}
              className="w-full aspect-square object-cover rounded-md border border-border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedPhoto(photo)}
            />
            <button
              onClick={() => removePhoto(photo.id)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 text-white rounded-full p-0.5 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            {photo.unit_id && (
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded truncate max-w-[80%]">
                {units.find(u => u.id === photo.unit_id)?.name || ""}
              </div>
            )}
            {photo.caption && (
              <div className="text-[10px] text-muted-foreground mt-1 truncate">{photo.caption}</div>
            )}
          </div>
        ))}
      </div>

      {/* Photo detail modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Photo details</span>
              <button onClick={() => setSelectedPhoto(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <img src={selectedPhoto.url} alt="" className="w-full object-contain max-h-64" />
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Caption</label>
                <input
                  defaultValue={selectedPhoto.caption || ""}
                  onBlur={e => updatePhoto(selectedPhoto.id, { caption: e.target.value })}
                  placeholder="Add a caption..."
                  className="w-full text-sm border border-border rounded px-3 py-2 outline-none focus:border-[#534AB7]"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Link to unit</label>
                <select
                  defaultValue={selectedPhoto.unit_id || ""}
                  onChange={e => updatePhoto(selectedPhoto.id, { unit_id: e.target.value })}
                  className="w-full text-sm border border-border rounded px-3 py-2 outline-none focus:border-[#534AB7]"
                >
                  <option value="">No unit linked</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="text-xs text-muted-foreground">{selectedPhoto.date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}