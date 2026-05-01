import { useState, useEffect } from "react";
import db from "@/lib/supabaseClient";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";

export default function TagManagementModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [newTagNames, setNewTagNames] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [cats, allTags] = await Promise.all([
      db.subjectCategories.list(),
      db.tags.list(),
    ]);
    setCategories(cats);
    setTags(allTags);
    setLoading(false);
  };

  const addTagToCategory = async (categoryId) => {
    const tagName = newTagNames[categoryId]?.trim();
    if (!tagName) return;

    const newTag = await db.tags.create({
      name: tagName,
      category_id: categoryId,
    });

    if (newTag) {
      setTags([...tags, newTag]);
      setNewTagNames(prev => ({ ...prev, [categoryId]: "" }));
    }
  };

  const updateTagName = async (tagId, newName) => {
    if (!newName.trim()) return;
    
    const updated = await db.tags.update(tagId, { name: newName.trim() });
    if (updated) {
      setTags(tags.map(t => t.id === tagId ? updated : t));
      setEditingTagId(null);
      setEditingTagName("");
    }
  };

  const deleteTag = async (tagId) => {
    const success = await db.tags.delete(tagId);
    if (success) {
      setTags(tags.filter(t => t.id !== tagId));
    }
  };

  const getCategoryTags = (categoryId) => tags.filter(t => t.category_id === categoryId);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl w-96 h-96 flex items-center justify-center">
          <div className="w-6 h-6 border-3 border-[#534AB7] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Manage Tags</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {categories.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
              </div>

              {/* Tags for this category */}
              <div className="space-y-1.5 ml-8 mb-3">
                {getCategoryTags(cat.id).map(tag => (
                  <div key={tag.id} className="flex items-center gap-2 group">
                    {editingTagId === tag.id ? (
                      <>
                        <input
                          autoFocus
                          value={editingTagName}
                          onChange={e => setEditingTagName(e.target.value)}
                          className="flex-1 text-xs border border-[#534AB7] rounded px-2 py-1 outline-none"
                        />
                        <button
                          onClick={() => updateTagName(tag.id, editingTagName)}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#EEEDFE] text-[#534AB7]">
                          {tag.name}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingTagId(tag.id);
                              setEditingTagName(tag.name);
                            }}
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTag(tag.id)}
                            className="text-muted-foreground hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new tag */}
              <div className="ml-8 flex items-center gap-2">
                <input
                  value={newTagNames[cat.id] || ""}
                  onChange={e => setNewTagNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === "Enter") addTagToCategory(cat.id);
                  }}
                  placeholder="New tag..."
                  className="flex-1 text-xs border border-dashed border-border rounded px-2 py-1 outline-none focus:border-[#534AB7]"
                />
                <button
                  onClick={() => addTagToCategory(cat.id)}
                  className="text-[#534AB7] hover:bg-[#EEEDFE] p-1 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}