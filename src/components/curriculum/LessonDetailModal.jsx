import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

export default function LessonDetailModal({ book, unit, onClose, onUpdate, onViewInSchedule }) {
  const [expandedSections, setExpandedSections] = useState({ overview: true, photos: true });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCarryOver, setNewTaskCarryOver] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
    onUpdate();
  };

  const tasks = unit.tasks || [];
  const carryOverCount = tasks.filter(t => t.carry_over && !t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-400 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{unit.name}</h2>
            {unit.pages && <span className="text-xs font-semibold text-slate-600">Pages: {unit.pages}</span>}
          </div>
          <button onClick={onClose} className="p-1 text-slate-700 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 relative">
          {/* Lesson Overview */}
          <div className="border-b border-slate-200 pb-3">
            <button
              onClick={() => toggleSection("overview")}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-lg font-bold text-slate-900">Lesson Overview</span>
              {expandedSections.overview ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
            {expandedSections.overview && (
              <div
                onClick={() => {
                  const text = prompt("Edit lesson overview:", unit.description || "");
                  if (text !== null) updateDescription(text);
                }}
                className="mt-3 cursor-pointer hover:bg-slate-50 p-3 rounded"
              >
                <p className="text-sm text-slate-700 leading-relaxed">
                  {unit.description || "Click to add overview..."}
                </p>
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="border-b border-slate-200 pb-3">
            <button
              onClick={() => toggleSection("resources")}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-lg font-bold text-slate-900">Resources</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
            {expandedSections.resources && unit.resources && unit.resources.length > 0 && (
              <div className="mt-3 space-y-2">
                {unit.resources.map(r => (
                  <div key={r.id} className="text-xs bg-slate-50 p-2 rounded">
                    <div className="font-medium text-slate-900">{r.title}</div>
                    {r.source && <div className="text-slate-600">{r.source}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks/Checklist */}
          <div className="border-b border-slate-200 pb-3">
            <button
              onClick={() => toggleSection("tasks")}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-lg font-bold text-slate-900">Tasks/Checklist</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
            {expandedSections.tasks && (
              <div className="mt-3 space-y-2">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleTask(t.id)}
                      className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                    />
                    <span className={`text-xs flex-1 ${t.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {t.title}
                    </span>
                    {t.carry_over && <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Carry</span>}
                    <button
                      onClick={() => removeTask(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addTask(); }}
                    placeholder="Add task..."
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-blue-400"
                  />
                  <button onClick={addTask} className="text-xs bg-blue-500 text-white px-2 py-1.5 rounded hover:bg-blue-600">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="pb-3">
            <button
              onClick={() => toggleSection("photos")}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-lg font-bold text-slate-900">Photos</span>
              {expandedSections.photos ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
            {expandedSections.photos && (
              <div className="mt-3">
                {unit.unit_photos && unit.unit_photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {unit.unit_photos.map(p => (
                      <img key={p.id} src={p.url} alt="" className="w-full h-20 object-cover rounded border border-slate-200" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No photos yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Carry-over Badge */}
          {carryOverCount > 0 && (
            <div className="fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-full shadow-lg">
              <div className="text-center">
                <div className="text-xl font-bold">{carryOverCount}</div>
                <div className="text-[10px] leading-tight">Carry-over<br />tasks</div>
              </div>
            </div>
          )}
        </div>

        {/* View in Schedule Button */}
        {onViewInSchedule && (
          <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 shrink-0">
            <button
              onClick={() => {
                onViewInSchedule();
                onClose();
              }}
              className="w-full text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 py-2 rounded transition-colors"
            >
              View Assignments in Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}