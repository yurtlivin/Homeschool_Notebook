import { Star } from "lucide-react";
import { TAGS } from "@/lib/constants";
import { useUser } from "@/lib/userContext";

export default function LogEntryCard({ entry }) {
  const { getAvatar } = useUser();

  const getTagStyle = (tagName) => {
    const t = TAGS.find(t => t.name === tagName);
    return t ? { backgroundColor: t.bg, color: t.color } : { backgroundColor: "#F1EFE8", color: "#5F5E5A" };
  };

  return (
    <div className="bg-white border border-border rounded-md px-4 py-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{getAvatar(entry.logged_by)}</span>
          <div>
            <span className="text-xs font-medium text-foreground">{entry.logged_by}</span>
            <span className="text-xs text-muted-foreground mx-1.5">·</span>
            <span className={`text-xs font-medium ${entry.kid === "Tigerlily" ? "text-[#3B6D11]" : entry.kid === "Rowen" ? "text-[#0C447C]" : "text-[#534AB7]"}`}>
              {entry.kid}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {entry.milestone_flag && (
            <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3" /> Milestone
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-foreground mb-2">{entry.content}</p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium" style={getTagStyle(tag)}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {entry.photos && entry.photos.length > 0 && (
        <div className="flex gap-2 mt-2">
          {entry.photos.map((url, i) => (
            <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded border border-border" />
          ))}
        </div>
      )}
    </div>
  );
}