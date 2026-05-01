import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save } from "lucide-react";

export default function ClusterNotespad({ cluster, kid }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteId, setNoteId] = useState(null);

  useEffect(() => {
    loadNotes();
  }, [cluster.id, kid]);

  const loadNotes = async () => {
    const existing = await base44.entities.ClusterNotes.filter({
      cluster_name: cluster.name,
      kid: kid,
    });
    if (existing.length > 0) {
      setNotes(existing[0].notes_content || "");
      setNoteId(existing[0].id);
    } else {
      setNotes("");
      setNoteId(null);
    }
  };

  const saveNotes = async () => {
    if (!notes.trim()) return;
    setSaving(true);

    if (noteId) {
      await base44.entities.ClusterNotes.update(noteId, { notes_content: notes });
    } else {
      const created = await base44.entities.ClusterNotes.create({
        cluster_name: cluster.name,
        kid: kid,
        notes_content: notes,
      });
      setNoteId(created.id);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-2 pb-10">
      <h3 className="text-sm font-semibold text-foreground">Evaluator notes</h3>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Add context, observations, or notes about this cluster..."
        rows={4}
        className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none outline-none focus:border-[#534AB7]"
      />
      <button
        onClick={saveNotes}
        disabled={saving || !notes.trim()}
        className="flex items-center gap-2 text-xs bg-[#534AB7] text-white px-3 py-2 rounded-lg hover:bg-[#4340a0] disabled:opacity-50"
      >
        <Save className="w-3 h-3" />
        {saving ? "Saving..." : "Save notes"}
      </button>
    </div>
  );
}