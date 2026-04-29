import { useState } from "react";
import { ChevronDown, ChevronUp, Camera } from "lucide-react";
import { SHARED_ANCHORS } from "@/lib/constants";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";

export default function SharedAnchors({ date, existingChecks, onCheckChange }) {
  const [expanded, setExpanded] = useState({});
  const { activeUser } = useUser();
  const toggle = (name) => setExpanded(p => ({ ...p, [name]: !p[name] }));

  const handleCheck = async (anchor, checked) => {
    const existing = existingChecks.find(c => c.anchor_name === anchor.name && c.kid === "Both");
    if (existing) {
      await base44.entities.AnchorCheck.update(existing.id, { completed: checked });
    } else {
      await base44.entities.AnchorCheck.create({
        date, kid: "Both",
        anchor_name: anchor.name,
        curriculum_name: anchor.curriculum,
        completed: checked,
        logged_by: activeUser,
      });
    }
    onCheckChange();
  };

  const isChecked = (name) => existingChecks.some(c => c.anchor_name === name && c.kid === "Both" && c.completed);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B]">Shared lessons</span>
      </div>
      <div className="space-y-0.5">
        {SHARED_ANCHORS.map(anchor => (
          <div key={anchor.name} className="border border-border rounded-md overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2.5 border-l-4 border-[#EF9F27] bg-[#FAEEDA]/30">
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
              <button onClick={() => toggle(anchor.name)} className="text-muted-foreground hover:text-foreground p-1">
                {expanded[anchor.name] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            {expanded[anchor.name] && (
              <div className="px-3 pb-3 pt-0 border-t border-border bg-[#FAEEDA]/10">
                <textarea
                  placeholder="Lesson notes..."
                  className="w-full text-sm bg-white border-l-4 border-[#EF9F27] border-t border-r border-b border-border rounded px-3 py-2 resize-none min-h-[60px] mt-2 outline-none focus:border-[#EF9F27]"
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