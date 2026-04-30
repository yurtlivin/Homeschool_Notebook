import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Link, Tv, Gamepad2, BookOpen, StickyNote, Plus, ExternalLink } from "lucide-react";

const RESOURCE_TYPES = ["Video", "App", "Article", "Game", "Note/Guide", "Other"];

const TYPE_ICONS = {
  Video: Tv,
  App: Gamepad2,
  Article: BookOpen,
  Game: Gamepad2,
  "Note/Guide": StickyNote,
  Other: Link,
};

const TYPE_COLORS = {
  Video: "bg-red-50 text-red-600 border-red-100",
  App: "bg-blue-50 text-blue-600 border-blue-100",
  Article: "bg-amber-50 text-amber-700 border-amber-100",
  Game: "bg-green-50 text-green-600 border-green-100",
  "Note/Guide": "bg-purple-50 text-purple-600 border-purple-100",
  Other: "bg-slate-50 text-slate-600 border-slate-100",
};

const SAMPLE_UNIT = {
  id: "u-1",
  name: "Chapter 4: The Solar System",
  pages: "pp. 58–74",
  completed: false,
  resources: [
    { id: "r-1", title: "Solar System Song", type: "Video", link: "https://youtube.com", source: "YouTube", checkable: true, completed: false },
    { id: "r-2", title: "Planet Explorer", type: "App", source: "App Store", checkable: true, completed: false },
    { id: "r-3", title: "Our Solar System", type: "Video", source: "Netflix", checkable: false, completed: false },
    { id: "r-4", title: "Teacher's note: skip Pluto section", type: "Note/Guide", description: "The textbook still lists Pluto as a planet — skip page 72 and use the supplemental sheet instead.", checkable: false, completed: false },
  ],
};

export default function LessonPreview() {
  const [unit, setUnit] = useState(SAMPLE_UNIT);
  const [expanded, setExpanded] = useState(true);
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", type: "Video", link: "", source: "", description: "", checkable: false });

  const toggleResource = (id) => {
    setUnit(u => ({
      ...u,
      resources: u.resources.map(r => r.id === id ? { ...r, completed: !r.completed } : r),
    }));
  };

  const addResource = () => {
    if (!newResource.title.trim()) return;
    setUnit(u => ({
      ...u,
      resources: [...u.resources, { ...newResource, id: `r-${Date.now()}`, completed: false }],
    }));
    setNewResource({ title: "", type: "Video", link: "", source: "", description: "", checkable: false });
    setShowAddResource(false);
  };

  const checkable = unit.resources.filter(r => r.checkable);
  const guides = unit.resources.filter(r => !r.checkable);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-xs text-muted-foreground mb-3 text-center uppercase tracking-wide font-medium">Lesson card preview</div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Subject bar */}
          <div className="h-1 bg-[#534AB7]" />

          {/* Unit header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={unit.completed}
                  onChange={() => setUnit(u => ({ ...u, completed: !u.completed }))}
                  className="w-4 h-4 mt-0.5 accent-[#534AB7] cursor-pointer shrink-0"
                />
                <div>
                  <div className={`text-sm font-semibold ${unit.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {unit.name}
                  </div>
                  {unit.pages && (
                    <div className="text-xs text-muted-foreground mt-0.5">{unit.pages}</div>
                  )}
                </div>
              </div>
              <button onClick={() => setExpanded(e => !e)} className="p-1 text-muted-foreground hover:text-foreground shrink-0">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {expanded && (
            <div className="border-t border-border">
              {/* Checkable resources (tasks) */}
              {checkable.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">To-do with this lesson</div>
                  <div className="space-y-2">
                    {checkable.map(r => {
                      const Icon = TYPE_ICONS[r.type] || Link;
                      return (
                        <div key={r.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors ${r.completed ? "opacity-50" : ""} ${TYPE_COLORS[r.type] || TYPE_COLORS.Other}`}>
                          <input
                            type="checkbox"
                            checked={r.completed}
                            onChange={() => toggleResource(r.id)}
                            className="w-3.5 h-3.5 accent-[#534AB7] cursor-pointer shrink-0"
                          />
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${r.completed ? "line-through" : ""}`}>{r.title}</div>
                            {r.source && <div className="text-[10px] opacity-70">{r.source}</div>}
                          </div>
                          {r.link && (
                            <a href={r.link} target="_blank" rel="noreferrer" className="shrink-0">
                              <ExternalLink className="w-3 h-3 opacity-50 hover:opacity-100" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guides/notes/resources */}
              {guides.length > 0 && (
                <div className="px-4 pt-2 pb-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Resources & notes</div>
                  <div className="space-y-2">
                    {guides.map(r => {
                      const Icon = TYPE_ICONS[r.type] || Link;
                      return (
                        <div key={r.id} className={`rounded-lg px-3 py-2.5 border ${TYPE_COLORS[r.type] || TYPE_COLORS.Other}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-medium">{r.title}</span>
                            {r.source && <span className="text-[10px] opacity-60 ml-auto">{r.source}</span>}
                            {r.link && (
                              <a href={r.link} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-3 h-3 opacity-50 hover:opacity-100" />
                              </a>
                            )}
                          </div>
                          {r.description && (
                            <p className="text-[11px] leading-relaxed opacity-80 ml-5">{r.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add resource */}
              {showAddResource ? (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-2.5">
                  <div className="text-xs font-medium text-foreground pt-1">Add resource</div>
                  <input
                    value={newResource.title}
                    onChange={e => setNewResource(r => ({ ...r, title: e.target.value }))}
                    placeholder="Title (e.g. Solar System Song)"
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newResource.type}
                      onChange={e => setNewResource(r => ({ ...r, type: e.target.value }))}
                      className="text-xs border border-border rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
                    >
                      {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input
                      value={newResource.source}
                      onChange={e => setNewResource(r => ({ ...r, source: e.target.value }))}
                      placeholder="Source (e.g. Netflix)"
                      className="text-xs border border-border rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
                    />
                  </div>
                  <input
                    value={newResource.link}
                    onChange={e => setNewResource(r => ({ ...r, link: e.target.value }))}
                    placeholder="Link / URL (optional)"
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 outline-none focus:border-[#534AB7]"
                  />
                  <textarea
                    value={newResource.description}
                    onChange={e => setNewResource(r => ({ ...r, description: e.target.value }))}
                    placeholder="Notes / description (optional)"
                    rows={2}
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 outline-none focus:border-[#534AB7] resize-none"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newResource.checkable}
                      onChange={e => setNewResource(r => ({ ...r, checkable: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-[#534AB7]"
                    />
                    <span className="text-xs text-foreground">Show as a to-do in planner & daily list</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={addResource} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded-lg hover:bg-[#4340a0]">Add</button>
                    <button onClick={() => setShowAddResource(false)} className="text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => setShowAddResource(true)}
                    className="flex items-center gap-1.5 text-xs text-[#534AB7] hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add resource
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}