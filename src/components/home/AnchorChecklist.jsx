import { useState } from "react";
import { ChevronDown, ChevronUp, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";
import { format } from "date-fns";

export default function AnchorChecklist({ kid, anchors, date, existingChecks, onCheckChange }) {
  const [expanded, setExpanded] = useState({});
  const [notes, setNotes] = useState({});
  const { activeUser } = useUser();

  const toggle = (name) => setExpanded(p => ({ ...p, [name]: !p[name] }));

  const handleCheck = async (anchor, checked) => {
    const existing = existingChecks.find(c => c.anchor_name === anchor.name && c.kid === kid);
    if (existing) {
      await base44.entities.AnchorCheck.update(existing.id, { completed: checked });
    } else {
      await base44.entities.AnchorCheck.create({
        date,
        kid,
        anchor_name: anchor.name,
        curriculum_name: anchor.curriculum,
        completed: checked,
        logged_by: activeUser,
      });
    }
    onCheckChange();
  };

  const isChecked = (name) => existingChecks.some(c => c.anchor_name === name && c.kid === kid && c.completed);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kid === "Tigerlily" ? "bg-[#EAF3DE] text-[#3B6D11]" : "bg-[#E6F1FB] text-[#0C447C]"}`}>
          {kid}
        </div>
        <span className="text-xs text-muted-foreground">daily anchors</span>
      </div>
      <div className="space-y-0.5">
        {anchors.map(anchor => (
          <div key={anchor.name} className="border border-border rounded-md overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <input
                type="checkbox"
                checked={isChecked(anchor.name)}
                onChange={e => handleCheck(anchor, e.target.checked)}
                className="w-4 h-4 accent-[#534AB7] cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{anchor.name}</div>
                <div className="text-xs text-muted-foreground">{anchor.curriculum}</div>
              </div>
              <button
                onClick={() => toggle(anchor.name)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                {expanded[anchor.name] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {expanded[anchor.name] && (
              <div className="px-3 pb-3 pt-0 border-t border-border bg-muted/30">
                <textarea
                  placeholder="Add a note..."
                  value={notes[anchor.name] || ""}
                  onChange={e => setNotes(p => ({ ...p, [anchor.name]: e.target.value }))}
                  className="w-full text-sm bg-white border border-border rounded px-2.5 py-2 resize-none min-h-[60px] mt-2 outline-none focus:border-[#534AB7]"
                />
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Add photo
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}