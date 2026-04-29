import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function UnitRow({ unit, isNext, onToggle, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(unit.name);
  const [editPages, setEditPages] = useState(unit.pages || "");

  const save = () => {
    onUpdate({ name: editName, pages: editPages });
    setEditing(false);
  };

  return (
    <div
      className={`group flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
        isNext ? "bg-[#EEEDFE]" : unit.completed ? "opacity-50" : "hover:bg-muted/50"
      }`}
    >
      <input
        type="checkbox"
        checked={unit.completed}
        onChange={e => onToggle(e.target.checked)}
        className="w-3.5 h-3.5 accent-[#534AB7] cursor-pointer shrink-0"
      />
      {editing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="flex-1 border border-[#534AB7] rounded px-1.5 py-0.5 text-xs outline-none"
            autoFocus
          />
          <input
            value={editPages}
            onChange={e => setEditPages(e.target.value)}
            className="w-16 border border-border rounded px-1.5 py-0.5 text-xs outline-none"
            placeholder="Pages"
          />
          <button onClick={save} className="text-green-600 hover:text-green-700"><Check className="w-3 h-3" /></button>
          <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`flex-1 truncate ${unit.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {unit.name}
          </span>
          {unit.pages && <span className="text-muted-foreground shrink-0">{unit.pages}</span>}
          {unit.completion_date && (
            <span className="text-muted-foreground text-[10px] shrink-0">{unit.completion_date}</span>
          )}
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={onRemove} className="text-muted-foreground hover:text-red-500">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}