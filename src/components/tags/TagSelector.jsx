import { useState, useEffect } from "react";
import db from "@/lib/supabaseClient";
import { X, Plus } from "lucide-react";

export default function TagSelector({ selectedTagIds, onTagsChange, onOpenManagement }) {
  const [allTags, setAllTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cats, tags] = await Promise.all([
      db.subjectCategories.list(),
      db.tags.list(),
    ]);
    setCategories(cats);
    setAllTags(tags);
    if (cats.length > 0 && !newTagCategory) {
      setNewTagCategory(cats[0].id);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const createNewTag = async () => {
    if (!newTagName.trim() || !newTagCategory) return;

    try {
      const created = await db.tags.create({
        name: newTagName.trim(),
        category_id: newTagCategory,
      });

      if (created) {
        setAllTags([...allTags, created]);
        onTagsChange([...selectedTagIds, created.id]);
        setNewTagName("");
        setShowNewTagForm(false);
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const selectedTags = allTags.filter(t => selectedTagIds.includes(t.id));
  const unselectedTags = allTags.filter(t => !selectedTagIds.includes(t.id));

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-white bg-[#534AB7] hover:bg-[#4340a0] transition-colors"
            >
              {tag.name}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Available tags to add */}
      {unselectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unselectedTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className="px-2.5 py-1.5 rounded-full text-xs border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Add new tag form */}
      {showNewTagForm ? (
        <div className="space-y-2 p-3 border border-dashed border-border rounded-lg bg-muted/20">
          <input
            autoFocus
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") createNewTag();
              if (e.key === "Escape") setShowNewTagForm(false);
            }}
            placeholder="Tag name..."
            className="w-full text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-[#534AB7]"
          />
          <select
            value={newTagCategory}
            onChange={e => setNewTagCategory(e.target.value)}
            className="w-full text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-[#534AB7]"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={createNewTag}
              disabled={!newTagName.trim()}
              className="flex-1 text-xs bg-[#534AB7] text-white px-2 py-1.5 rounded hover:bg-[#4340a0] disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewTagForm(false)}
              className="flex-1 text-xs border border-border rounded px-2 py-1.5 hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewTagForm(true)}
            className="flex items-center gap-1 text-xs text-[#534AB7] hover:text-[#4340a0] font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add tag
          </button>
          <button
            onClick={onOpenManagement}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Manage all tags
          </button>
        </div>
      )}
    </div>
  );
}