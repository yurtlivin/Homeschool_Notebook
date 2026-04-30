import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { SUBJECT_COLORS, TIGERLILY_MATH_UNITS } from "@/lib/constants";
import { X } from "lucide-react";

const SUBJECTS = Object.keys(SUBJECT_COLORS);
const KIDS = [
  { value: "Tigerlily", label: "Tigerlily" },
  { value: "Rowen", label: "Rowen" },
  { value: "Both", label: "Shared — both kids" },
];

export default function AddCurriculumModal({ onClose, onAdded }) {
  const [name, setName] = useState("");
  const [kid, setKid] = useState("Tigerlily");
  const [subject, setSubject] = useState("Math");
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    let units = [];
    if (name.trim() === "Math with Confidence Grade 4" && kid === "Tigerlily") {
      units = TIGERLILY_MATH_UNITS.map(u => ({ ...u, completed: false }));
    }
    await base44.entities.CurriculumBook.create({ name: name.trim(), kid, subject, grade_level: grade.trim(), units });
    setSaving(false);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white border border-border rounded-lg w-96 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm font-semibold">Add curriculum</span>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Book / curriculum name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Math with Confidence Grade 4"
              className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-[#534AB7]"
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
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="text-sm border border-border rounded px-4 py-2 hover:bg-muted">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="text-sm bg-[#534AB7] text-white rounded px-4 py-2 hover:bg-[#4340a0] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add curriculum"}
          </button>
        </div>
      </div>
    </div>
  );
}