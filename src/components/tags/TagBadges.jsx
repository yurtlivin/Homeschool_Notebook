import { useState, useEffect } from "react";
import db from "@/lib/supabaseClient";

export default function TagBadges({ tagIds, limit = 3 }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [tagIds]);

  const loadTags = async () => {
    if (!tagIds || tagIds.length === 0) {
      setTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const allTags = await db.tags.list();
    const filtered = allTags.filter(t => tagIds.includes(t.id));
    setTags(filtered);
    setLoading(false);
  };

  if (loading || tags.length === 0) return null;

  const displayTags = tags.slice(0, limit);
  const remaining = tags.length - limit;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map(tag => (
        <span
          key={tag.id}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-[#534AB7]"
        >
          {tag.name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground bg-muted">
          +{remaining}
        </span>
      )}
    </div>
  );
}