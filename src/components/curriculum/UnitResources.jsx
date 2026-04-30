import { useState } from "react";
import { Plus, Tv, Gamepad2, BookOpen, StickyNote, Link, ExternalLink, Trash2, X } from "lucide-react";

const RESOURCE_TYPES = ["Video", "App", "Article", "Game", "Note/Guide", "Other"];

const TYPE_META = {
  Video:       { icon: Tv,        colors: "bg-red-50 text-red-600 border-red-100" },
  App:         { icon: Gamepad2,  colors: "bg-blue-50 text-blue-600 border-blue-100" },
  Article:     { icon: BookOpen,  colors: "bg-amber-50 text-amber-700 border-amber-100" },
  Game:        { icon: Gamepad2,  colors: "bg-green-50 text-green-600 border-green-100" },
  "Note/Guide":{ icon: StickyNote,colors: "bg-purple-50 text-purple-600 border-purple-100" },
  Other:       { icon: Link,      colors: "bg-slate-50 text-slate-600 border-slate-100" },
};

const EMPTY_RESOURCE = { title: "", type: "Video", link: "", source: "", description: "", checkable: false };

export default function UnitResources({ resources = [], onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_RESOURCE);

  const toggleDone = (id) => {
    onUpdate(resources.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const removeResource = (id) => {
    onUpdate(resources.filter(r => r.id !== id));
  };

  const addResource = () => {
    if (!form.title.trim()) return;
    onUpdate([...resources, { ...form, id: `r-${Date.now()}`, completed: false }]);
    setForm(EMPTY_RESOURCE);
    setShowForm(false);
  };

  const checkable = resources.filter(r => r.checkable);
  const guides = resources.filter(r => !r.checkable);

  return (
    <div className="mt-2 space-y-2">
      {/* Checkable to-dos */}
      {checkable.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">To-do</div>
          <div className="space-y-1.5">
            {checkable.map(r => {
              const { icon: Icon, colors } = TYPE_META[r.type] || TYPE_META.Other;
              return (
                <div key={r.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 border group ${colors} ${r.completed ? "opacity-50" : ""}`}>
                  <input type="checkbox" checked={r.completed} onChange={() => toggleDone(r.id)} className="w-3.5 h-3.5 accent-[#534AB7] cursor-pointer shrink-0" />
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium ${r.completed ? "line-through" : ""}`}>{r.title}</div>
                    {r.source && <div className="text-[10px] opacity-60">{r.source}</div>}
                  </div>
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noreferrer" className="shrink-0">
                      <ExternalLink className="w-3 h-3 opacity-50 hover:opacity-100" />
                    </a>
                  )}
                  <button onClick={() => removeResource(r.id)} className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guides/notes */}
      {guides.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Resources & notes</div>
          <div className="space-y-1.5">
            {guides.map(r => {
              const { icon: Icon, colors } = TYPE_META[r.type] || TYPE_META.Other;
              return (
                <div key={r.id} className={`rounded-lg px-3 py-2 border group ${colors}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-medium flex-1">{r.title}</span>
                    {r.source && <span className="text-[10px] opacity-60">{r.source}</span>}
                    {r.link && (
                      <a href={r.link} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3 h-3 opacity-50 hover:opacity-100" />
                      </a>
                    )}
                    <button onClick={() => removeResource(r.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {r.description && <p className="text-[11px] leading-relaxed opacity-80 ml-5 mt-0.5">{r.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add resource form */}
      {showForm ? (
        <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Add resource</span>
            <button onClick={() => setShowForm(false)}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title (e.g. Solar System Song)"
            className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            >
              {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              placeholder="Source (e.g. Netflix)"
              className="text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            />
          </div>
          <input
            value={form.link}
            onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
            placeholder="URL / link (optional)"
            className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
          />
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Notes / description (optional)"
            rows={2}
            className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7] resize-none"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.checkable}
              onChange={e => setForm(f => ({ ...f, checkable: e.target.checked }))}
              className="w-3.5 h-3.5 accent-[#534AB7]"
            />
            <span className="text-xs text-foreground">Show as to-do in planner &amp; daily list</span>
          </label>
          <div className="flex gap-2">
            <button onClick={addResource} className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded hover:bg-[#4340a0]">Add</button>
            <button onClick={() => setShowForm(false)} className="text-xs border border-border px-3 py-1.5 rounded hover:bg-muted">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
        >
          <Plus className="w-3 h-3" /> Add resource
        </button>
      )}
    </div>
  );
}