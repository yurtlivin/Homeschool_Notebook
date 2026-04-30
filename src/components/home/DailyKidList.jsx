import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/constants";

export default function DailyKidList({ kid, items, date, onRefresh }) {
  const [expanded, setExpanded] = useState(true);

  const removeItem = async (id) => {
    await base44.entities.PlannerItem.delete(id);
    onRefresh();
  };

  const kidColor = kid === "Tigerlily" ? { bg: "#EAF3DE", text: "#3B6D11" } : { bg: "#E6F1FB", text: "#0C447C" };

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: kidColor.bg, color: kidColor.text }}>
            {kid}
          </span>
          <span className="text-xs text-muted-foreground">{items.length} assignment{items.length !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="divide-y divide-border">
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground px-4 py-3">No assignments for today.</p>
          )}
          {items.map(item => {
            const subjectColor = SUBJECT_COLORS[item.subject] || "#534AB7";
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 group">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.title}</div>
                  {item.detail && <div className="text-xs text-muted-foreground">{item.detail}</div>}
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.subject}</div>
                </div>
                {item.sub_directions?.length > 0 && (
                  <div className="text-[10px] text-muted-foreground">{item.sub_directions.length} steps</div>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}