import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import UnitResources from "./UnitResources";

export default function UnitRow({ unit, isNext, onToggle, onUpdate, onRemove, onEditDate }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(unit.name);
  const [editPages, setEditPages] = useState(unit.pages || "");
  const [hovered, setHovered] = useState(false);
  const [showResources, setShowResources] = useState(false);

  const handleResourcesUpdate = (updatedResources) => {
    onUpdate({ resources: updatedResources });
  };

  const resourceCount = (unit.resources || []).length;

  const saveEdit = () => {
    onUpdate({ name: editName, pages: editPages });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditName(unit.name);
    setEditPages(unit.pages || "");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <input
          value={editName}
          onChange={e => setEditName(e.target.value)}
          className="flex-1 text-xs border border-[#534AB7] rounded px-2 py-1 outline-none"
          autoFocus
        />
        <input
          value={editPages}
          onChange={e => setEditPages(e.target.value)}
          placeholder="Pages"
          className="w-20 text-xs border border-border rounded px-2 py-1 outline-none"
        />
        <button onClick={saveEdit} className="text-green-600 hover:text-green-700 p-1"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground p-1"><X className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div className={`rounded px-1 py-1 transition-colors ${isNext ? "bg-[#EEEDFE]/40" : "hover:bg-muted/40"}`}>
      <div
        className="flex items-center gap-2 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <input
          type="checkbox"
          checked={unit.completed}
          onChange={e => onToggle(e.target.checked)}
          className="w-3.5 h-3.5 accent-[#534AB7] cursor-pointer shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className={`text-xs ${unit.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {unit.name}
          </span>
          {unit.pages && <span className="text-[10px] text-muted-foreground ml-2">{unit.pages}</span>}
        </div>
        {unit.completion_date && (
          <button
            onClick={onEditDate}
            className="text-[10px] text-muted-foreground hover:text-[#534AB7] transition-colors shrink-0 hover:underline"
          >
            {unit.completion_date}
          </button>
        )}
        {hovered && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowResources(r => !r)}
              className="p-1 text-muted-foreground hover:text-[#534AB7] text-[10px] leading-none"
              title="Resources"
            >
              {resourceCount > 0 ? `+${resourceCount}` : "📎"}
            </button>
            <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-foreground">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
        {!hovered && resourceCount > 0 && (
          <button
            onClick={() => setShowResources(r => !r)}
            className="text-[10px] text-[#534AB7] shrink-0"
          >
            +{resourceCount}
          </button>
        )}
      </div>
      {showResources && (
        <div className="ml-5 mt-1">
          <UnitResources
            resources={unit.resources || []}
            onUpdate={handleResourcesUpdate}
          />
        </div>
      )}
    </div>
  );
}