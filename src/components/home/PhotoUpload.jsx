import { useState, useRef } from "react";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";

const SUPABASE_URL = "https://hafldoonkbhslibxsqfl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZmxkb29ua2Joc2xpYnhzcWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTU5MDQsImV4cCI6MjA4ODM5MTkwNH0.bpjuUNUjA9ZwXcWoM9iM2WOsBvuFxJByqsLO1WF6dUo";
const BUCKET = "homeschool-media";

export default function PhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccess(false);
    setError(null);

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": file.type,
        },
        body: file,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      setError("Upload failed: " + err);
      setUploading(false);
      return;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/hs_media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        storage_url: publicUrl,
        filename_original: file.name,
        created_at: new Date().toISOString(),
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      setError("Saved photo but failed to record: " + err);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setUploading(false);
    fileRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        {uploading ? "Uploading..." : "Add photo"}
      </button>
      {success && (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Photo saved!
        </span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}