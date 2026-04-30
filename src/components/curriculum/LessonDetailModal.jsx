import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Check, Trash2, Image as ImageIcon } from "lucide-react";

export default function LessonDetailModal({ book, unit, onClose, onUpdate }) {
  const [editing, setEditing] = useState(null); // null | "description" | "tasks"
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCarryOver, setNewTaskCarryOver] = useState(false);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: "",
      completed: false,
      carry_over: newTaskCarryOver,
    };
    const updatedUnits = book.units.map(u =>
      u.id === unit.id
        ? { ...u, tasks: [...(u.tasks || []), newTask] }
        : u
    );
    await base44.entities.CurriculumBook.update(book.id, { units: updatedUnits });
    setNewTaskTitle("");
    setNewTaskCarryOver(false);
    onUpdate();
  };

  const toggleTask = async (taskId) => {
    const updatedUnits = book.units.map(u =>
      u.id === unit.id
        ? {
            ...u,
            tasks: (u.tasks || []).map(t =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            ),
          }
        : u
    );
    await base44.entities.CurriculumBook.update(book.id, { units: updatedUnits });
    onUpdate();
  };

  const removeTask = async (taskId) => {
    const updatedUnits = book.units.map(u =>
      u.id === unit.id
        ? { ...u, tasks: (u.tasks || []).filter(t => t.id !== taskId) }
        : u
    );
    await base44.entities.CurriculumBook.update(book.id, { units: updatedUnits });
    onUpdate();
  };

  const updateDescription = async (desc) => {
    const updatedUnits = book.units.map(u =>
      u.id === unit.id ? { ...u, description: desc } : u
    );
    await base44.entities.CurriculumBook.update(book.id, { units: updatedUnits });
    setEditing(null);
    onUpdate();
  };

  const tasks = unit.tasks || [];
  const carryOverTasks = tasks.filter(t => t.carry_over && !t.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[680px] max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{unit.name}</h2>
              {unit.pages && <div className="text-xs text-muted-foreground mt-1">Pages: {unit.pages}</div>}
            </div>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 shrink-0">
          {["overview", "tasks", "photos"].map(t => (
            <button
              key={t}
              className={`text-xs px-4 py-2.5 border-b-2 transition-colors -mb-px capitalize ${
                editing === t ? "border-[#534AB7] text-[#534AB7]" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Overview */}
          {editing !== "tasks" && editing !== "photos" && (
            <div className="space-y-3">
              {editing === "description" ? (
                <div>
                  <textarea
                    defaultValue={unit.description || ""}
                    onBlur={e => updateDescription(e.target.value)}
                    autoFocus
                    placeholder="Add lesson description..."
                    rows={3}
                    className="w-full text-sm border border-border rounded px-3 py-2 resize-none outline-none focus:border-[#534AB7]"
                  />
                  <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-foreground mt-2">
                    Done
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setEditing("description")}
                  className="bg-muted/30 rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors min-h-[80px] flex items-start"
                >
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-medium mb-1">Lesson Overview</div>
                    <p className="text-sm text-foreground">{unit.description || "Click to add description..."}</p>
                  </div>
                </div>
              )}

              {/* Resources */}
              {unit.resources && unit.resources.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Resources</div>
                  <div className="space-y-1.5">
                    {unit.resources.map(r => (
                      <div key={r.id} className="text-xs bg-white border border-border rounded p-2">
                        <div className="font-medium text-foreground">{r.title}</div>
                        {r.source && <div className="text-muted-foreground">{r.source}</div>}
                        {r.description && <div className="text-muted-foreground mt-1">{r.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tasks */}
          {editing === "tasks" || editing === null ? (
            <div className="space-y-3">
              {carryOverTasks.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-amber-700 mb-2">Carry-over Tasks</div>
                  <div className="space-y-1.5">
                    {carryOverTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleTask(t.id)}
                          className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                        />
                        <span className={`text-xs ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Lesson Tasks</div>
                <div className="space-y-1.5">
                  {tasks.filter(t => !t.carry_over).map(t => (
                    <div key={t.id} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTask(t.id)}
                        className="w-3.5 h-3.5 accent-[#534AB7] cursor-pointer"
                      />
                      <span className={`flex-1 text-xs ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {t.title}
                      </span>
                      <button
                        onClick={() => removeTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add task */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <input
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTask(); }}
                  placeholder="Add task..."
                  className="flex-1 text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
                />
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTaskCarryOver}
                    onChange={e => setNewTaskCarryOver(e.target.checked)}
                    className="w-3 h-3 accent-amber-600"
                  />
                  <span>Carry</span>
                </label>
                <button onClick={addTask} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0]">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Photos */}
          {editing === "photos" || editing === null ? (
            <div className="space-y-3">
              {unit.unit_photos && unit.unit_photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {unit.unit_photos.map(p => (
                    <div key={p.id} className="relative group">
                      <img src={p.url} alt="" className="w-full h-24 object-cover rounded border border-border" />
                      {p.caption && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                          <p className="text-[10px] text-white text-center px-1">{p.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No photos yet. Upload from the Photos tab.</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}